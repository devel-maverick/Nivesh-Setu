import numpy as np

TRADING_DAYS = 252


def portfolio_metrics(returns, weights, risk_free_rate=0.0):

    weights = np.array(weights)
    weights = weights / np.sum(weights)

    mean_returns = returns.mean()
    cov_matrix = returns.cov()

    # Daily portfolio return and volatility
    portfolio_return_daily = np.dot(weights, mean_returns)
    portfolio_variance_daily = np.dot(weights.T, np.dot(cov_matrix, weights))
    portfolio_volatility_daily = np.sqrt(portfolio_variance_daily)

    # Annualise
    portfolio_return_annual = portfolio_return_daily * TRADING_DAYS
    portfolio_volatility_annual = portfolio_volatility_daily * np.sqrt(TRADING_DAYS)
    annual_risk_free = risk_free_rate * TRADING_DAYS

    if portfolio_volatility_annual != 0:
        sharpe_ratio = (portfolio_return_annual - annual_risk_free) / portfolio_volatility_annual
    else:
        sharpe_ratio = 0

    correlation_matrix = returns.corr()

    # Max drawdown (worst peak-to-trough decline in cumulative return)
    port_returns_series = returns.dot(weights)
    cum = (1 + port_returns_series).cumprod()
    rolling_max = cum.expanding().max()
    drawdown = (cum - rolling_max) / rolling_max
    max_drawdown = float(drawdown.min()) if len(drawdown) else 0.0

    return {
        # Annualised values returned to consumers
        "expected_return": float(portfolio_return_annual),
        "volatility": float(portfolio_volatility_annual),
        "variance": float(portfolio_variance_daily),          # kept daily for MC
        "sharpe_ratio": float(sharpe_ratio),
        "max_drawdown": max_drawdown,
        # Helpers kept in daily terms for downstream calculations
        "expected_return_daily": float(portfolio_return_daily),
        "volatility_daily": float(portfolio_volatility_daily),
        "cov_matrix": cov_matrix,
        "correlation_matrix": correlation_matrix,
    }