
import sys
import warnings
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

warnings.filterwarnings("ignore", category=FutureWarning)

def _build_features(returns: pd.Series) -> pd.DataFrame:

    df = pd.DataFrame({"ret": returns})

    for w in [5, 10, 20]:
        df[f"rolling_std_{w}"]  = df["ret"].rolling(w).std()
        df[f"rolling_mean_{w}"] = df["ret"].rolling(w).mean()
    df["ema_12"] = df["ret"].ewm(span=12, adjust=False).mean()
    df["ema_26"] = df["ret"].ewm(span=26, adjust=False).mean()

    sma20 = df["ret"].rolling(20).mean()
    std20 = df["ret"].rolling(20).std()
    df["bollinger_bw_20"] = np.where(sma20 != 0, std20 / sma20.abs(), 0.0)
    delta = df["ret"]
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = np.where(loss != 0, gain / loss, 0.0)
    df["rsi_14"] = 100.0 - (100.0 / (1.0 + rs))

    for lag in range(1, 6):
        df[f"lag_{lag}"] = df["ret"].shift(lag)

    if hasattr(df.index, "dayofweek"):
        df["day_of_week"] = df.index.dayofweek
    else:
        df["day_of_week"] = 0

    df["return_skew_20"] = df["ret"].rolling(20).skew()
    df["return_kurt_20"] = df["ret"].rolling(20).kurt()

    return df


def _build_labels(returns: pd.Series, horizon: int) -> pd.Series:
    fwd_vol = returns.rolling(horizon).std().shift(-horizon) * np.sqrt(252)
    return fwd_vol


def _train_and_predict(features: pd.DataFrame, labels: pd.Series):
    mask = features.notna().all(axis=1) & labels.notna()
    X = features.loc[mask]
    y = labels.loc[mask]

    if len(X) < 60:
        return None, None

    model = RandomForestRegressor(
        n_estimators=500,
        max_depth=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X.values, y.values)

    latest = features.dropna().iloc[[-1]]
    prediction = float(model.predict(latest.values)[0])

    importances = dict(
        sorted(
            zip(features.columns, model.feature_importances_),
            key=lambda x: x[1],
            reverse=True,
        )[:5]
    )
    importances = {k: round(float(v), 4) for k, v in importances.items()}

    return prediction, importances


def forecast_volatility(returns: pd.DataFrame, weights: list) -> dict:

    try:
        weights_arr = np.array(weights)
        port_returns = returns.dot(weights_arr)
        port_returns.name = "portfolio"

        features = _build_features(port_returns)
        feature_cols = [c for c in features.columns if c != "ret"]
        X = features[feature_cols]

        results = {}
        all_importances = {}
        used_historical = False

        for horizon in [5, 10, 30]:
            labels = _build_labels(port_returns, horizon)
            pred, imp = _train_and_predict(X, labels)

            key = f"vol_{horizon}d"
            if pred is not None:
                results[key] = round(pred, 6)
                if imp:
                    all_importances[key] = imp
            else:
                rolling_std = port_returns.rolling(horizon).std()
                last_val = rolling_std.iloc[-1] if len(rolling_std) > 0 else np.nan
                if np.isnan(last_val):
                    # Not enough data even for rolling window — use full-sample std
                    last_val = port_returns.std() if len(port_returns) > 1 else 0.0
                hist_vol = float(last_val * np.sqrt(252))
                results[key] = round(hist_vol, 6)
                used_historical = True

        n_rows = len(port_returns.dropna())
        if n_rows >= 252 and not used_historical:
            confidence = "high"
        elif n_rows >= 120:
            confidence = "medium"
        else:
            confidence = "low"
        if used_historical:
            confidence = "historical"

        results["confidence"] = confidence
        results["feature_importance"] = all_importances if all_importances else "insufficient_data"

        return results

    except Exception as exc:
        print(f"[volatility_forecast] Error: {exc}", file=sys.stderr)
        return {
            "vol_5d": None,
            "vol_10d": None,
            "vol_30d": None,
            "confidence": "error",
            "feature_importance": "error",
            "error": str(exc),
        }