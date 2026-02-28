import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { Search, RefreshCw } from 'lucide-react'
import { usePortfolio } from '../context/PortfolioContext.jsx'

const pageLabels = {
  '/app/dashboard': 'Overview',
  '/app/portfolio': 'Portfolio Manager',
  '/app/risk': 'Risk Analysis',
  '/app/simulations': 'Simulations',
  '/app/ml-insights': 'ML Insights',
  '/app/settings': 'Settings',
}

export default function DashboardNavbar() {
  const location = useLocation()
  const { loading, analyze, hasResults, portfolio } = usePortfolio()
  const currentPage = pageLabels[location.pathname] || 'Dashboard'

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b border-border-default sticky top-0 z-40"
      style={{
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Page Title */}
      <div>
        <h1 className="font-heading font-semibold text-text-primary text-base">{currentPage}</h1>
        {portfolio?.tickers?.length > 0 && (
          <p className="text-text-muted text-xs mt-0.5">
            {portfolio.tickers.join(' · ')} · {portfolio.timeframe}
          </p>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Re-analyze button */}
        {hasResults && (
          <button
            onClick={() => analyze()}
            disabled={loading}
            className="btn-secondary text-sm py-2 px-4 gap-2"
            aria-label="Re-analyze portfolio"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Analyzing...' : 'Refresh'}
          </button>
        )}

        {/* User */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
