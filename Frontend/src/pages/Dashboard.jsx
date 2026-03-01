import React from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext.jsx'
import { 
  TrendingUp, TrendingDown, Shield, Brain, Activity, AlertTriangle,
  ArrowRight, ChevronUp, ChevronDown, Briefcase, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function MetricCard({ label, value, sub, color = 'blue', trend }) {
  const colorMap = {
    blue: 'text-zinc-50 border-zinc-800',
    cyan: 'text-zinc-400 border-zinc-800',
    green: 'text-accent-green border-zinc-800',
    red: 'text-accent-red border-zinc-800',
    amber: 'text-accent-amber border-zinc-800',
    purple: 'text-zinc-400 border-zinc-800',
  }

  return (
    <div className={`metric-card border ${colorMap[color]} hover:shadow-card-hover`}>
      <div className="text-text-muted text-xs mb-2">{label}</div>
      <div className={`font-heading text-2xl font-bold mb-1 ${colorMap[color].split(' ')[0]}`}>{value}</div>
      {sub && <div className="text-text-muted text-xs">{sub}</div>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
          {trend >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(trend).toFixed(2)}%
        </div>
      )}
    </div>
  )
}

function RiskLevelBadge({ riskLevel }) {
  const map = {
    LOW: { class: 'badge-green', label: 'LOW RISK' },
    MODERATE: { class: 'badge-amber', label: 'MODERATE RISK' },
    HIGH: { class: 'badge-red', label: 'HIGH RISK' },
    CRITICAL: { class: 'badge-red', label: 'CRITICAL RISK' },
  }
  const cfg = map[riskLevel] || map.MODERATE
  return <span className={cfg.class}>{cfg.label}</span>
}

function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
        <Briefcase size={32} className="text-zinc-400" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
        No portfolio analyzed yet
      </h2>
      <p className="text-text-secondary max-w-sm mb-8">
        Set up your portfolio with tickers and weights, then run an analysis to see your risk metrics here.
      </p>
      <Link to="/app/portfolio" className="btn-primary">
        Set Up Portfolio <ArrowRight size={16} className="ml-2" />
      </Link>
    </motion.div>
  )
}

export default function Dashboard() {
  const { results, portfolio, loading, error, analyze } = usePortfolio()

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-zinc-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary animate-pulse">Analyzing portfolio...</p>
        <p className="text-text-muted text-sm mt-1">Calculating institutional risk blocks</p>
      </motion.div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center py-24">
      <div className="card text-center max-w-md">
        <AlertTriangle size={32} className="text-accent-red mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-text-primary mb-2">Analysis Failed</h2>
        <p className="text-text-secondary text-sm mb-6">{error}</p>
        <button onClick={() => analyze()} className="btn-primary">Retry Analysis</button>
      </div>
    </div>
  )

  if (!results) return <EmptyState />

  const { 
    expected_return, volatility, sharpe_ratio, portfolio_beta, 
    var_95, sentiment_score, regime, ml_intelligence,
    correlation_matrix, individual_betas
  } = results

  const crashProb = ml_intelligence?.crash_prediction?.crash_probability
  const riskLevel = ml_intelligence?.crash_prediction?.risk_level
  const vixCurrent = ml_intelligence?.crash_prediction?.vix_current
  const alerts = ml_intelligence?.risk_alerts || []
  const volForecast = ml_intelligence?.volatility_forecast

  // expected_return & volatility are now annualised decimals from backend
  const returnPct = ((expected_return || 0) * 100).toFixed(2)
  const volPct = ((volatility || 0) * 100).toFixed(2)
  // var_95 is now already a loss percentage (e.g. 13.5 = portfolio loses 13.5%)
  const varPct = (var_95 || 0).toFixed(2)
  const crashPct = ((crashProb || 0) * 100).toFixed(0)
  const sentimentPct = ((sentiment_score || 0) * 100).toFixed(0)

  const regimeColors = { Excitement: 'text-accent-amber', Fear: 'text-accent-red', Neutral: 'text-accent-green' }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-6"
    >
      {/* Summary header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-1">
            Portfolio: {portfolio.tickers.join(', ')}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <RiskLevelBadge riskLevel={riskLevel} />
            <span className={`text-sm font-medium ${regimeColors[regime] || 'text-text-secondary'}`}>
              {regime} Regime
            </span>
            <span className="text-text-muted text-xs">VIX: {vixCurrent?.toFixed(1)}</span>
          </div>
        </div>
        <Link to="/app/risk" className="btn-secondary text-sm py-2">
          Deep Analysis <ArrowRight size={14} className="ml-1" />
        </Link>
      </motion.div>

      {/* KPI Metrics Grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Ann. Return" value={`${returnPct}%`} sub="Expected" color={parseFloat(returnPct) >= 0 ? 'green' : 'red'} />
        <MetricCard label="Volatility" value={`${volPct}%`} sub="Annualized" color="amber" />
        <MetricCard label="VaR (95%)" value={`-${varPct}%`} sub="Max 30d loss" color="red" />
        <MetricCard label="Sharpe Ratio" value={sharpe_ratio?.toFixed(2) || '—'} sub="Risk-adjusted" color="blue" />
        <MetricCard label="Beta (S&P)" value={portfolio_beta?.toFixed(2) || '—'} sub="Market sensitivity" color="cyan" />
        <MetricCard label="Crash Prob." value={`${crashPct}%`} sub="Next 30 days" color={parseInt(crashPct) > 40 ? 'red' : 'green'} />
      </motion.div>

      {/* 2-column: Vol Forecast + Alerts */}
      <motion.div variants={item} className="grid lg:grid-cols-2 gap-6">
        {/* Volatility Forecast */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-zinc-400" />
            <h3 className="font-heading font-semibold text-text-primary">ML Volatility Forecast</h3>
            {volForecast?.confidence && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="badge-cyan text-xs ml-auto"
              >
                {volForecast.confidence} confidence
              </motion.span>
            )}
          </div>
          {volForecast && !volForecast.error ? (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '5-day', key: 'vol_5d' },
                { label: '10-day', key: 'vol_10d' },
                { label: '30-day', key: 'vol_30d' },
              ].map(f => (
                <div key={f.key} className="text-center p-3 rounded-xl bg-zinc-900 border border-zinc-800/50">
                  <div className="text-text-muted text-xs mb-1">{f.label}</div>
                  <div className="font-heading text-lg font-bold text-zinc-50">
                    {volForecast[f.key] ? `${(volForecast[f.key] * 100).toFixed(1)}%` : '—'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">Insufficient data for forecast</p>
          )}
          <Link to="/app/ml-insights" className="text-zinc-400 text-sm flex items-center gap-1 mt-4 hover:text-zinc-50 transition-colors">
            Full ML analysis <ArrowRight size={12} />
          </Link>
        </div>

        {/* Risk Alerts */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-accent-amber" />
            <h3 className="font-heading font-semibold text-text-primary">Risk Alerts</h3>
            <span className="badge-amber text-xs ml-auto">{alerts.filter(a => !!a.type).length} alerts</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.length === 0 || alerts.every(a => !a.type) ? (
              <div className="flex items-center gap-2 text-accent-green text-sm">
                <Shield size={14} /> No critical alerts detected
              </div>
            ) : alerts.filter(a => !!a.type).slice(0, 4).map((alert, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                (alert.severity || '').toLowerCase() === 'critical' ? 'bg-accent-red/10 text-accent-red' :
                (alert.severity || '').toLowerCase() === 'warning' ? 'bg-accent-amber/10 text-accent-amber' :
                'bg-zinc-800/50 text-zinc-400'
              }`}>
                <AlertTriangle size={12} className="mt-0.5 min-w-[12px]" />
                <span>{alert.message || `${alert.alert_type}: ${alert.severity}`}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Individual Betas */}
      {individual_betas && Object.keys(individual_betas).length > 0 && (
        <motion.div variants={item} className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-zinc-400" />
            <h3 className="font-heading font-semibold text-text-primary">Individual Stock Betas vs S&P 500</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(individual_betas).map(([ticker, beta]) => (
              <div key={ticker} className="text-center p-3 rounded-xl bg-zinc-900 border border-zinc-800/50">
                <div className="font-mono text-zinc-500 text-xs font-semibold mb-1">{ticker}</div>
                <div className={`font-heading text-lg font-bold ${beta > 1.2 ? 'text-accent-red' : beta < 0.8 ? 'text-accent-green' : 'text-zinc-50'}`}>
                  {beta.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation shortcuts */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { to: '/app/risk', icon: Shield, label: 'Risk Analysis', desc: 'VaR, heatmaps, contribution', color: 'text-zinc-400' },
          { to: '/app/simulations', icon: Activity, label: 'Simulations', desc: 'Monte Carlo, optimization', color: 'text-zinc-400' },
          { to: '/app/ml-insights', icon: Brain, label: 'ML Insights', desc: 'Forecasts, crash predictor', color: 'text-zinc-400' },
          { to: '/app/portfolio', icon: Briefcase, label: 'Edit Portfolio', desc: 'Update tickers & weights', color: 'text-zinc-400' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="card flex items-start gap-3 group hover:border-zinc-800 !p-4">
            <item.icon size={20} className={`${item.color} mt-0.5 min-w-[20px]`} />
            <div>
              <div className="font-heading font-semibold text-text-primary text-sm">{item.label}</div>
              <div className="text-text-muted text-xs mt-0.5">{item.desc}</div>
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}
