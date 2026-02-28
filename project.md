
# Nivesh-Setu — Complete Implementation Guide

Full code + explanation for every file in the Backend and LLM directories.

---

## How The System Works (Big Picture)

```
USER → POST /api/analyze → Express Backend → spawns Python → riskengine.py → runs all modules → JSON result → back to user
```

The Backend is a thin Node.js HTTP server. It receives API requests, spawns a Python child process, sends the request data as JSON via stdin, and reads the result from stdout. All heavy computation happens in Python.

---

## BACKEND (Node.js + Express)

The backend has 4 files:
```
Backend/
├── server.js                    ← starts the HTTP server
├── routes/analyze.js            ← defines API endpoints
├── controllers/analyzeController.js  ← handles request logic
└── services/pythonRunner.js     ← spawns Python and bridges data
```

---

### File 1: `server.js`

This is the **entry point** — when you run `npm run dev`, this file executes first.

```javascript
import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyze.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", analyzeRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

**Line-by-line:**
- `import express` → loads Express framework (creates HTTP servers easily)
- `import cors` → loads CORS middleware (allows frontend on different port to call this API)
- `import analyzeRoutes` → loads our route definitions from another file
- `const app = express()` → creates a new Express application instance
- `app.use(express.json())` → tells Express to automatically parse JSON request bodies (so `req.body` has the parsed object)
- `app.use(cors())` → enables Cross-Origin Resource Sharing (without this, browsers block requests from `localhost:5173` to `localhost:3000`)
- `app.use("/api", analyzeRoutes)` → mounts all routes under `/api` prefix. So a route defined as `/analyze` in the routes file becomes `/api/analyze`
- `app.listen(3000, ...)` → starts listening for HTTP requests on port 3000

---

### File 2: `routes/analyze.js`

Defines **which URLs** the server responds to and **which function** handles each URL.

```javascript
import express from "express";
import { analyzePortfolio } from "../controllers/analyzeController.js";

const router = express.Router();

router.post("/analyze", analyzePortfolio);

export default router;
```

**Line-by-line:**
- `import { analyzePortfolio }` → imports the handler function from the controller
- `const router = express.Router()` → creates a router object (a mini-app that only handles routes)
- `router.post("/analyze", analyzePortfolio)` → when someone sends a `POST` request to `/analyze` (which becomes `/api/analyze` because of how server.js mounts it), call the `analyzePortfolio` function
- `export default router` → exports the router so `server.js` can import and use it

---

### File 3: `controllers/analyzeController.js`

Contains the **logic** for handling the request — calls Python and returns the result.

```javascript
import runPython from "../services/pythonRunner.js";

export const analyzePortfolio = async (req, res) => {
  try {
    const result = await runPython(req.body);
    res.json(result);
  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Analysis failed", details: err.toString() });
  }
};
```

**Line-by-line:**
- `import runPython` → imports the function that spawns python
- `export const analyzePortfolio = async (req, res) => {` → this is the handler function. Express gives it `req` (the incoming request) and `res` (the response object)
- `const result = await runPython(req.body)` → takes the entire JSON body the user sent (`{ tickers, weights, start, end }`) and passes it to `runPython()`. Awaits because Python takes time to run.
- `res.json(result)` → sends the Python result back to the user as JSON HTTP response
- `catch (err)` → if Python crashes or returns bad data, sends a 500 error with details

**Flow:**
```
req.body = { "tickers": ["AAPL"], "weights": [1.0], "start": "..." }
   ↓
runPython(req.body)  ← sends this JSON to Python
   ↓
result = { "expected_return": 0.001, "volatility": 0.02, ... }  ← Python's output
   ↓
res.json(result)  ← sends back to user
```

---

### File 4: `services/pythonRunner.js` ⭐ (Most Important Backend File)

This file is the **bridge** between Node.js and Python. It spawns a Python process and passes data through stdin/stdout.

```javascript
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function runPython(data) {
  return new Promise((resolve, reject) => {
    const pythonPath = join(__dirname, "../../venv/bin/python3");
    const scriptPath = join(__dirname, "../../LLM/riskengine.py");

    const pythonProcess = spawn(pythonPath, [scriptPath]);

    let output = "";

    pythonProcess.stdin.write(JSON.stringify(data));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    pythonProcess.stderr.on("data", (chunk) => {
      console.warn("PYTHON STDERR:", chunk.toString());
    });

    pythonProcess.on("close", () => {
      try {
        const parsed = JSON.parse(output);
        resolve(parsed);
      } catch (err) {
        reject("Invalid JSON from Python: " + output);
      }
    });
  });
}
```

**Line-by-line:**
- `import { spawn }` → Node.js built-in to create child processes
- `fileURLToPath / dirname / join` → utilities to build absolute file paths (because ES modules don't have `__dirname` by default)
- `const pythonPath = join(...)` → builds path to `venv/bin/python3` (going up 2 directories from `services/`)
- `const scriptPath = join(...)` → builds path to `LLM/riskengine.py`
- `spawn(pythonPath, [scriptPath])` → **runs the command**: `venv/bin/python3 LLM/riskengine.py` as a child process
- `pythonProcess.stdin.write(JSON.stringify(data))` → converts the request body to a JSON string and writes it to Python's stdin (this is how Python receives the data)
- `pythonProcess.stdin.end()` → signals "I'm done writing" so Python's `sys.stdin.read()` returns
- `pythonProcess.stdout.on("data", ...)` → every time Python prints something to stdout, it gets appended to `output`
- `pythonProcess.stderr.on("data", ...)` → Python warnings/errors get logged as warnings
- `pythonProcess.on("close", ...)` → when Python finishes running:
  - Try to parse `output` as JSON → if success, resolve the Promise (result goes back to controller)
  - If parsing fails (Python crashed, printed error instead of JSON) → reject with error message

**This is why you saw `"Invalid JSON from Python: "` error** — Python was crashing (missing `beta.py` module), printing nothing to stdout, so `output` was empty string, and `JSON.parse("")` fails.

---

## LLM (Python Risk Engine)

The LLM directory has 13 Python files:
```
LLM/
├── riskengine.py              ← central orchestrator
├── preprocessing.py           ← fetch stock data
├── riskmetrics.py             ← compute risk metrics
├── montecarlo.py              ← Monte Carlo simulation
├── beta.py                    ← market beta
├── scenario.py                ← stress testing
├── timeframe.py               ← date parsing
├── portfolio_loader.py        ← CSV loading
├── sentiment.py               ← Google Trends
├── volatility_forecast.py     ← ML volatility prediction
├── crash_predictor.py         ← ML crash prediction
├── alert_engine.py            ← risk alerts
└── __init__.py                ← empty (makes it a package)
```

---

### File 1: `riskengine.py` ⭐ (The Brain)

This is the **central orchestrator**. It reads input, calls every other module, and assembles the final output.

```python
import sys
import json

from preprocessing import fetch_price_data, compute_returns
from sentiment import get_sentiment_score
from riskmetrics import portfolio_metrics
from montecarlo import run_monte_carlo
from beta import calculate_portfolio_beta
from scenario import apply_scenario
from timeframe import parse_timeframe
from portfolio_loader import load_portfolio_csv

from volatility_forecast import forecast_volatility
from crash_predictor import predict_crash_probability
from alert_engine import generate_alerts
```

**These imports load every module in the system.** Lines 4-11 are Layer 1 + Layer 2 modules, lines 13-15 are Layer 3 ML modules.

```python
def run_analysis(input_data):
    if "csv_path" in input_data:
        tickers, weights = load_portfolio_csv(input_data["csv_path"])
    else:
        tickers = input_data["tickers"]
        weights = input_data["weights"]

    if "timeframe" in input_data:
        start, end = parse_timeframe(input_data["timeframe"])
    else:
        start = input_data["start"]
        end = input_data["end"]
```

**Input parsing:** The user can provide portfolio data in two ways:
1. Via CSV file path → `load_portfolio_csv()` reads it
2. Directly as `tickers` and `weights` arrays

Similarly, date range can be:
1. Shorthand like `"1Y"` → `parse_timeframe()` converts to dates
2. Direct `"start"` and `"end"` date strings

```python
    price_data = fetch_price_data(tickers, start, end)
    returns = compute_returns(price_data)
```

**Layer 1 starts:** Downloads stock prices from Yahoo Finance, then computes daily percentage returns.

```python
    metrics = portfolio_metrics(returns, weights)
    portfolio_return = metrics["expected_return"]
    portfolio_vol = metrics["volatility"]
    sharpe_ratio = metrics["sharpe_ratio"]
    correlation_matrix = metrics["correlation_matrix"]
    cov_matrix = metrics["cov_matrix"]
```

**Computes all core risk metrics** and extracts each one into separate variables. These will be used by later modules and included in the final output.

```python
    portfolio_beta, individual_betas = calculate_portfolio_beta(
        returns, weights, start, end
    )
```

**Calculates how volatile this portfolio is compared to the S&P 500 market.** Returns both the overall portfolio beta and each individual stock's beta.

```python
    sentiment_score = get_sentiment_score(tickers[0])
    if sentiment_score > 0.3:
        portfolio_vol *= 1.2
        regime = "Excitement"
    elif sentiment_score < -0.3:
        portfolio_vol *= 1.3
        regime = "Fear"
    else:
        regime = "Neutral"
```

**Layer 2:** Gets Google Trends sentiment for the first ticker. If people are searching a lot (excitement), increases volatility by 20%. If search interest is dropping (fear), increases volatility by 30%. This reflects the idea that market mood affects real risk.

```python
    var_95 = run_monte_carlo(returns.mean(), cov_matrix, weights)
```

**Runs 1000 Monte Carlo simulations** to estimate how bad things could get (Value at Risk at 95% confidence).

```python
    scenario_result = None
    if "shock" in input_data:
        scenario_result = apply_scenario(returns, weights, input_data["shock"])
```

**Optional stress test:** If the user provided a shock (like `{"AAPL": -0.20}`), simulates that scenario.

```python
    try:
        vol_forecast = forecast_volatility(returns, weights)
    except Exception as exc:
        print(f"[riskengine] vol forecast failed: {exc}", file=sys.stderr)
        vol_forecast = {"error": str(exc)}

    try:
        crash_prediction = predict_crash_probability(
            returns, weights, start, end,
            sentiment_score=sentiment_score,
        )
    except Exception as exc:
        print(f"[riskengine] crash predictor failed: {exc}", file=sys.stderr)
        crash_prediction = {"error": str(exc)}

    try:
        alert_metrics = {
            "volatility": float(portfolio_vol),
            "sharpe_ratio": float(sharpe_ratio),
            "var_95": float(var_95),
            "max_drawdown": float(metrics.get("max_drawdown", 0)),
        }
        vix_current = crash_prediction.get("vix_current", 20.0)
        risk_alerts = generate_alerts(
            metrics=alert_metrics, returns=returns, weights=weights,
            sentiment_score=sentiment_score, vix_current=vix_current,
            correlation_matrix=correlation_matrix,
        )
    except Exception as exc:
        print(f"[riskengine] alert engine failed: {exc}", file=sys.stderr)
        risk_alerts = [{"error": str(exc)}]
```

**Layer 3 — ML Intelligence:** Each module is wrapped in its own `try/except`. This is **critical** — if the volatility forecast fails, the crash predictor and alerts still run. If ML fails entirely, you still get Layer 1 + Layer 2 results. The errors go to stderr (logged by Node.js), not stdout (which would break JSON parsing).

```python
    return {
        "expected_return": float(portfolio_return),
        "volatility": float(portfolio_vol),
        "sharpe_ratio": float(sharpe_ratio),
        "correlation_matrix": correlation_matrix.to_dict(),
        "portfolio_beta": float(portfolio_beta),
        "individual_betas": individual_betas,
        "var_95": float(var_95),
        "scenario_result": scenario_result,
        "sentiment_score": float(sentiment_score),
        "regime": regime,
        "ml_intelligence": {
            "volatility_forecast": vol_forecast,
            "crash_prediction": crash_prediction,
            "risk_alerts": risk_alerts,
        },
    }
```

**Assembles everything** into one big dictionary. Notice `correlation_matrix.to_dict()` — converts pandas DataFrame to a regular dict so it can be serialised to JSON. All numbers are wrapped in `float()` to ensure they're JSON-serialisable (numpy types are not).

```python
if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    output = run_analysis(input_data)
    print(json.dumps(output))
```

**The entry point when Python is spawned:**
1. `sys.stdin.read()` → reads the entire JSON string that `pythonRunner.js` wrote to stdin
2. `json.loads(...)` → parses it into a Python dict
3. `run_analysis(input_data)` → runs the full pipeline
4. `print(json.dumps(output))` → converts result dict to JSON string and prints to stdout (which `pythonRunner.js` reads)

---

### File 2: `preprocessing.py` — Data Fetching

```python
import yfinance as yf
import pandas as pd

def fetch_price_data(tickers, start, end):
    data = yf.download(tickers, start=start, end=end)
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
```

**`fetch_price_data` explained:**
- `yf.download(tickers, start, end)` → downloads historical stock prices from Yahoo Finance
- For **1 ticker**: `yf.download` returns a flat DataFrame with columns like `Open, High, Low, Close, Adj Close, Volume`. We pick `Adj Close` (adjusted for splits/dividends) or `Close`.
- For **multiple tickers**: `yf.download` returns a **multi-level column** DataFrame like `("Adj Close", "AAPL"), ("Adj Close", "MSFT")...`. We select the `"Adj Close"` level to get a clean DataFrame where each column is one ticker's prices.
- `.dropna()` → removes any rows where data is missing (some stocks might not trade on certain days)

**`compute_returns` explained:**
- `.pct_change()` → calculates percentage change between consecutive days. Price `[100, 105, 102]` → returns `[NaN, 0.05, -0.0286]`
- `.dropna()` → removes the first row (always NaN because there's no previous day)

---

### File 3: `riskmetrics.py` — Portfolio Risk Math

```python
import numpy as np

def portfolio_metrics(returns, weights, risk_free_rate=0.0):
    weights = np.array(weights)
    weights = weights / np.sum(weights)

    mean_returns = returns.mean()
    cov_matrix = returns.cov()

    portfolio_return = np.dot(weights, mean_returns)

    portfolio_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
    portfolio_volatility = np.sqrt(portfolio_variance)

    if portfolio_volatility != 0:
        sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility
    else:
        sharpe_ratio = 0
    correlation_matrix = returns.corr()

    return {
        "expected_return": float(portfolio_return),
        "volatility": float(portfolio_volatility),
        "variance": float(portfolio_variance),
        "sharpe_ratio": float(sharpe_ratio),
        "cov_matrix": cov_matrix,
        "correlation_matrix": correlation_matrix
    }
```

**Line-by-line:**
- `weights = np.array(weights)` → converts list `[0.4, 0.35, 0.25]` to numpy array for math operations
- `weights = weights / np.sum(weights)` → **normalises** weights so they sum to 1.0 (e.g. `[40, 35, 25]` becomes `[0.4, 0.35, 0.25]`)
- `mean_returns = returns.mean()` → average daily return for each stock
- `cov_matrix = returns.cov()` → **covariance matrix** — measures how stock returns move together. High covariance = stocks move in sync (less diversification benefit)
- `portfolio_return = np.dot(weights, mean_returns)` → **expected daily return** = weighted average of individual returns. Formula: `w₁×r₁ + w₂×r₂ + w₃×r₃`
- `portfolio_variance = np.dot(weights.T, np.dot(cov_matrix, weights))` → **portfolio variance** using matrix math: `wᵀ Σ w`. This accounts for both individual volatilities AND correlations between assets.
- `portfolio_volatility = np.sqrt(portfolio_variance)` → **standard deviation** (volatility) = square root of variance
- `sharpe_ratio = (return - risk_free) / volatility` → **Sharpe ratio** = how much return you get per unit of risk. Higher = better. Sharpe > 1 = good, < 0 = you're losing money.
- `correlation_matrix = returns.corr()` → pairwise correlations between all stocks. Range [-1, +1]. Close to +1 = stocks move together, ~0 = independent, -1 = opposite

---

### File 4: `montecarlo.py` — Monte Carlo Simulation

```python
import numpy as np

def run_monte_carlo(mean_returns, cov_matrix, weights, simulations=1000, days=30):
    weights = np.array(weights)
    results = []
    for _ in range(simulations):
        simulated = np.random.multivariate_normal(
            mean_returns, cov_matrix, days
        )
        portfolio_path = np.cumprod(
            1 + np.dot(simulated, weights)
        )
        results.append(portfolio_path[-1])

    var_95 = np.percentile(results, 5)
    return float(var_95)
```

**How this simulates future portfolio behaviour:**
1. `for _ in range(1000)` → run 1000 independent simulations
2. `np.random.multivariate_normal(mean_returns, cov_matrix, days)` → generates 30 days of **random** daily returns for all stocks simultaneously. The returns follow a normal distribution with the same means and covariances as the real data. This means correlated stocks stay correlated in the simulation.
3. `np.dot(simulated, weights)` → converts multi-stock returns to portfolio returns (weighted sum each day)
4. `np.cumprod(1 + ...)` → compounds daily returns to get cumulative growth. `[0.01, -0.02, 0.03]` → `[1.01, 0.9898, 1.0195]`
5. `portfolio_path[-1]` → final value after 30 days (e.g. 1.05 means +5% growth)
6. `np.percentile(results, 5)` → sorts all 1000 final values, takes the 5th percentile (5th worst out of 100). This is **VaR 95%** — "in 95% of scenarios, you'll do better than this"

---

### File 5: `beta.py` — Market Beta

```python
import numpy as np
import yfinance as yf
import sys
from preprocessing import fetch_price_data, compute_returns

def calculate_portfolio_beta(returns, weights, start, end):
    benchmark_ticker = ["^GSPC"]
    try:
        benchmark_data = fetch_price_data(benchmark_ticker, start, end)
        benchmark_returns = compute_returns(benchmark_data)
        combined = returns.join(benchmark_returns, how='inner')

        if combined.empty:
            return 1.0, {ticker: 1.0 for ticker in returns.columns}

        mkt_returns = combined.iloc[:, -1]
        asset_returns = combined.iloc[:, :-1]

        mkt_var = mkt_returns.var()
        if mkt_var == 0 or np.isnan(mkt_var):
            return 1.0, {ticker: 1.0 for ticker in returns.columns}

        individual_betas = {}
        for ticker in asset_returns.columns:
            covariance = asset_returns[ticker].cov(mkt_returns)
            beta = covariance / mkt_var
            individual_betas[ticker] = float(beta)

        weights_arr = np.array(weights)
        portfolio_beta = np.dot(weights_arr, [individual_betas[t] for t in asset_returns.columns])
        return float(portfolio_beta), individual_betas

    except Exception as e:
        print(f"Error calculating beta: {e}", file=sys.stderr)
        return 1.0, {ticker: 1.0 for ticker in returns.columns}
```

**How beta works:**
- **Beta** measures how much a stock moves relative to the overall market (S&P 500)
- `^GSPC` is the Yahoo Finance ticker for S&P 500
- `returns.join(benchmark_returns, how='inner')` → aligns portfolio returns with market returns on the same dates
- `beta = covariance(stock, market) / variance(market)` → if AAPL has beta 1.2, when S&P goes up 1%, AAPL tends to go up 1.2%
- `portfolio_beta = weighted sum of individual betas` → overall portfolio sensitivity to market
- **Fallback**: if anything goes wrong (no data, division by zero), returns beta = 1.0 (market neutral)

---

### File 6: `scenario.py` — Stress Testing

```python
import numpy as np

def apply_scenario(returns, weights, shock_dict):
    modified_returns = returns.copy()
    for ticker, shock in shock_dict.items():
        if ticker in modified_returns.columns:
            modified_returns[ticker] += shock
    portfolio_return = np.dot(modified_returns.mean(), weights)
    return float(portfolio_return)
```

**What this does:**
- User sends `{"AAPL": -0.20}` meaning "what if AAPL drops 20% more than historical"
- `modified_returns[ticker] += shock` → adds the shock to every daily return for that stock
- Recalculates portfolio return with shocked data
- Returns the new expected return under stress

---

### File 7: `timeframe.py` — Date Parsing

```python
from datetime import datetime, timedelta

def parse_timeframe(tf):
    end = datetime.today()
    if tf == "1M":
        start = end - timedelta(days=30)
    elif tf == "3M":
        start = end - timedelta(days=90)
    elif tf == "6M":
        start = end - timedelta(days=180)
    elif tf == "1Y":
        start = end - timedelta(days=365)
    elif tf == "5Y":
        start = end - timedelta(days=365*5)
    else:
        start = end - timedelta(days=365)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")
```

**Simple utility:** Converts shorthand strings like `"1Y"` into actual date range strings like `("2025-02-28", "2026-02-28")`. Default is 1 year if unrecognised.

---

### File 8: `portfolio_loader.py` — CSV Import

```python
import pandas as pd

def load_portfolio_csv(file_path):
    df = pd.read_csv(file_path)
    tickers = df["ticker"].tolist()
    weights = df["weight"].tolist()
    return tickers, weights
```

**Simple utility:** Reads a CSV file with `ticker` and `weight` columns, returns them as Python lists.

---

### File 9: `sentiment.py` — Google Trends Sentiment

```python
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
```

**How it measures market mood:**
- `TrendReq()` → creates a Google Trends API client
- `build_payload([ticker], timeframe="today 3-m")` → asks for search interest for this ticker over the last 3 months
- `interest_over_time()` → returns a DataFrame with weekly search interest scores (0-100)
- `current = values.iloc[-1]` → most recent week's interest
- `avg = values.mean()` → average over 3 months
- `momentum = (current - avg) / avg` → if current is higher than average, momentum is positive (people are searching more = excitement). If lower, momentum is negative (interest dropping = fear).
- `np.clip(momentum, -1, 1)` → caps the result between -1 and +1

**Back in riskengine.py**, this score affects volatility:
- Score > +0.3 → multiply volatility by 1.2 (excitement amplifies risk)
- Score < -0.3 → multiply volatility by 1.3 (fear amplifies risk even more)

---

### File 10: `volatility_forecast.py` — RandomForest ML Prediction

This file uses machine learning to **predict future volatility**.

**Key functions:**

**`_build_features(returns)`** — Creates 18+ features from daily portfolio returns:
- Rolling standard deviations (5, 10, 20 day windows) — measures recent volatility
- Rolling means (5, 10, 20 day) — recent average returns
- EMA 12 and EMA 26 — exponential moving averages (react faster to recent data)
- Bollinger bandwidth — volatility relative to mean (how wide the Bollinger Bands are)
- RSI-14 — Relative Strength Index (overbought > 70, oversold < 30)
- 5 lagged returns — what happened 1, 2, 3, 4, 5 days ago
- Day of week — Monday to Friday (some days are historically more volatile)
- Rolling skewness and kurtosis — distribution shape (fat tails, asymmetry)

**`_build_labels(returns, horizon)`** — The target variable the model tries to predict:
- Forward-looking realised volatility = `rolling_std(next N days) * sqrt(252)`
- Annualised so all horizons are comparable

**`_train_and_predict(features, labels)`** — Trains and predicts:
- Drops rows with NaN in features or labels
- Needs at least 60 usable rows to train
- `RandomForestRegressor(n_estimators=500, max_depth=10)` — 500 decision trees, each looking at different feature subsets
- Predicts on the **latest** feature row (today's features)
- Also extracts **feature importance** — which features matter most

**`forecast_volatility(returns, weights)`** — Public API:
- Converts multi-stock returns to single portfolio return series using weights
- Runs the model for 3 horizons: 5-day, 10-day, 30-day
- Assigns confidence: high (≥252 rows), medium (≥120), low (otherwise)
- **Fallback**: if not enough data, returns simple historical rolling volatility

---

### File 11: `crash_predictor.py` — GradientBoosting Crash Prediction

Uses machine learning to estimate the **probability of a >5% portfolio loss** in the next 30 days.

**Key functions:**

**`_fetch_vix(start, end)`** — Downloads VIX (fear index) from Yahoo Finance. VIX > 25 = market is scared, VIX > 35 = panic.

**`_build_crash_features(port_returns, vix_series, sentiment_score)`** — Creates 15+ features:
- Volatility at different lookbacks (10, 20, 60 days)
- Vol-of-vol — how unstable is the volatility itself (volatility of volatility)
- VIX level + VIX momentum (5-day and 20-day % change)
- Sentiment score (from Google Trends)
- Rolling max drawdown over 60 days
- Return distribution shape (skewness, kurtosis) — fat tails signal danger
- Momentum (20-day and 60-day cumulative returns)
- Mean-reversion z-score — how far current returns deviate from long-term average

**`_build_crash_labels(port_returns)`** — Binary target:
- Looks 30 days ahead: did the cumulative return drop below -5%?
- 1 = yes (crash happened), 0 = no

**`predict_crash_probability(...)`** — Public API:
- Trains `GradientBoostingClassifier(n_estimators=200, max_depth=4, learning_rate=0.1)`
- Uses `predict_proba` to get probability (0 to 1) instead of just yes/no
- Extracts top-4 contributing features
- **Risk levels**: LOW (<20%), MODERATE (20-40%), HIGH (40-70%), CRITICAL (>70%)
- **Fallback**: If < 100 rows or < 5 crash events to learn from, uses heuristic formula: `score = f(vol, VIX, sentiment)` instead of ML

---

### File 12: `alert_engine.py` — Smart Risk Alerts

Hybrid system: **rule-based checks** + **ML anomaly detection**.

**Part A — `_rule_check(metrics, ...)` — 7 threshold checks:**

| Check | What triggers WARNING | What triggers CRITICAL |
|-------|----------------------|----------------------|
| Volatility spike | vol > 30% | vol > 50% |
| Max drawdown | drawdown > 10% | drawdown > 20% |
| VaR breach | VaR < -2% | VaR < -5% |
| Correlation breakdown | avg correlation > 0.85 | — |
| Sentiment reversal | sentiment < -0.40 | sentiment < -0.70 |
| VIX spike | VIX > 25 | VIX > 35 |
| Sharpe degradation | Sharpe < 0.3 | Sharpe < 0 |

If nothing fires → emits `ALL_CLEAR` INFO alert.

**Part B — `_anomaly_scan(returns, weights)` — IsolationForest:**
- Creates rolling features: `vol_10, vol_20, skew_20, kurt_20, momentum_10, momentum_20`
- Trains `IsolationForest(n_estimators=200, contamination=0.05)` — expects 5% of data to be anomalous
- Checks if **today's** feature vector is an anomaly (unusual market regime)
- If yes → emits `ANOMALY_DETECTED` WARNING alert

**`generate_alerts(...)` — Public API:**
- Runs both rule checks and anomaly scan
- Sorts alerts: CRITICAL first, then WARNING, then INFO
- Returns a list of alert objects with type, severity, message, value, threshold, and timestamp

---

## Complete Data Flow Summary

```
1.  User POSTs JSON to /api/analyze
2.  server.js → routes → controller → pythonRunner.js
3.  pythonRunner spawns: venv/bin/python3 LLM/riskengine.py
4.  Sends JSON via stdin
5.  riskengine.py reads stdin
6.  Calls preprocessing.py → downloads stock prices from Yahoo Finance
7.  Computes daily returns
8.  Calls riskmetrics.py → expected return, volatility, Sharpe, correlations
9.  Calls beta.py → downloads S&P 500, computes betas
10. Calls sentiment.py → Google Trends interest → adjusts volatility
11. Calls montecarlo.py → 1000 random simulations → VaR 95%
12. Calls scenario.py → optional shock analysis
13. Calls volatility_forecast.py → RandomForest predicts 5/10/30 day volatility
14. Calls crash_predictor.py → GradientBoosting predicts crash probability
15. Calls alert_engine.py → rule checks + anomaly detection → alerts
16. Assembles everything into one big JSON dict
17. Prints JSON to stdout
18. pythonRunner.js reads stdout, parses JSON
19. Controller sends HTTP 200 with JSON response to user
```