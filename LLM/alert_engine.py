import sys
import warnings
from datetime import datetime
from typing import Optional
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

warnings.filterwarnings("ignore", category=FutureWarning)

DEFAULT_THRESHOLDS = {
    "volatility_spike": {
        "warning":  0.30,  
        "critical": 0.50,  
    },
    "max_drawdown": {
        "warning":  -0.10,  
        "critical": -0.20,  
    },
    "var_breach": {
        "warning":  -0.02,  
        "critical": -0.05,  
    },
    "correlation_breakdown": {
        "warning":  0.85,   
    },
    "sentiment_reversal": {
        "warning":  -0.40,  
        "critical": -0.70,  
    },
    "vix_spike": {
        "warning":  25.0,
        "critical": 35.0,
    },
    "sharpe_degradation": {
        "warning":  0.3,    
        "critical": 0.0,    
    },
}


def _rule_check(
    metrics: dict,
    sentiment_score: float,
    vix_current: float,
    correlation_matrix,
    thresholds: dict,
) -> list:
    alerts = []
    now = datetime.utcnow().isoformat() + "Z"

    vol = metrics.get("volatility", 0)
    t = thresholds["volatility_spike"]
    if vol >= t["critical"]:
        alerts.append(_alert(
            "VOLATILITY_SPIKE", "CRITICAL",
            f"Portfolio annualised volatility ({vol:.1%}) exceeds critical "
            f"threshold ({t['critical']:.0%}).",
            vol, t["critical"], now,
        ))
    elif vol >= t["warning"]:
        alerts.append(_alert(
            "VOLATILITY_SPIKE", "WARNING",
            f"Portfolio annualised volatility ({vol:.1%}) is elevated "
            f"(threshold {t['warning']:.0%}).",
            vol, t["warning"], now,
        ))

    mdd = metrics.get("max_drawdown", 0)
    t = thresholds["max_drawdown"]
    if mdd <= t["critical"]:
        alerts.append(_alert(
            "MAX_DRAWDOWN", "CRITICAL",
            f"Rolling max drawdown ({mdd:.1%}) breached critical level "
            f"({t['critical']:.0%}).",
            mdd, t["critical"], now,
        ))
    elif mdd <= t["warning"]:
        alerts.append(_alert(
            "MAX_DRAWDOWN", "WARNING",
            f"Rolling max drawdown ({mdd:.1%}) exceeds warning level "
            f"({t['warning']:.0%}).",
            mdd, t["warning"], now,
        ))

    var95 = metrics.get("var_95", 0)
    t = thresholds["var_breach"]
    if var95 <= t["critical"]:
        alerts.append(_alert(
            "VAR_BREACH", "CRITICAL",
            f"95 % VaR ({var95:.2%}) worse than critical threshold "
            f"({t['critical']:.0%}).",
            var95, t["critical"], now,
        ))
    elif var95 <= t["warning"]:
        alerts.append(_alert(
            "VAR_BREACH", "WARNING",
            f"95 % VaR ({var95:.2%}) worse than warning threshold "
            f"({t['warning']:.0%}).",
            var95, t["warning"], now,
        ))

    t = thresholds["correlation_breakdown"]
    if correlation_matrix is not None:
        try:
            corr = correlation_matrix.values if hasattr(correlation_matrix, "values") else np.array(correlation_matrix)
            n = corr.shape[0]
            if n > 1:
                mask = np.triu(np.ones_like(corr, dtype=bool), k=1)
                avg_corr = float(np.mean(corr[mask]))
                if avg_corr >= t["warning"]:
                    alerts.append(_alert(
                        "CORRELATION_BREAKDOWN", "WARNING",
                        f"Average pairwise correlation ({avg_corr:.2f}) is very high "
                        f"— diversification may be illusory.",
                        avg_corr, t["warning"], now,
                    ))
        except Exception:
            pass

    t = thresholds["sentiment_reversal"]
    if sentiment_score <= t.get("critical", -999):
        alerts.append(_alert(
            "SENTIMENT_REVERSAL", "CRITICAL",
            f"Sentiment score ({sentiment_score:.2f}) indicates extreme fear.",
            sentiment_score, t["critical"], now,
        ))
    elif sentiment_score <= t["warning"]:
        alerts.append(_alert(
            "SENTIMENT_REVERSAL", "WARNING",
            f"Sentiment score ({sentiment_score:.2f}) is negative — "
            f"market mood is bearish.",
            sentiment_score, t["warning"], now,
        ))

    t = thresholds["vix_spike"]
    if vix_current >= t["critical"]:
        alerts.append(_alert(
            "VIX_SPIKE", "CRITICAL",
            f"VIX ({vix_current:.1f}) exceeds critical level ({t['critical']}).",
            vix_current, t["critical"], now,
        ))
    elif vix_current >= t["warning"]:
        alerts.append(_alert(
            "VIX_SPIKE", "WARNING",
            f"VIX ({vix_current:.1f}) is elevated (threshold {t['warning']}).",
            vix_current, t["warning"], now,
        ))

    t = thresholds["sharpe_degradation"]
    sharpe = metrics.get("sharpe_ratio", 1.0)
    if sharpe < t["critical"]:
        alerts.append(_alert(
            "SHARPE_DEGRADATION", "CRITICAL",
            f"Sharpe ratio ({sharpe:.2f}) is negative — portfolio is "
            f"destroying risk-adjusted value.",
            sharpe, t["critical"], now,
        ))
    elif sharpe < t["warning"]:
        alerts.append(_alert(
            "SHARPE_DEGRADATION", "WARNING",
            f"Sharpe ratio ({sharpe:.2f}) is below acceptable level "
            f"({t['warning']}).",
            sharpe, t["warning"], now,
        ))

    if not alerts:
        alerts.append(_alert(
            "ALL_CLEAR", "INFO",
            "All risk indicators are within normal ranges.",
            0.0, 0.0, now,
        ))

    return alerts


def _anomaly_scan(returns: pd.DataFrame, weights: list) -> list:
    try:
        weights_arr  = np.array(weights)
        port_returns = returns.dot(weights_arr)

        df = pd.DataFrame(index=port_returns.index)
        df["vol_10"]      = port_returns.rolling(10).std() * np.sqrt(252)
        df["vol_20"]      = port_returns.rolling(20).std() * np.sqrt(252)
        df["skew_20"]     = port_returns.rolling(20).skew()
        df["kurt_20"]     = port_returns.rolling(20).kurt()
        df["momentum_10"] = port_returns.rolling(10).sum()
        df["momentum_20"] = port_returns.rolling(20).sum()
        df = df.dropna()

        if len(df) < 60:
            return []

        model = IsolationForest(
            n_estimators=200,
            contamination=0.05,
            random_state=42,
            n_jobs=-1,
        )
        model.fit(df.values)

        score = float(model.decision_function(df.iloc[[-1]].values)[0])
        is_anomaly = model.predict(df.iloc[[-1]].values)[0] == -1

        if is_anomaly:
            now = datetime.utcnow().isoformat() + "Z"
            return [_alert(
                "ANOMALY_DETECTED", "WARNING",
                f"IsolationForest detected an unusual market regime "
                f"(anomaly score: {score:.3f}). Review portfolio exposure.",
                score, 0.0, now,
            )]
        return []

    except Exception as exc:
        print(f"[alert_engine] anomaly scan error: {exc}", file=sys.stderr)
        return []


def _alert(alert_type, severity, message, value, threshold, ts):
    return {
        "type": alert_type,
        "severity": severity,
        "message": message,
        "value": round(float(value), 6) if value is not None else None,
        "threshold": round(float(threshold), 6) if threshold is not None else None,
        "timestamp": ts,
    }


def generate_alerts(
    metrics: dict,
    returns: pd.DataFrame,
    weights: list,
    sentiment_score: float = 0.0,
    vix_current: float = 20.0,
    correlation_matrix=None,
    thresholds: Optional[dict] = None,
) -> list:
    try:
        t = {**DEFAULT_THRESHOLDS, **(thresholds or {})}

        alerts  = _rule_check(metrics, sentiment_score, vix_current, correlation_matrix, t)
        alerts += _anomaly_scan(returns, weights)

        severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
        alerts.sort(key=lambda a: severity_order.get(a["severity"], 99))

        return alerts

    except Exception as exc:
        print(f"[alert_engine] Error: {exc}", file=sys.stderr)
        now = datetime.utcnow().isoformat() + "Z"
        return [_alert(
            "ENGINE_ERROR", "WARNING",
            f"Alert engine encountered an error: {exc}",
            0.0, 0.0, now,
        )]