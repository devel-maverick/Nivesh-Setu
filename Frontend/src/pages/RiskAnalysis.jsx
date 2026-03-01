import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext.jsx'
import { ArrowRight, Shield, Info, Briefcase } from 'lucide-react'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Shield size={40} className="text-zinc-500 mb-4" />
      <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">No analysis data</h2>
      <p className="text-text-secondary text-sm mb-6 max-w-sm">Run a portfolio analysis first to see risk breakdown and correlation heatmaps.</p>
      <Link to="/app/portfolio" className="btn-primary">Set Up Portfolio <ArrowRight size={14} className="ml-1" /></Link>
    </div>
  )
}

function MetricRow({ label, value, format = 'number', description }) {
  const formatted =
    format === 'pct' ? `${(value * 100).toFixed(2)}%` :
    format === 'ann_pct' ? `${(value * 252 * 100).toFixed(2)}%` :
    typeof value === 'number' ? value.toFixed(4) : String(value)

  return (
    <div className="flex items-center justify-between py-3 border-b border-border-default last:border-0">
      <div>
        <span className="text-text-secondary text-sm">{label}</span>
        {description && <p className="text-text-muted text-xs mt-0.5 max-w-xs">{description}</p>}
      </div>
      <span className="font-mono font-semibold text-text-primary text-sm">{formatted}</span>
    </div>
  )
}

function CorrelationHeatmap({ matrix }) {
  if (!matrix) return null
  const tickers = Object.keys(matrix)

  const getColor = (val) => {
    if (val >= 0.8) return '#EF4444'
    if (val >= 0.6) return '#F97316'
    if (val >= 0.4) return '#F59E0B'
    if (val >= 0.2) return '#84CC16'
    if (val >= 0) return '#10B981'
    if (val >= -0.2) return '#71717a'
    return '#52525b'
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="text-text-muted text-xs p-2 font-normal w-16"></th>
            {tickers.map(t => (
              <th key={t} className="text-zinc-400 font-mono text-xs p-2 font-semibold">{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickers.map(ticker => (
            <tr key={ticker}>
              <td className="text-zinc-50 font-mono text-xs p-2 font-semibold">{ticker}</td>
              {tickers.map(ticker2 => {
                const val = matrix[ticker]?.[ticker2] ?? 0
                return (
                  <td
                    key={ticker2}
                    className="p-2 text-center text-xs font-mono font-semibold rounded"
                    style={{
                      backgroundColor: `${getColor(val)}22`,
                      color: getColor(val),
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                    title={`${ticker} vs ${ticker2}: ${val.toFixed(3)}`}
                  >
                    {val.toFixed(2)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function RiskAnalysis() {
  const { results, portfolio } = usePortfolio()
  const [activeTab, setActiveTab] = useState('metrics')

  if (!results) return <EmptyState />

  const { expected_return, volatility, sharpe_ratio, portfolio_beta, var_95, correlation_matrix, ml_intelligence } = results
  const maxDrawdown = ml_intelligence?.volatility_forecast?.max_drawdown

  const tabs = [
    { id: 'metrics', label: 'Core Metrics' },
    { id: 'correlation', label: 'Correlation' },
    { id: 'contribution', label: 'Beta Contribution' },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-zinc-50 border border-zinc-800'
                : 'text-zinc-500 hover:text-zinc-50 hover:bg-zinc-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Core Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Return & Volatility */}
          <div className="card">
            <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Shield size={16} className="text-zinc-400" />
              Return & Risk Profile
            </h3>
            <MetricRow
              label="Expected Annual Return"
              value={expected_return}
              format="pct"
              description="Annualised portfolio return from backend"
            />
            <MetricRow
              label="Annualized Volatility"
              value={volatility}
              format="pct"
              description="Standard deviation of daily returns × √252 trading days"
            />
            <MetricRow
              label="Sharpe Ratio"
              value={sharpe_ratio}
              description="Annualised excess return per unit of annualised risk (higher = better)"
            />
            <MetricRow
              label="VaR at 95% (30-day loss)"
              value={-(var_95 || 0) / 100}
              format="pct"
              description="Worst-case 5th-percentile loss over 30 days from Monte Carlo"
            />
            <MetricRow
              label="Portfolio Beta (vs S&P 500)"
              value={portfolio_beta}
              description="Sensitivity to market moves (>1 = more volatile than market)"
            />
          </div>

          {/* Risk Interpretation */}
          <div className="card">
            <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Info size={16} className="text-zinc-400" />
              Risk Interpretation
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: 'Sharpe Ratio',
                  value: sharpe_ratio?.toFixed(2),
                  interpretation: sharpe_ratio > 1.5 ? 'Excellent' : sharpe_ratio > 1 ? 'Good' : sharpe_ratio > 0.5 ? 'Fair' : 'Poor',
                  color: sharpe_ratio > 1.5 ? 'text-accent-green' : sharpe_ratio > 1 ? 'text-zinc-50' : sharpe_ratio > 0.5 ? 'text-accent-amber' : 'text-accent-red',
                  desc: 'Sharpe > 1 is generally considered acceptable',
                },
                {
                  label: 'Beta Exposure',
                  value: portfolio_beta?.toFixed(2),
                  interpretation: portfolio_beta > 1.3 ? 'High market exposure' : portfolio_beta > 0.8 ? 'Moderate' : 'Defensive',
                  color: portfolio_beta > 1.3 ? 'text-accent-red' : portfolio_beta > 0.8 ? 'text-accent-amber' : 'text-accent-green',
                  desc: 'Beta > 1.3 means the portfolio amplifies market swings',
                },
                {
                  label: 'Volatility Level',
                  value: `${(volatility * 100).toFixed(1)}%`,
                  interpretation: volatility > 0.3 ? 'High' : volatility > 0.15 ? 'Moderate' : 'Low',
                  color: volatility > 0.3 ? 'text-accent-red' : volatility > 0.15 ? 'text-accent-amber' : 'text-accent-green',
                  desc: 'S&P 500 historical vol ~15-20% annually',
                },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-zinc-900">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-text-secondary text-sm">{item.label}</span>
                    <span className={`font-mono text-sm font-bold ${item.color}`}>{item.value}</span>
                  </div>
                  <div className={`text-xs font-semibold mb-0.5 ${item.color}`}>{item.interpretation}</div>
                  <div className="text-text-muted text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Correlation Tab */}
      {activeTab === 'correlation' && (
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-2">Correlation Matrix</h3>
          <p className="text-text-muted text-xs mb-4">
            Values close to 1.0 = highly correlated (poor diversification). Close to 0 = uncorrelated (good).
          </p>
          {/* Color legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { color: '#EF4444', label: '≥0.8 High' },
              { color: '#F59E0B', label: '0.6-0.8 Moderate' },
              { color: '#10B981', label: '0-0.4 Low' },
              { color: '#71717a', label: '<0 Negative' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: l.color }} />
                <span className="text-text-muted">{l.label}</span>
              </div>
            ))}
          </div>
          <CorrelationHeatmap matrix={correlation_matrix} />
        </div>
      )}

      {/* Beta Contribution Tab */}
      {activeTab === 'contribution' && (
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-4">Beta Contribution by Stock</h3>
          <p className="text-text-muted text-sm mb-4">
            Each stock's weighted contribution to the portfolio's overall market sensitivity.
          </p>
          {results.individual_betas && (
            <div className="space-y-3">
              {Object.entries(results.individual_betas).map(([ticker, beta]) => {
                const weight = portfolio.tickers.indexOf(ticker) >= 0
                  ? portfolio.weights[portfolio.tickers.indexOf(ticker)]
                  : 0
                const contribution = beta * weight
                const maxContribution = Math.max(
                  ...Object.entries(results.individual_betas).map(([t, b]) => {
                    const w = portfolio.tickers.indexOf(t) >= 0 ? portfolio.weights[portfolio.tickers.indexOf(t)] : 0
                    return Math.abs(b * w)
                  })
                )

                return (
                  <div key={ticker} className="flex items-center gap-4">
                    <span className="font-mono text-zinc-400 text-sm font-semibold w-16">{ticker}</span>
                    <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(Math.abs(contribution) / maxContribution) * 100}%`,
                          background: beta > 1.2 ? '#EF4444' : beta > 0.8 ? '#a1a1aa' : '#10B981',
                        }}
                      />
                    </div>
                    <div className="text-right w-24">
                      <div className={`font-mono text-sm font-bold ${beta > 1.2 ? 'text-accent-red' : beta > 0.8 ? 'text-zinc-400' : 'text-accent-green'}`}>
                        + {contribution.toFixed(2)}
                      </div>
                      <div className="text-text-muted text-[10px]">
                        (β {beta.toFixed(2)} × {(weight * 100).toFixed(0)}%)
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
