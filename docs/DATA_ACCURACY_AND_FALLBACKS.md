# Data Accuracy & Fallbacks Audit

This doc lists what uses **real data**, what is **demo/static**, and what uses **fallbacks** — plus why fallbacks trigger and how to fix them.

---

## 1. What is accurate (real data, no fallback)

| Data / Metric | Source | Notes |
|---------------|--------|--------|
| **Price data** | `yfinance` (Yahoo Finance) | Fetched for your tickers + timeframe. Fails if ticker invalid or no data. |
| **Returns, volatility, Sharpe, correlation, covariance** | `riskmetrics.portfolio_metrics()` | Computed from the returns above. Always real. |
| **VaR (95%), Monte Carlo paths** | `montecarlo.run_monte_carlo()` | Uses same returns/covariance. Always real. |
| **Efficient frontier points** | `efficient_frontier.generate_frontier()` | Random portfolios from same mean/cov. Always real. |
| **Scenario result** | `scenario.apply_scenario()` | Uses your returns + shock. Always real. |
| **Portfolio beta** | `beta.calculate_portfolio_beta()` | Real when S&P 500 (^GSPC) download succeeds. Returns `0.0` only if too few points or zero market variance. |

---

## 2. Demo / static data (not from analysis)

| Where | What | Purpose |
|-------|------|--------|
| **Frontend: `PortfolioContext.jsx`** | `DEMO_PORTFOLIO` = AAPL, MSFT, NVDA, TSLA, AMZN, weights [0.25, 0.25, 0.20, 0.15, 0.15], 1Y | Initial state and “Load Demo” button. |
| **Frontend: `Portfolio.jsx`** | Same `DEMO_PORTFOLIO` | Pre-fill form and “Load Demo (FAANG+)”. |
| **Frontend: `Landing.jsx`** | `demoMetrics` = returnPct 18.42, volPct 24.67, varPct 13.52, sharpe 1.84, beta 1.12, crashProb 23 | **Static marketing numbers** for hero/dashboard preview. Not from any API. |

These are intentional UI defaults / marketing content. They are not analysis results.

---

## 3. Fallbacks: what, why, how to fix

### 3.1 Sentiment (always 0.0 when fallback)

| File | Fallback | When it happens | How to fix |
|------|----------|------------------|------------|
| `LLM/sentiment.py` | `return 0.0` | (1) `df.empty` or ticker not in Google Trends columns. (2) Any exception (pytrends rate limit, network, no API, etc.). | Use a paid/approved Google Trends API or proxy; add retries and backoff; handle rate limits; for Indian tickers consider an alternative sentiment source. |

**Effect:** Regime stays “Neutral” and volatility is never scaled by sentiment (no 1.2× Excitement / 1.3× Fear).

---

### 3.2 VIX (crash predictor uses 20.0 and 0.0)

| File | Fallback | When it happens | How to fix |
|------|----------|------------------|------------|
| `LLM/crash_predictor.py` | `vix_series` empty → `vix_level=20.0`, `vix_pct_change_5/20=0.0` | `yf.download("^VIX", ...)` fails or returns empty. | Ensure ^VIX is available in your region; retry download; or use another VIX data source (e.g. CBOE, paid API). |
| `LLM/crash_predictor.py` | `vix_current = 20.0` | Same: VIX series empty. | Same as above. |
| `LLM/riskengine.py` | `vix_current = crash_prediction.get("vix_current", 20.0)` | Crash predictor didn’t return `vix_current` (e.g. error path). | Only used for alert engine; fix crash predictor VIX fetch so it returns `vix_current` when possible. |

**Effect:** Crash probability and “VIX” in the UI look the same across runs (e.g. ~22% with heuristic, VIX 20).

---

### 3.3 Crash predictor: heuristic instead of ML

| File | Fallback | When it happens | How to fix |
|------|----------|------------------|------------|
| `LLM/crash_predictor.py` | `_heuristic_fallback(...)` | (1) `len(X) < 100` or `y.sum() < 5` (not enough samples or crash labels). (2) Any exception in the ML path. | Use longer history (e.g. 2Y/5Y) so you have enough rows and crash events; fix bugs if exception is thrown; add logging to see which condition triggered. |

**Effect:** Response includes `"method": "heuristic_fallback"`. UI can show “Using heuristic (VIX or ML data unavailable)”.

---

### 3.4 Volatility forecast: single fallback vol

| File | Fallback | When it happens | How to fix |
|------|----------|------------------|------------|
| `LLM/volatility_forecast.py` | One `fallback_vol` for vol_5d, vol_10d, vol_30d; `confidence: "fallback"` | Exception in `forecast_volatility` (e.g. bad returns, too few rows). | Ensure returns have enough history; add logging to capture exception; validate inputs. |
| Same file | For each horizon, if `_train_and_predict` returns `pred is None` | `len(X) < 60` for that horizon. | Use longer history (e.g. ≥ 252 days) so rolling features and labels have enough data. |

**Effect:** All three horizons show the same vol; UI can show `confidence: "fallback"` or “low”.

---

### 3.5 Beta = 0.0

| File | Fallback | When it happens | How to fix |
|------|----------|------------------|------------|
| `LLM/beta.py` | `return 0.0` | (1) `len(stock_r) < 2` or `len(market_r) < 2` after align. (2) `market_variance == 0`. | Usually means S&P 500 (^GSPC) download failed or returned constant; add retry/fallback benchmark or catch and log. |
| **Note** | No try/except in `calculate_portfolio_beta` | If `yf.download("^GSPC", ...)` throws, the whole analysis fails. | Wrap in try/except; on failure return 0.0 or skip beta and document in response. |

**Effect:** Dashboard shows Beta 0.00; may look wrong for equity portfolios.

---

### 3.6 Max drawdown always 0

| File | Fallback | When it happens | How to fix |
|------|----------|------------------|------------|
| `LLM/riskmetrics.py` | Does **not** compute `max_drawdown`. | Metric never set. | **Implement** max drawdown in `portfolio_metrics()` (e.g. from cumulative returns, then `metrics["max_drawdown"]`). |
| `LLM/riskengine.py` | `metrics.get("max_drawdown", 0)` | Always 0 until riskmetrics adds it. | Same: add the metric in riskmetrics. |

**Effect:** Alerts that use max_drawdown never trigger; value is always 0.

---

### 3.7 Alert engine defaults

| File | Fallback | When it happens | How to fix |
|------|----------|------------------|------------|
| `LLM/alert_engine.py` | `metrics.get("volatility", 0)` etc. | Only if a key is missing from `metrics` (shouldn’t happen if riskengine passes full metrics). | Ensure riskengine always passes volatility, var_95, max_drawdown (once implemented), sharpe_ratio. |

These are defensive defaults; fix by ensuring the metric dict is complete.

---

## 4. Quick reference: “Why am I seeing fallbacks?”

| What you see | Likely cause | Action |
|--------------|--------------|--------|
| Regime always “Neutral” | Sentiment fallback (pytrends error / no data) | Fix or replace sentiment source; check logs for “[riskengine] sentiment analysis failed”. |
| Crash prob ~22% every time; “Using heuristic” | VIX empty and/or not enough data for ML | Fix VIX fetch; use longer history (e.g. 1Y+); check “[crash_predictor] Error”. |
| VIX always 20 in UI | VIX download empty/failed | Same as above; verify ^VIX in yfinance for your region. |
| Vol forecast same for 5d/10d/30d; confidence “fallback” | Exception in vol forecast or too little data | Use longer history; check “[volatility_forecast] Error”. |
| Beta 0.00 | Too few aligned returns or zero market variance; or ^GSPC download failed (then whole run can fail) | Add try/except in beta; use longer history; optional fallback benchmark. |
| Max drawdown always 0 | Not implemented in riskmetrics | Implement in `portfolio_metrics()` and pass through riskengine. |

---

## 5. Fixes Applied

The following accuracy issues have been identified and fixed:

1. **Beta ddof mismatch** — `np.cov()` uses `ddof=1` (sample covariance) but `np.var()` used `ddof=0` (population variance). Fixed: `np.var(market_r, ddof=1)` to match `np.cov`.
2. **VaR alert never triggered** — The VaR loss fraction was negated before passing to alert_engine (sign error). Alert thresholds are positive, so the check always failed. Fixed: removed the negation.
3. **Sharpe/volatility inconsistency** — Sharpe ratio was computed with raw volatility, but displayed volatility was sentiment-adjusted (1.2×/1.3×). Fixed: Sharpe is recalculated after sentiment adjustment.
4. **Crash predictor overfitting** — Model trained on full dataset then predicted on same data (data leakage). Fixed: 80/20 time-series split, reduced `max_depth`, slower `learning_rate`, `min_samples_leaf=10`, and probability clipped to [0.02, 0.95].
5. **Sentiment pytrends duplicate arg** — `build_payload` received `kw_list` both as positional arg and keyword arg. Fixed: removed duplicate.
6. **Scenario analysis not annualized** — `apply_scenario()` returned daily return while all other metrics are annualised. Fixed: multiplied by 252.
7. **Volatility forecast NaN fallback** — When rolling window > data length, `iloc[-1]` returned NaN. Fixed: NaN guard with full-sample std fallback.
8. **Beta error handling** — `calculate_portfolio_beta` could crash the whole analysis if ^GSPC download failed. Fixed: wrapped in try/except with proper error handling.
9. **Max drawdown** — Implemented in `riskmetrics.portfolio_metrics()` (was previously missing, always 0).
10. **yfinance compatibility** — `fetch_price_data` now handles MultiIndex columns from newer yfinance versions for both single and multi-ticker downloads.

