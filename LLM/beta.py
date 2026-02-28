import yfinance as yf
import numpy as np
import pandas as pd

def calculate_stock_beta(stock_returns, market_returns):
    aligned_stock, aligned_market = stock_returns.align(market_returns, join="inner")

    stock_r = aligned_stock.values.flatten()
    market_r = aligned_market.values.flatten()

    if len(stock_r) < 2 or len(market_r) < 2:
        return 0.0

    covariance_matrix = np.cov(stock_r, market_r)
    covariance = covariance_matrix[0, 1]
    market_variance = np.var(market_r)

    if market_variance == 0:
        return 0.0

    return float(covariance / market_variance)


def calculate_portfolio_beta(returns, weights, start, end):
    market_data = yf.download("^GSPC", start=start, end=end)["Close"]
    market_data = market_data.squeeze()
    market_returns = market_data.pct_change().dropna()
    weights = np.array(weights)
    weights = weights / np.sum(weights)

    betas = []
    for ticker in returns.columns:
        stock_returns = returns[ticker]
        beta_val = calculate_stock_beta(stock_returns, market_returns)
        betas.append(beta_val)

    portfolio_beta = float(np.dot(weights, betas))

    individual_betas = dict(zip(returns.columns.tolist(), betas))

    return portfolio_beta, individual_betas