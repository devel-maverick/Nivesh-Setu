import sys
import json

from preprocessing import fetch_price_data, compute_returns
from sentiment import get_sentiment_score
from riskmetrics import portfolio_metrics
from montecarlo import run_monte_carlo
from beta import calculate_portfolio_beta
from scenario import apply_scenario
from timeframe import parse_timeframe
from portfolio_loader import load_portfolio_csv

from volatility_forecast import forecast_volatility
from crash_predictor import predict_crash_probability
from alert_engine import generate_alerts


def run_analysis(input_data):
    if "csv_path" in input_data:
        tickers, weights = load_portfolio_csv(input_data["csv_path"])
    else:
        tickers = input_data["tickers"]
        weights = input_data["weights"]

    if "timeframe" in input_data:
        start, end = parse_timeframe(input_data["timeframe"])
    else:
        start = input_data["start"]
        end = input_data["end"]
    price_data = fetch_price_data(tickers, start, end)
    returns = compute_returns(price_data)

    metrics = portfolio_metrics(returns, weights)
    portfolio_return = metrics["expected_return"]
    portfolio_vol = metrics["volatility"]
    sharpe_ratio = metrics["sharpe_ratio"]
    correlation_matrix = metrics["correlation_matrix"]
    cov_matrix = metrics["cov_matrix"]

    portfolio_beta, individual_betas = calculate_portfolio_beta(
        returns, weights, start, end
    )
    sentiment_score = get_sentiment_score(tickers[0])
    if sentiment_score > 0.3:
        portfolio_vol *= 1.2
        regime = "Excitement"
    elif sentiment_score < -0.3:
        portfolio_vol *= 1.3
        regime = "Fear"
    else:
        regime = "Neutral"

    var_95 = run_monte_carlo(
        returns.mean(),
        cov_matrix,
        weights
    )

    scenario_result = None
    if "shock" in input_data:
        scenario_result = apply_scenario(
            returns,
            weights,
            input_data["shock"]
        )

    try:
        vol_forecast = forecast_volatility(returns, weights)
    except Exception as exc:
        print(f"[riskengine] vol forecast failed: {exc}", file=sys.stderr)
        vol_forecast = {"error": str(exc)}

    try:
        crash_prediction = predict_crash_probability(
            returns, weights, start, end,
            sentiment_score=sentiment_score,
        )
    except Exception as exc:
        print(f"[riskengine] crash predictor failed: {exc}", file=sys.stderr)
        crash_prediction = {"error": str(exc)}

    try:
        alert_metrics = {
            "volatility": float(portfolio_vol),
            "sharpe_ratio": float(sharpe_ratio),
            "var_95": float(var_95),
            "max_drawdown": float(metrics.get("max_drawdown", 0)),
        }
        vix_current = crash_prediction.get("vix_current", 20.0)

        risk_alerts = generate_alerts(
            metrics=alert_metrics,
            returns=returns,
            weights=weights,
            sentiment_score=sentiment_score,
            vix_current=vix_current,
            correlation_matrix=correlation_matrix,
        )
    except Exception as exc:
        print(f"[riskengine] alert engine failed: {exc}", file=sys.stderr)
        risk_alerts = [{"error": str(exc)}]

    return {
        "expected_return": float(portfolio_return),
        "volatility": float(portfolio_vol),
        "sharpe_ratio": float(sharpe_ratio),
        "correlation_matrix": correlation_matrix.to_dict(),
        "portfolio_beta": float(portfolio_beta),
        "individual_betas": individual_betas,
        "var_95": float(var_95),
        "scenario_result": scenario_result,

        "sentiment_score": float(sentiment_score),
        "regime": regime,

        "ml_intelligence": {
            "volatility_forecast": vol_forecast,
            "crash_prediction": crash_prediction,
            "risk_alerts": risk_alerts,
        },
    }


if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    output = run_analysis(input_data)
    print(json.dumps(output))