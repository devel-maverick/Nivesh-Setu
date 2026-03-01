from pytrends.request import TrendReq
import numpy as np
import time

MAX_RETRIES = 3
RETRY_DELAY_SEC = 2


def get_sentiment_score(ticker):
    """Return sentiment momentum score in [-1, 1] using Google Trends.

    Returns dict: {"score": float, "available": bool}.
    When data is unavailable (error, rate limit, empty), returns
    {"score": 0.0, "available": False} so callers can show "Unavailable" instead of fake neutral.
    """
    for attempt in range(MAX_RETRIES):
        try:
            search_term = ticker.split(".")[0]
            pytrend = TrendReq(hl="en-US", tz=360)
            pytrend.build_payload(
                [search_term], timeframe="today 3-m"
            )
            df = pytrend.interest_over_time()

            if df.empty or search_term not in df.columns:
                return {"score": 0.0, "available": False}

            recent_data = df[search_term][-5:]
            older_data = df[search_term][:-5]
            current = recent_data.mean()
            avg = older_data.mean()
            momentum = (current - avg) / avg if avg != 0 else 0
            score = float(np.clip(momentum, -1, 1))
            return {"score": score, "available": True}
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY_SEC)
            else:
                return {"score": 0.0, "available": False}
    return {"score": 0.0, "available": False}
