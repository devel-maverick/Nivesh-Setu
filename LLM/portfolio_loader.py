import pandas as pd

def load_portfolio_csv(file_path):

    df = pd.read_csv(file_path)

    tickers = df["ticker"].tolist()
    weights = df["weight"].tolist()

    return tickers, weights