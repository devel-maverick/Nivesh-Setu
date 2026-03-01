import yfinance as yf
import pandas as pd


def fetch_price_data(tickers, start, end):
    data = yf.download(tickers, start=start, end=end, progress=False)

    if data is None or data.empty:
        raise ValueError(f"yfinance returned no data for {tickers}")

    # --- Normalise to a single-level DataFrame: columns = ticker names ---
    if isinstance(data.columns, pd.MultiIndex):
        # Multi-ticker download (and sometimes single-ticker in newer yfinance)
        if "Adj Close" in data.columns.get_level_values(0):
            price_data = data["Adj Close"]
        elif "Close" in data.columns.get_level_values(0):
            price_data = data["Close"]
        else:
            raise ValueError(f"Unexpected yfinance columns: {data.columns.tolist()}")
        # For a single-ticker list yfinance may still return MultiIndex;
        # ensure the column name matches the requested ticker.
        if len(tickers) == 1 and isinstance(price_data, pd.Series):
            price_data = price_data.to_frame(name=tickers[0])
        elif len(tickers) == 1 and isinstance(price_data, pd.DataFrame) and price_data.columns.tolist() != tickers:
            price_data.columns = tickers
    else:
        # Flat columns (older yfinance / single ticker as string)
        if "Adj Close" in data.columns:
            price_data = data[["Adj Close"]].rename(columns={"Adj Close": tickers[0]})
        elif "Close" in data.columns:
            price_data = data[["Close"]].rename(columns={"Close": tickers[0]})
        else:
            raise ValueError(f"Unexpected yfinance columns: {data.columns.tolist()}")


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