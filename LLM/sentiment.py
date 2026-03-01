from pytrends.request import TrendReq
import numpy as np

def get_sentiment_score(ticker):
    """Return a sentiment momentum score in [-1, 1] using Google Trends.

    Returns 0.0 (neutral) on any error or when no data is available,
    so Indian / less-searched tickers don't falsely trigger fear alerts.
    """
    try:

        search_term = ticker.split(".")[0]

    momentum = (current - avg) / avg if avg != 0 else 0
    return float(np.clip(momentum, -1, 1))
