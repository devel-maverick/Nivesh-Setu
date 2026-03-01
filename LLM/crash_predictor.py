import sys
import warnings
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.ensemble import GradientBoostingClassifier

warnings.filterwarnings("ignore", category=FutureWarning)

DRAWDOWN_THRESHOLD = -0.05   
FORWARD_WINDOW     = 30      
VIX_TICKER         = "^VIX"

def _fetch_vix(start: str, end: str) -> pd.Series:
    try:
        vix = yf.download(VIX_TICKER, start=start, end=end, progress=False)
        if "Close" in vix.columns:
            return vix["Close"].squeeze()
        elif "Adj Close" in vix.columns:
            return vix["Adj Close"].squeeze()
        return pd.Series(dtype=float)
    except Exception:
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
        vix_current = float(vix_series.iloc[-1]) if not vix_series.empty else 20.0
        if len(X) < 100 or y.sum() < 5:
            return _heuristic_fallback(port_returns, vix_current, sentiment_score)

        model = GradientBoostingClassifier(
            n_estimators=200,
            max_depth=4,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42,
        )
        model.fit(X.values, y.values)

        latest = features.dropna().iloc[[-1]]
        ml_proba = float(model.predict_proba(latest.values)[0, 1])

        # Blend: use heuristic as a floor so we never show 0.0 in bull markets
        heuristic = _heuristic_fallback(port_returns, vix_current, sentiment_score)
        heuristic_p = heuristic["crash_probability"]
        proba = max(ml_proba, heuristic_p * 0.5)  # heuristic floor at 50% weight

        imp = sorted(
            zip(features.columns, model.feature_importances_),
            key=lambda x: x[1], reverse=True,
        )[:4]
        factors = [{"feature": f, "importance": round(float(v), 4)} for f, v in imp]

        return {
            "crash_probability": round(proba, 4),
            "risk_level": _risk_bucket(proba),
            "contributing_factors": factors,
            "vix_current": round(vix_current, 2),
            "method": "ml_with_heuristic_floor",
        }

    except Exception as exc:
        print(f"[crash_predictor] Error: {exc}", file=sys.stderr)
        return _heuristic_fallback(
            returns.dot(np.array(weights)),
            20.0,
            sentiment_score,
        )


def _risk_bucket(p: float) -> str:
    if p >= 0.70:
        return "CRITICAL"
    if p >= 0.40:
        return "HIGH"
    if p >= 0.20:
        return "MODERATE"
    return "LOW"


def _heuristic_fallback(
    port_returns: pd.Series,
    vix: float,
    sentiment: float,
) -> dict:
    vol = float(port_returns.std() * np.sqrt(252)) if len(port_returns) > 1 else 0.2

    score = 0.0
    score += min(vol / 0.60, 0.35)               
    score += min(max(vix - 15, 0) / 50, 0.35)    
    score += max(-sentiment, 0) * 0.30            
    score = min(score, 0.95)

    return {
        "crash_probability": round(score, 4),
        "risk_level": _risk_bucket(score),
        "contributing_factors": [
            {"feature": "heuristic_volatility", "importance": round(vol, 4)},
            {"feature": "heuristic_vix", "importance": round(vix, 2)},
        ],
        "vix_current": round(vix, 2),
    }