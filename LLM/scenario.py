import numpy as np


def apply_scenario(returns, weights, shock_dict):
    modified_returns = returns.copy()


    if isinstance(shock_dict, (int, float)):
        shock_dict = {ticker: shock_dict for ticker in modified_returns.columns}

    for ticker, shock in shock_dict.items():
        if ticker in modified_returns.columns:
            modified_returns[ticker] += shock

    portfolio_return_daily = np.dot(modified_returns.mean(), weights)
    portfolio_return_annual = portfolio_return_daily * 252  

    return float(portfolio_return_annual)