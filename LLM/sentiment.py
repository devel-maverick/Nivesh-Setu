from pytrends.request import TrendReq
import numpy as np

def get_sentiment_score(ticker):
    """Return a sentiment momentum score in [-1, 1] using Google Trends.

    Returns 0.0 (neutral) on any error or when no data is available,
    so Indian / less-searched tickers don't falsely trigger fear alerts.
    """
    try:

        search_term = ticker.split(".")[0]

        pytrend = TrendReq()
        pytrend.build_payload([search_term], timeframe="today 3-m")
        data = pytrend.interest_over_time()

        if data.empty or search_term not in data.columns:
            return 0.0

        values = data[search_term]
        if values.isnull().all():
            return 0.0

        current = float(values.iloc[-1])
        avg = float(values.mean())


        if avg == 0 or current == 0:
            return 0.0

        momentum = (current - avg) / avg
        return float(np.clip(momentum, -1, 1))

    except Exception:

        return 0.0