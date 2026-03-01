import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext.jsx'
import { Plus, Trash2, RefreshCw, Upload, Play, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

const DEMO_PORTFOLIO = {
  tickers: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'],
  weights: [25, 25, 20, 15, 15],
  timeframe: '1Y',
}

const TIMEFRAMES = ['1M', '3M', '6M', '1Y', '5Y']

function TickerRow({ ticker, weight, onUpdate, onRemove }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-border-default group">
      <input
        value={ticker}
        onChange={e => onUpdate('ticker', e.target.value.toUpperCase())}
        placeholder="AAPL"
        className="input-field font-mono text-zinc-50 text-sm uppercase w-28 py-2"
        aria-label="Stock ticker"
      />
      <div className="flex-1">
        <input
          type="range"
          min={1}
          max={100}
          value={weight}
          onChange={e => onUpdate('weight', parseInt(e.target.value))}
          className="w-full accent-zinc-500 cursor-pointer"
          aria-label={`Weight for ${ticker}`}
        />
      </div>
      <div className="w-16 text-right">
        <input
          type="number"
          min={1}
          max={100}
          value={weight}
          onChange={e => onUpdate('weight', parseInt(e.target.value) || 1)}
          className="input-field text-center py-2 text-sm w-full"
          aria-label={`Weight percentage for ${ticker}`}
        />
      </div>
      <span className="text-text-muted text-sm w-4">%</span>
      <button
        onClick={onRemove}
        className="btn-ghost p-2 opacity-0 group-hover:opacity-100 transition-opacity text-accent-red hover:text-accent-red"
        aria-label={`Remove ${ticker}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export default function Portfolio() {
  const { analyze, loading, updatePortfolio, portfolio } = usePortfolio()
  const navigate = useNavigate()

  const toDisplayWeight = (w) => {
    // Context stores weights as decimals (0.25), rows need percentages (25)
    const num = parseFloat(w)
    return Math.round(num <= 1.0 ? num * 100 : num) || 10
  }

  const [rows, setRows] = useState(
    (portfolio.tickers || DEMO_PORTFOLIO.tickers).map((t, i) => ({
      ticker: t,
      weight: toDisplayWeight(portfolio.weights?.[i] ?? DEMO_PORTFOLIO.weights[i]),
    }))
  )

  const [timeframe, setTimeframe] = useState(portfolio.timeframe || '1Y')
  const [validationMsg, setValidationMsg] = useState(null)

  const totalWeight = rows.reduce((sum, r) => sum + (r.weight || 0), 0)
  const isValid = rows.every(r => r.ticker.trim().length > 0) && rows.length > 0

  const addRow = () => setRows(prev => [...prev, { ticker: '', weight: 10 }])
  const removeRow = idx => setRows(prev => prev.filter((_, i) => i !== idx))
  const updateRow = (idx, field, val) => setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))

  const loadDemo = () => {
    setRows(DEMO_PORTFOLIO.tickers.map((t, i) => ({ ticker: t, weight: DEMO_PORTFOLIO.weights[i] })))
    setTimeframe('1Y')
  }

  const handleAnalyze = async () => {
    if (!isValid) {
      setValidationMsg('Please fill in all ticker symbols.')
      return
    }
    setValidationMsg(null)

    const tickers = rows.map(r => r.ticker.trim().toUpperCase())
    const rawWeights = rows.map(r => r.weight || 0)
    const total = rawWeights.reduce((s, w) => s + w, 0)
    const normalizedWeights = rawWeights.map(w => w / total)

    const payload = { tickers, weights: normalizedWeights, timeframe }
    updatePortfolio({ tickers, weights: normalizedWeights, timeframe })

    await analyze(payload)
    navigate('/app/dashboard')
  }

  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-1">Build your portfolio</h2>
            <p className="text-text-secondary text-sm">Add your stock tickers and allocation weights</p>
          </div>
          <button onClick={loadDemo} className="btn-secondary text-sm py-2 gap-2">
            <Lightbulb size={14} className="text-accent-amber" />
            Load Demo (FAANG+)
          </button>
        </div>

        {/* Ticker Rows */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2 text-xs text-text-muted px-3">
            <span className="w-28">Ticker</span>
            <span className="flex-1 text-center">Weight</span>
            <span className="w-16 text-right">%</span>
            <span className="w-4" />
            <span className="w-8" />
          </div>
          {rows.map((row, i) => (
            <TickerRow
              key={i}
              ticker={row.ticker}
              weight={row.weight}
              onUpdate={(field, val) => updateRow(i, field, val)}
              onRemove={() => removeRow(i)}
            />
          ))}
        </div>

        {/* Add ticker + weight sum */}
        <div className="flex items-center justify-between">
          <button onClick={addRow} className="btn-ghost gap-2 text-sm text-zinc-400 hover:text-zinc-50">
            <Plus size={16} /> Add Ticker
          </button>
          <div className={`text-sm font-mono font-semibold ${Math.abs(totalWeight - 100) < 1 ? 'text-accent-green' : 'text-accent-amber'}`}>
            Total: {totalWeight}%
            {Math.abs(totalWeight - 100) >= 1 && <span className="text-text-muted font-normal ml-1">(will auto-normalize)</span>}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <label className="text-text-secondary text-sm mb-3 block">Historical timeframe</label>
          <div className="flex gap-2 flex-wrap">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  timeframe === tf
                    ? 'bg-zinc-800 text-zinc-50 border border-zinc-800'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-800 hover:text-zinc-400'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Validation */}
        {validationMsg && (
          <div className="flex items-center gap-2 text-accent-red text-sm">
            <AlertCircle size={14} />
            {validationMsg}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleAnalyze}
          disabled={!isValid || loading}
          className="btn-primary w-full py-4 text-base gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Analyzing... (this may take 30-60s)
            </>
          ) : (
            <>
              <Play size={18} />
              Run Full Risk Analysis
            </>
          )}
        </button>

        {/* Info */}
        <div className="card bg-zinc-900/50 border-zinc-800 text-xs text-text-muted space-y-1">
          <p className="flex items-center gap-2">
            <CheckCircle size={12} className="text-accent-green" />
            Fetches 1–5 years of historical prices from Yahoo Finance
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle size={12} className="text-accent-green" />
            Runs Monte Carlo (1,000 paths), Efficient Frontier, ML models
          </p>
          <p className="flex items-center gap-2">
            <CheckCircle size={12} className="text-accent-green" />
            No data is stored — fully ephemeral analysis
          </p>
        </div>
      </div>
    </div>
  )
}
