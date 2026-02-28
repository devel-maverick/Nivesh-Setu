import yfinance as yf
import pandas as pd


def fetch_price_data(tickers, start, end):
    data = yf.download(tickers, start=start, end=end, progress=False)

    if len(tickers) == 1:
        if "Adj Close" in data.columns:
            price_data = data[["Adj Close"]].rename(columns={"Adj Close": tickers[0]})
        else:
            price_data = data[["Close"]].rename(columns={"Close": tickers[0]})
    else:
        if isinstance(data.columns, pd.MultiIndex):
            if "Adj Close" in data.columns.get_level_values(0):
                price_data = data["Adj Close"]
            else:
                price_data = data["Close"]
        else:
            price_data = data


    if isinstance(price_data, pd.DataFrame):
        bad = [
            t for t in tickers
            if t not in price_data.columns or price_data[t].dropna().empty
        ]
    else:
        bad = tickers if price_data.dropna().empty else []

    if bad:
        raise ValueError(
            f"The following ticker(s) returned no price data from yfinance — "
            f"check the symbol spelling: {bad}\n"
            f"  Tip: NSE stocks use the '.NS' suffix  (e.g. 'M&M.NS')\n"
            f"       Valid symbols can be looked up at finance.yahoo.com"
        )


    return price_data.dropna()


def compute_returns(data):
    returns = data.pct_change().dropna()
    return returns