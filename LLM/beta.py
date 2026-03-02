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
    market_variance = np.var(market_r, ddof=1)             

    if market_variance == 0:
        return 0.0

    return float(covariance / market_variance)


def calculate_portfolio_beta(returns, weights, start, end):
    try:
        raw = yf.download("^GSPC", start=start, end=end, progress=False)
        if raw is None or raw.empty:
            raise ValueError("Empty S&P 500 data")
        if "Close" in raw.columns:
            market_data = raw["Close"].squeeze()
        elif isinstance(raw.columns, pd.MultiIndex):
            if "Close" in raw.columns.get_level_values(0):
                market_data = raw["Close"].squeeze()
            else:
                market_data = raw.iloc[:, 0].squeeze()
        else:
            market_data = raw.iloc[:, 0].squeeze()
        market_returns = market_data.pct_change().dropna()
        if len(market_returns) < 2:
            raise ValueError("Insufficient S&P 500 return data")
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch S&P 500 benchmark: {exc}") from exc

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