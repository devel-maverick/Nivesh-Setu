import sys
import json

from preprocessing import fetch_price_data, compute_returns
from sentiment import get_sentiment_score
from riskmetrics import portfolio_metrics
from montecarlo import run_monte_carlo
from efficient_frontier import generate_frontier
from beta import calculate_portfolio_beta
from scenario import apply_scenario
from timeframe import parse_timeframe
from portfolio_loader import load_portfolio_csv

from volatility_forecast import forecast_volatility
from crash_predictor import predict_crash_probability
from alert_engine import generate_alerts


def run_analysis(input_data):
    if not input_data or not isinstance(input_data, dict):
        raise ValueError("input_data must be a JSON object with tickers and weights")

    if "csv_path" in input_data:
        tickers, weights = load_portfolio_csv(input_data["csv_path"])
    else:
        tickers = input_data.get("tickers")
        weights = input_data.get("weights")
        if not tickers or not weights:
            raise ValueError(
                "Missing 'tickers' or 'weights'. Send JSON: {\"tickers\": [\"AAPL\", ...], \"weights\": [0.5, ...], \"timeframe\": \"1Y\"}"
            )
        if len(tickers) != len(weights):
            raise ValueError("tickers and weights must have the same length")

    if "timeframe" in input_data:
        start, end = parse_timeframe(input_data["timeframe"])
    else:
        start = input_data["start"]
        end = input_data["end"]
    price_data = fetch_price_data(tickers, start, end)
    returns = compute_returns(price_data)

    metrics = portfolio_metrics(returns, weights)
    portfolio_return = metrics["expected_return"]          # annualised %
    portfolio_vol = metrics["volatility"]                  # annualised %
    sharpe_ratio = metrics["sharpe_ratio"]                 # annualised
    correlation_matrix = metrics["correlation_matrix"]
    cov_matrix = metrics["cov_matrix"]                     # daily cov

    try:
        portfolio_beta, individual_betas = calculate_portfolio_beta(
            returns, weights, start, end
        )
    except Exception as exc:
        print(f"[riskengine] beta calculation failed: {exc}", file=sys.stderr)
        portfolio_beta = None
        individual_betas = {t: None for t in returns.columns.tolist()}

    sentiment_result = get_sentiment_score(tickers[0])
    if isinstance(sentiment_result, dict):
        sentiment_score = sentiment_result.get("score", 0.0)
        sentiment_available = sentiment_result.get("available", False)
    else:
        sentiment_score = float(sentiment_result)
        sentiment_available = True

    if sentiment_available and sentiment_score > 0.3:
        portfolio_vol *= 1.2
        regime = "Excitement"
    elif sentiment_available and sentiment_score < -0.3:
        portfolio_vol *= 1.3
        regime = "Fear"
    else:
        regime = "Neutral"

    # Recalculate Sharpe ratio to match the (possibly adjusted) volatility
    if portfolio_vol != 0:
        sharpe_ratio = portfolio_return / portfolio_vol
    else:
        sharpe_ratio = 0.0

    # Monte Carlo works on daily returns — pass daily mean & cov
    mc_results = run_monte_carlo(
        returns.mean(),   # daily mean returns per ticker
        cov_matrix,       # daily covariance matrix
        weights
    )
    var_95 = mc_results["var_loss_pct"]

    # Efficient Frontier
    frontier_points = generate_frontier(
        returns.mean(),
        cov_matrix,
        num_portfolios=200
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
            # var_95 is a positive loss % from Monte Carlo (e.g. 13.5 = 13.5% loss).
            # alert_engine thresholds are positive fractions (e.g. 0.10 = 10%).
            "var_95": float(var_95) / 100.0,
            "max_drawdown": float(metrics.get("max_drawdown", 0)),
        }
        vix_current = crash_prediction.get("vix_current") if isinstance(crash_prediction, dict) and "error" not in crash_prediction else None

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
        "portfolio_beta": float(portfolio_beta) if portfolio_beta is not None else None,
        "individual_betas": individual_betas,
        "var_95": float(var_95),
        "scenario_result": scenario_result,
        
        "simulation_data": {
            "monte_carlo_paths": mc_results["paths"],
            "efficient_frontier": frontier_points
        },

        "sentiment_score": float(sentiment_score),
        "sentiment_available": sentiment_available,
        "regime": regime,

        "ml_intelligence": {
            "volatility_forecast": vol_forecast,
            "crash_prediction": crash_prediction,
            "risk_alerts": risk_alerts,
        },
    }


if __name__ == "__main__":
    try:
        raw = sys.stdin.read()
        input_data = json.loads(raw) if raw.strip() else {}
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON: {e}"}))
        sys.exit(0)
    try:
        output = run_analysis(input_data)
        print(json.dumps(output))
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(0)