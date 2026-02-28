import numpy as np

import numpy as np

def portfolio_metrics(returns, weights, risk_free_rate=0.0):

    weights = np.array(weights)
    weights = weights / np.sum(weights) 

    mean_returns = returns.mean()
    cov_matrix = returns.cov()

    portfolio_return = np.dot(weights, mean_returns)

    portfolio_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
    portfolio_volatility = np.sqrt(portfolio_variance)

    if portfolio_volatility != 0:
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility * np.sqrt(252)
    else:
        sharpe_ratio = 0
    correlation_matrix = returns.corr()

    return {
        "expected_return": float(portfolio_return),
        "volatility": float(portfolio_volatility),
        "variance": float(portfolio_variance),
        "sharpe_ratio": float(sharpe_ratio),
        "cov_matrix": cov_matrix,
        "correlation_matrix": correlation_matrix
    }