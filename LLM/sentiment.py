from pytrends.request import TrendReq
import numpy as np

def get_sentiment_score(ticker):
    pytrend = TrendReq()
    pytrend.build_payload([ticker], timeframe="today 3-m")
    data = pytrend.interest_over_time()

    if data.empty:
        return 0.0

    values = data[ticker]
    current = values.iloc[-1]
    avg = values.mean()

    momentum = (current - avg) / avg if avg != 0 else 0
    return float(np.clip(momentum, -1, 1))