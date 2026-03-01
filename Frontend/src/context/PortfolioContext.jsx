import React, { createContext, useContext, useState, useCallback } from 'react'
import { analyzePortfolio as apiAnalyze } from '../services/api.js'

const PortfolioContext = createContext(null)

const DEMO_PORTFOLIO = {
  tickers: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'],
  weights: [0.25, 0.25, 0.20, 0.15, 0.15],
  timeframe: '1Y',
}

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(DEMO_PORTFOLIO)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = useCallback(async (payload = portfolio) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiAnalyze(payload)
      setResults(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [portfolio])

  const loadDemo = useCallback(() => {
    setPortfolio(DEMO_PORTFOLIO)
    return DEMO_PORTFOLIO
  }, [])

  const updatePortfolio = useCallback((newPortfolio) => {
    setPortfolio(newPortfolio)
    setResults(null)
  }, [])

  return (
    <PortfolioContext.Provider value={{
      portfolio,
      results,
      loading,
      error,
      analyze,
      loadDemo,
      updatePortfolio,
      hasResults: !!results,
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider')
  return ctx
}
