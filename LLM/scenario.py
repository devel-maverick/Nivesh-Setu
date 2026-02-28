import numpy as np


def apply_scenario(returns, weights, shock_dict):
    """Apply a market shock to returns.

    Args:
        shock_dict: Either a dict mapping ticker -> shock percentage (e.g. {"AAPL": -0.20}),
                    or a plain float/int representing a uniform shock across all tickers
                    (e.g. -0.20 means every ticker drops 20 %).
    """
    modified_returns = returns.copy()


    if isinstance(shock_dict, (int, float)):
        shock_dict = {ticker: shock_dict for ticker in modified_returns.columns}

    for ticker, shock in shock_dict.items():
        if ticker in modified_returns.columns:
            modified_returns[ticker] += shock

    portfolio_return = np.dot(modified_returns.mean(), weights)

    return float(portfolio_return)