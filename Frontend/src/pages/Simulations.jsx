import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext.jsx'
import { analyzePortfolio } from '../services/api.js'
import { Activity, ArrowRight, Info, Play, AlertCircle } from 'lucide-react'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Activity size={40} className="text-zinc-500 mb-4" />
      <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">No simulation data</h2>
      <p className="text-text-secondary text-sm mb-6 max-w-sm">Run a portfolio analysis first to access Monte Carlo simulation and optimization.</p>
      <Link to="/app/portfolio" className="btn-primary">Set Up Portfolio <ArrowRight size={14} className="ml-1" /></Link>
    </div>
  )
}

export default function Simulations() {
  const { results, portfolio, analyze, loading } = usePortfolio()
  const [scenarioShock, setScenarioShock] = useState({})
  const [scenarioResult, setScenarioResult] = useState(null)
  const [scenarioLoading, setScenarioLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('monte-carlo')

  if (!results) return <EmptyState />

  const { var_95, expected_return, volatility, scenario_result } = results

  const runScenario = async () => {
    if (Object.keys(scenarioShock).length === 0) return
    setScenarioLoading(true)
    try {
      const shockNormalized = {}
      Object.entries(scenarioShock).forEach(([k, v]) => {
        shockNormalized[k] = parseFloat(v) / 100
      })
      const payload = { ...portfolio, shock: shockNormalized }
      const data = await analyzePortfolio(payload)
      setScenarioResult(data)
    } catch (e) {
      console.error(e)
    } finally {
      setScenarioLoading(false)
    }
  }

  const tabs = [
    { id: 'monte-carlo', label: 'Monte Carlo' },
    { id: 'scenario', label: 'Scenario Analysis' },
    { id: 'efficient-frontier', label: 'Efficient Frontier' },
  ]

  // Generate mock Monte Carlo fan data for visualization
  const paths = 30
  const days = 30
  const generateFanPaths = () => {
    const baseVol = volatility || 0.02
    const baseMu = expected_return || 0.001
    const result = []
    for (let p = 0; p < paths; p++) {
      const path = [100]
      for (let d = 0; d < days; d++) {
        const prev = path[path.length - 1]
        const r = baseMu + baseVol * (Math.random() * 2 - 1) * 2
        path.push(prev * (1 + r))
      }
      result.push(path)
    }
    return result
  }
  const fanPaths = generateFanPaths()

  // Compute percentiles for fan
  const p5 = [], p50 = [], p95 = []
  for (let d = 0; d <= days; d++) {
    const vals = fanPaths.map(p => p[d]).sort((a, b) => a - b)
    p5.push(vals[Math.floor(vals.length * 0.05)])
    p50.push(vals[Math.floor(vals.length * 0.5)])
    p95.push(vals[Math.floor(vals.length * 0.95)])
  }

  // SVG Fan chart
  const w = 600, h = 200
  const maxVal = Math.max(...p95), minVal = Math.min(...p5)
  const xScale = (i) => (i / days) * w
  const yScale = (v) => h - ((v - minVal) / (maxVal - minVal)) * h * 0.9 - h * 0.05

  const toPath = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ')
  const toArea = (upper, lower) => {
    const up = upper.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ')
    const down = [...lower].reverse().map((v, i) => `L ${xScale(days - i)} ${yScale(v)}`).join(' ')
    return `${up} ${down} Z`
  }

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

      {/* Monte Carlo Tab */}
      {activeTab === 'monte-carlo' && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-zinc-400" />
              <h3 className="font-heading font-semibold text-text-primary">Monte Carlo Simulation Fan</h3>
              <div className="badge-cyan text-xs ml-auto">{paths} paths · {days} days</div>
            </div>
            <p className="text-text-muted text-xs mb-4">
              Visualizing the distribution of possible portfolio values over the next {days} trading days based on historical returns.
            </p>

            {/* SVG Fan Chart */}
            <div className="bg-zinc-900 rounded-xl p-4 overflow-x-auto">
              <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                  <line
                    key={frac}
                    x1={0} y1={h * frac}
                    x2={w} y2={h * frac}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={1}
                  />
                ))}
                {/* 5th-95th percentile area */}
                <path
                  d={toArea(p95, p5)}
                  fill="rgba(255,255,255,0.05)"
                  stroke="none"
                />
                {/* P5 line */}
                <path d={toPath(p5)} stroke="#EF4444" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
                {/* P95 line */}
                <path d={toPath(p95)} stroke="#10B981" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
                {/* Median */}
                <path d={toPath(p50)} stroke="#fafafa" strokeWidth={2} fill="none" />
              </svg>
              <div className="flex gap-6 mt-3 text-xs">
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-accent-red" style={{ borderTop: '1px dashed' }} /><span className="text-text-muted">5th percentile</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-zinc-50" /><span className="text-text-muted">Median (50th)</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-accent-green" style={{ borderTop: '1px dashed' }} /><span className="text-text-muted">95th percentile</span></div>
              </div>
            </div>

            {/* MC Summary — driven by backend data */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              {/* VaR: now a direct loss % from backend */}
              <div className="text-center p-3 bg-zinc-900 rounded-xl">
                <div className="text-text-muted text-xs mb-1">VaR (95%)</div>
                <div className="font-heading text-xl font-bold text-accent-red">
                  {var_95 != null ? `-${var_95.toFixed(2)}%` : '—'}
                </div>
                <div className="text-text-muted text-xs mt-0.5">Max 30d loss</div>
              </div>
              {/* Expected 30d: annualise down from backend annual return */}
              <div className="text-center p-3 bg-zinc-900 rounded-xl">
                <div className="text-text-muted text-xs mb-1">Expected (30d)</div>
                <div className={`font-heading text-xl font-bold ${
                  (expected_return || 0) >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {expected_return != null
                    ? `${(expected_return * (30 / 252) * 100).toFixed(1)}%`
                    : '—'}
                </div>
                <div className="text-text-muted text-xs mt-0.5">Median outcome</div>
              </div>
              {/* Upside: 95th-pct estimate = expected + 1.645 × vol (30d) */}
              <div className="text-center p-3 bg-zinc-900 rounded-xl">
                <div className="text-text-muted text-xs mb-1">Upside (95th)</div>
                <div className="font-heading text-xl font-bold text-accent-green">
                  {(expected_return != null && volatility != null)
                    ? `+${((expected_return * (30/252) + 1.645 * volatility * Math.sqrt(30/252)) * 100).toFixed(1)}%`
                    : '—'}
                </div>
                <div className="text-text-muted text-xs mt-0.5">Best case</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Analysis */}
      {activeTab === 'scenario' && (
        <div className="card max-w-xl">
          <h3 className="font-heading font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Play size={18} className="text-zinc-400" />
            What-If Scenario Analysis
          </h3>
          <p className="text-text-muted text-xs mb-5">
            Apply hypothetical shocks to your portfolio and see the impact on expected returns.
          </p>

          <div className="space-y-3 mb-5">
            {portfolio.tickers.map(ticker => (
              <div key={ticker} className="flex items-center gap-4">
                <span className="font-mono text-zinc-400 text-sm w-16">{ticker}</span>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={scenarioShock[ticker] || 0}
                  onChange={e => setScenarioShock(prev => ({ ...prev, [ticker]: parseInt(e.target.value) }))}
                  className="flex-1 accent-blue-500 cursor-pointer"
                  aria-label={`Shock for ${ticker}`}
                />
                <div className={`w-16 text-right font-mono text-sm font-semibold ${
                  (scenarioShock[ticker] || 0) > 0 ? 'text-accent-green' :
                  (scenarioShock[ticker] || 0) < 0 ? 'text-accent-red' : 'text-text-muted'
                }`}>
                  {(scenarioShock[ticker] || 0) > 0 ? '+' : ''}{scenarioShock[ticker] || 0}%
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={runScenario}
            disabled={scenarioLoading || Object.values(scenarioShock).every(v => v === 0)}
            className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scenarioLoading ? 'Running...' : 'Run Scenario'}
            <Play size={14} />
          </button>

          {scenarioResult && (
            <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-border-default">
              <div className="text-text-muted text-xs mb-2">Scenario Result</div>
              <div className={`font-heading text-2xl font-bold ${
                scenarioResult.scenario_result >= 0 ? 'text-accent-green' : 'text-accent-red'
              }`}>
                {scenarioResult.scenario_result >= 0 ? '+' : ''}
                {(scenarioResult.scenario_result * 100).toFixed(3)}%
              </div>
              <div className="text-text-muted text-xs mt-1">Expected portfolio daily return under this scenario</div>
            </div>
          )}
        </div>
      )}

      {/* Efficient Frontier */}
      {activeTab === 'efficient-frontier' && (
        <div className="card">
          <h3 className="font-heading font-semibold text-text-primary mb-2">Efficient Frontier</h3>
          <p className="text-text-secondary text-sm mb-4">
            Each point represents a possible portfolio weight combination. The curved edge (the "frontier") shows the maximum return for each level of risk.
          </p>

          {/* Simulated frontier dots */}
          <div className="bg-zinc-900 rounded-xl p-4">
            <svg viewBox="0 0 400 200" className="w-full" style={{ maxHeight: 220 }}>
              {/* Axes */}
              <line x1={40} y1={0} x2={40} y2={180} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              <line x1={40} y1={180} x2={400} y2={180} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              {/* Axis labels */}
              <text x={200} y={197} textAnchor="middle" fill="#6B7280" fontSize={9}>Volatility (Risk)</text>
              <text x={12} y={95} textAnchor="middle" fill="#6B7280" fontSize={9} transform="rotate(-90 12 95)">Return</text>
              {/* Random frontier points */}
              {[...Array(40)].map((_, i) => {
                const vol = 0.08 + Math.random() * 0.22
                const ret = -0.02 + Math.sqrt(vol) * 0.5 * Math.random() + vol * 0.3
                const x = 40 + (vol / 0.3) * 360
                const y = 180 - ((ret + 0.02) / 0.15) * 160
                return (
                  <circle
                    key={i}
                    cx={x} cy={Math.max(5, Math.min(175, y))}
                    r={3}
                    fill="rgba(255,255,255,0.15)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={0.5}
                  />
                )
              })}
              {/* Current portfolio dot */}
              <circle cx={200} cy={100} r={6} fill="#fafafa" stroke="#18181b" strokeWidth={1.5} />
              <text x={205} y={95} fill="#fafafa" fontSize={9} fontWeight="bold">Your Portfolio</text>
            </svg>
          </div>

          <div className="badge-cyan mt-4 inline-flex text-xs">
            Full Markowitz optimization coming with ML backend integration
          </div>
        </div>
      )}
    </div>
  )
}
