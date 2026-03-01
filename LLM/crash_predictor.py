import sys
import time
import warnings
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.ensemble import GradientBoostingClassifier

warnings.filterwarnings("ignore", category=FutureWarning)

DRAWDOWN_THRESHOLD = -0.05
FORWARD_WINDOW     = 30
VIX_TICKER         = "^VIX"
VIX_FETCH_RETRIES  = 3
VIX_RETRY_DELAY    = 1.5


def _fetch_vix(start: str, end: str) -> pd.Series:
    for attempt in range(VIX_FETCH_RETRIES):
        try:
            vix = yf.download(VIX_TICKER, start=start, end=end, progress=False)
            if vix is None or vix.empty:
                raise ValueError("Empty VIX response")
            if "Close" in vix.columns:
                out = vix["Close"].squeeze()
            elif "Adj Close" in vix.columns:
                out = vix["Adj Close"].squeeze()
            else:
                out = pd.Series(dtype=float)
            if out.empty or len(out.dropna()) < 2:
                raise ValueError("Insufficient VIX data")
            return out
        except Exception:
            if attempt < VIX_FETCH_RETRIES - 1:
                time.sleep(VIX_RETRY_DELAY)
            else:
                return pd.Series(dtype=float)
    return pd.Series(dtype=float)


def _compute_rolling_drawdown(returns: pd.Series, window: int = 60) -> pd.Series:
    cum = (1 + returns).rolling(window).apply(
        lambda x: np.prod(x), raw=True
    )
    rolling_max = cum.rolling(window, min_periods=1).max()
    drawdown = (cum - rolling_max) / rolling_max
    return drawdown


def _build_crash_features(
    port_returns: pd.Series,
    vix_series: pd.Series,
    sentiment_score: float,
) -> pd.DataFrame:

    df = pd.DataFrame(index=port_returns.index)

    for w in [10, 20, 60]:
        df[f"vol_{w}"] = port_returns.rolling(w).std() * np.sqrt(252)

    df["vol_of_vol_20"] = df["vol_20"].rolling(20).std()
    if not vix_series.empty:
        vix_aligned = vix_series.reindex(df.index, method="ffill")
        df["vix_level"]          = vix_aligned
        df["vix_pct_change_5"]   = vix_aligned.pct_change(5)
        df["vix_pct_change_20"]  = vix_aligned.pct_change(20)
    else:
        df["vix_level"]          = 20.0   
        df["vix_pct_change_5"]   = 0.0
        df["vix_pct_change_20"]  = 0.0
    df["sentiment"] = sentiment_score

    df["rolling_drawdown_60"] = _compute_rolling_drawdown(port_returns, 60)

    df["skew_20"]  = port_returns.rolling(20).skew()
    df["kurt_20"]  = port_returns.rolling(20).kurt()

    df["momentum_20"] = port_returns.rolling(20).sum()
    df["momentum_60"] = port_returns.rolling(60).sum()

    mean_5  = port_returns.rolling(5).mean()
    mean_60 = port_returns.rolling(60).mean()
    std_60  = port_returns.rolling(60).std()
    df["mean_rev_signal"] = np.where(std_60 != 0, (mean_5 - mean_60) / std_60, 0.0)

    return df


def _build_crash_labels(port_returns: pd.Series) -> pd.Series:
    fwd_cum = port_returns.rolling(FORWARD_WINDOW).sum().shift(-FORWARD_WINDOW)
    return (fwd_cum < DRAWDOWN_THRESHOLD).astype(int)


def predict_crash_probability(
    returns: pd.DataFrame,
    weights: list,
    start: str,
    end: str,
    sentiment_score: float = 0.0,
) -> dict:

    try:
        weights_arr  = np.array(weights)
        port_returns = returns.dot(weights_arr)
        port_returns.name = "portfolio"

        vix_series = _fetch_vix(start, end)

        features = _build_crash_features(port_returns, vix_series, sentiment_score)
        labels   = _build_crash_labels(port_returns)

        mask = features.notna().all(axis=1) & labels.notna()
        X = features.loc[mask]
        y = labels.loc[mask]
        vix_available = not vix_series.empty
        vix_current = float(vix_series.iloc[-1]) if vix_available else None

        if len(X) < 100 or y.sum() < 5:
            return {
                "crash_probability": None,
                "risk_level": None,
                "contributing_factors": [],
                "vix_current": round(vix_current, 2) if vix_current is not None else None,
                "vix_available": vix_available,
                "method": "insufficient_data",
                "message": "Need at least 1Y history and 5 crash events for ML estimate.",
            }

        # --- Time-series aware train/test split ---
        # Use all data except the last FORWARD_WINDOW rows for training;
        # predict on the very last available feature row.
        # This avoids training on the same window we're predicting for.
        split_idx = max(int(len(X) * 0.8), len(X) - FORWARD_WINDOW)
        X_train, y_train = X.iloc[:split_idx], y.iloc[:split_idx]

        if len(X_train) < 60 or y_train.sum() < 3:
            return {
                "crash_probability": None,
                "risk_level": None,
                "contributing_factors": [],
                "vix_current": round(vix_current, 2) if vix_current is not None else None,
                "vix_available": vix_available,
                "method": "insufficient_data",
                "message": "Not enough training data after time-series split.",
            }

        model = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=3,            # reduced depth to lower overfitting
            learning_rate=0.05,     # slower learning for better generalisation
            subsample=0.8,
            min_samples_leaf=10,    # prevent memorising small clusters
            random_state=42,
        )
        model.fit(X_train.values, y_train.values)

        latest = features.dropna().iloc[[-1]]
        raw_proba = float(model.predict_proba(latest.values)[0, 1])

        # Clip to avoid certainty (0.0 or 1.0) from small-sample models
        proba = float(np.clip(raw_proba, 0.02, 0.95))

        imp = sorted(
            zip(features.columns, model.feature_importances_),
            key=lambda x: x[1], reverse=True,
        )[:4]
        factors = [{"feature": f, "importance": round(float(v), 4)} for f, v in imp]

        return {
            "crash_probability": round(proba, 4),
            "risk_level": _risk_bucket(proba),
            "contributing_factors": factors,
            "vix_current": round(vix_current, 2) if vix_current is not None else None,
            "vix_available": vix_available,
            "method": "ml",
        }

    except Exception as exc:
        print(f"[crash_predictor] Error: {exc}", file=sys.stderr)
        return {
            "crash_probability": None,
            "risk_level": None,
            "contributing_factors": [],
            "vix_current": None,
            "vix_available": False,
            "method": "error",
            "error": str(exc),
        }


def _risk_bucket(p: float) -> str:
    if p >= 0.70:
        return "CRITICAL"
    if p >= 0.40:
        return "HIGH"
    if p >= 0.20:
        return "MODERATE"
    return "LOW"