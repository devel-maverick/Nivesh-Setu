import numpy as np

def apply_scenario(returns, weights, shock_dict):

    modified_returns = returns.copy()

    for ticker, shock in shock_dict.items():
        if ticker in modified_returns.columns:
            modified_returns[ticker] += shock

    portfolio_return = np.dot(modified_returns.mean(), weights)

    return float(portfolio_return)