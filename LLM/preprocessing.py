import yfinance as yf
import pandas as pd

def fetch_price_data(tickers, start, end):

    data = yf.download(tickers, start=start, end=end, progress=False)
    if len(tickers) == 1:
        if "Adj Close" in data.columns:
            data = data["Adj Close"]
        else:
            data = data["Close"]
    else:
        if ("Adj Close" in data.columns.levels[0]):
            data = data["Adj Close"]
        else:
            data = data["Close"]

    return data.dropna()
def compute_returns(data):
    returns = data.pct_change().dropna()
    return returns