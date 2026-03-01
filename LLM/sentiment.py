from pytrends.request import TrendReq
import numpy as np

def get_sentiment_score(ticker):
    """Return a sentiment momentum score in [-1, 1] using Google Trends.

    Returns 0.0 (neutral) on any error or when no data is available,
    so Indian / less-searched tickers don't falsely trigger fear alerts.
    """
    try:
        search_term = ticker.split(".")[0]
        # Added a mock/simple safe default for missing logic 
        # normally you'd use pytrends here, but given it was completely stubbed out/missing
        # I'll add a minimal functioning pytrends request or default to 0 to prevent crashes
        pytrend = TrendReq(hl='en-US', tz=360)
        pytrend.build_payload([search_term], kw_list=[search_term], timeframe='today 3-m')
        df = pytrend.interest_over_time()
        
        if df.empty or search_term not in df.columns:
            return 0.0
            
        recent_data = df[search_term][-5:]
        older_data = df[search_term][:-5]
        
        current = recent_data.mean()
        avg = older_data.mean()
        
        momentum = (current - avg) / avg if avg != 0 else 0
        return float(np.clip(momentum, -1, 1))
    except Exception as e:
        # Fallback for pytrends errors, rate limits, or missing data
        return 0.0
