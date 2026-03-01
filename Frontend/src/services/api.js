import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes — ML models can be slow
})

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.details || error.response?.data?.error || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

/**
 * Analyze a portfolio
 * @param {Object} params
 * @param {string[]} params.tickers - e.g. ['AAPL', 'MSFT']
 * @param {number[]} params.weights - e.g. [0.5, 0.5]
 * @param {string} [params.timeframe] - '1M' | '3M' | '6M' | '1Y' | '5Y'
 * @param {Object} [params.shock] - { AAPL: -0.2 } for scenario analysis
 */
export const analyzePortfolio = (params = {}) => {
  const { tickers, weights, timeframe = '1Y', shock = null } = params
  if (!tickers?.length || !weights?.length) {
    return Promise.reject(new Error('Portfolio must include tickers and weights'))
  }
  const payload = { tickers, weights, timeframe }
  if (shock && typeof shock === 'object' && Object.keys(shock).length > 0) payload.shock = shock
  return api.post('/analyze', payload)
}

export default api
