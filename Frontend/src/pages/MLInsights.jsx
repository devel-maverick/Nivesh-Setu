import React from 'react'
import { Link } from 'react-router-dom'
import { usePortfolio } from '../context/PortfolioContext.jsx'
import { Brain, AlertTriangle, TrendingUp, Activity, Gauge, ArrowRight, Info } from 'lucide-react'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Brain size={40} className="text-zinc-500 mb-4" />
      <h2 className="font-heading text-xl font-semibold text-text-primary mb-2">No ML insights yet</h2>
      <p className="text-text-secondary text-sm mb-6 max-w-sm">Run a portfolio analysis to see ML-powered volatility forecasts, crash probability, and sentiment signals.</p>
      <Link to="/app/portfolio" className="btn-primary">Set Up Portfolio <ArrowRight size={14} className="ml-1" /></Link>
    </div>
  )
}

function CrashGauge({ probability = 0 }) {
  const pct = Math.min(Math.max(Math.round(probability * 100), 0), 100)

  const getColor = () => {
    if (pct >= 70) return '#EF4444'
    if (pct >= 40) return '#F59E0B'
    if (pct >= 20) return '#FBBF24'
    return '#10B981'
  }
  const color = getColor()

  const getRiskLabel = () => {
    if (pct >= 70) return 'CRITICAL'
    if (pct >= 40) return 'HIGH'
    if (pct >= 20) return 'MODERATE'
    return 'LOW'
  }

  // SVG gauge geometry
  // Center: (60, 72), Radius: 44
  // Arc spans 270°, from 135° to 45° (going clockwise through top)
  // In SVG: 0° = right, angles go clockwise
  const cx = 60, cy = 72, r = 44
  const startAngleDeg = 135   // bottom-left
  const endAngleDeg   = 45    // bottom-right (going clockwise 270°)
  const sweepDeg      = 270

  const toRad = (deg) => (deg * Math.PI) / 180
  const ptOnArc = (deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  })

  const start = ptOnArc(startAngleDeg)
  const end   = ptOnArc(endAngleDeg)

  // Full arc path (large-arc-flag=1 because > 180°)
  const arcPath = `M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`

  // Arc total length = 2π×r × (270/360)
  const arcLen = 2 * Math.PI * r * (sweepDeg / 360)   // ≈ 207.3
  const fillLen = (pct / 100) * arcLen

  // Needle: angle starts at startAngleDeg, sweeps sweepDeg proportionally
  const needleAngleDeg = startAngleDeg + (pct / 100) * sweepDeg
  const needleTip = ptOnArc(needleAngleDeg)
  // Shorten the needle a bit
  const needleLen = r - 8
  const needleX = cx + needleLen * Math.cos(toRad(needleAngleDeg))
  const needleY = cy + needleLen * Math.sin(toRad(needleAngleDeg))

  // Threshold ticks at 20%, 40%, 70%
  const thresholds = [
    { pct: 20, label: '20' },
    { pct: 40, label: '40' },
    { pct: 70, label: '70' },
  ]

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 90" className="w-52">
        {/* Background arc */}
        <path
          d={arcPath}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
        />
        {/* Colored fill arc */}
        <path
          d={arcPath}
          stroke={color}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${fillLen} ${arcLen}`}
          style={{ filter: `drop-shadow(0 0 5px ${color}88)`, transition: 'stroke-dasharray 0.5s ease' }}
        />

        {/* Threshold tick marks */}
        {thresholds.map(({ pct: tp }) => {
          const tickDeg = startAngleDeg + (tp / 100) * sweepDeg
          const inner = { x: cx + (r - 7) * Math.cos(toRad(tickDeg)), y: cy + (r - 7) * Math.sin(toRad(tickDeg)) }
          const outer = { x: cx + (r + 2) * Math.cos(toRad(tickDeg)), y: cy + (r + 2) * Math.sin(toRad(tickDeg)) }
          return (
            <line key={tp} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeLinecap="round" />
          )
        })}

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          style={{ transition: 'all 0.5s ease' }}
        />
        <circle cx={cx} cy={cy} r={4} fill={color} />

        {/* Risk label */}
        <text x={cx} y={cy - 12} textAnchor="middle" fill={color} fontSize={7} fontWeight="bold" letterSpacing={0.5}>
          {getRiskLabel()}
        </text>
        {/* Percentage */}
        <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize={15} fontWeight="bold">
          {pct}%
        </text>
      </svg>
      <div className="text-text-muted text-xs -mt-1">Crash probability (30 days)</div>
    </div>
  )
}


export default function MLInsights() {
  const { results } = usePortfolio()

  if (!results) return <EmptyState />

  const { ml_intelligence, sentiment_score, regime } = results
  const volForecast = ml_intelligence?.volatility_forecast
  const crashPrediction = ml_intelligence?.crash_prediction
  const alerts = ml_intelligence?.risk_alerts || []

  const regimeColors = {
    Excitement: { color: 'text-accent-amber', bg: 'bg-zinc-800 border-zinc-800', desc: 'Market hype detected — elevated risk' },
    Fear: { color: 'text-accent-red', bg: 'bg-zinc-800 border-zinc-800', desc: 'Fear in market — volatility adjusted upward' },
    Neutral: { color: 'text-accent-green', bg: 'bg-zinc-800 border-zinc-800', desc: 'Market sentiment appears stable' },
  }
  const regimeCfg = regimeColors[regime] || regimeColors.Neutral

  return (
    <div className="space-y-6">
      {/* Top row: Crash Gauge + Sentiment */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Crash Probability */}
        <div className="card flex flex-col items-center text-center md:col-span-1">
          <h3 className="font-heading font-semibold text-text-primary mb-4 self-start flex items-center gap-2">
            <Brain size={18} className="text-zinc-400" />
            Crash Predictor (ML)
          </h3>
          <CrashGauge probability={crashPrediction?.crash_probability || 0} />
          <div className="mt-4 text-xs text-text-muted text-center max-w-xs">
            Gradient Boosting model trained on VIX, sentiment, volatility, and drawdown features. Probability of &gt;5% drawdown in next 30 days.
          </div>
          {crashPrediction?.contributing_factors && (
            <div className="mt-4 w-full space-y-1">
              <div className="text-left text-xs text-text-muted font-semibold mb-2">Key Factors:</div>
              {crashPrediction.contributing_factors.slice(0, 3).map((f, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-mono">{f.feature.split('_').join(' ')}</span>
                  <span className="text-zinc-300 font-semibold">{(f.importance * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sentiment + Regime */}
        <div className="card md:col-span-1">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Gauge size={18} className="text-accent-amber" />
            Market Sentiment
          </h3>

          {/* Sentiment bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-text-muted mb-2">
              <span>🐻 Fear</span>
              <span>😐 Neutral</span>
              <span>🐂 Excitement</span>
            </div>
            <div className="h-3 bg-zinc-900 rounded-full overflow-hidden border border-border-default">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${50 + (sentiment_score || 0) * 50}%`,
                  background: sentiment_score > 0.3 ? 'linear-gradient(90deg, #10B981, #F59E0B)' :
                    sentiment_score < -0.3 ? 'linear-gradient(90deg, #F59E0B, #EF4444)' :
                    'linear-gradient(90deg, #10B981, #34D399)',
                }}
              />
            </div>
            <div className="text-center text-sm font-mono font-bold text-text-primary mt-2">
              {((sentiment_score || 0) > 0 ? '+' : '')}{((sentiment_score || 0) * 100).toFixed(0)}%
            </div>
            <p className="text-text-muted text-xs text-center">Google Trends momentum score</p>
          </div>

          {/* Regime badge */}
          <div className={`border rounded-xl p-3 ${regimeCfg.bg}`}>
            <div className={`font-heading font-bold text-sm ${regimeCfg.color} mb-0.5`}>
              {regime} Regime
            </div>
            <div className="text-text-muted text-xs">{regimeCfg.desc}</div>
          </div>
        </div>

        {/* VIX */}
        <div className="card md:col-span-1">
          <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Activity size={18} className="text-accent-red" />
            VIX Fear Meter
          </h3>
          <div className="text-center py-4">
            <div className={`font-heading text-5xl font-bold mb-2 ${
              (crashPrediction?.vix_current || 20) > 35 ? 'text-accent-red' :
              (crashPrediction?.vix_current || 20) > 25 ? 'text-accent-amber' : 'text-accent-green'
            }`}>
              {(crashPrediction?.vix_current || 20).toFixed(1)}
            </div>
            <div className="text-text-muted text-sm">VIX Index</div>
            <div className={`badge mt-3 ${
              (crashPrediction?.vix_current || 20) > 35 ? 'badge-red' :
              (crashPrediction?.vix_current || 20) > 25 ? 'badge-amber' : 'badge-green'
            }`}>
              {(crashPrediction?.vix_current || 20) > 35 ? 'High Fear' :
               (crashPrediction?.vix_current || 20) > 25 ? 'Elevated' : 'Calm'}
            </div>
          </div>
          <div className="text-text-muted text-xs mt-3 text-center">
            VIX &lt;20: calm · 20–30: elevated · &gt;30: high fear · &gt;40: extreme panic
          </div>
        </div>
      </div>

      {/* Volatility Forecast */}
      <div className="card">
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-zinc-400" />
          ML Volatility Forecast (RandomForest)
          {volForecast?.confidence && (
            <span className={`badge text-xs ml-auto ${
              volForecast.confidence.toLowerCase() === 'high' ? 'badge-green' :
              volForecast.confidence.toLowerCase() === 'medium' ? 'badge-amber' : 'badge-red'
            }`}>
              {volForecast.confidence} confidence
            </span>
          )}
        </h3>

        {volForecast && !volForecast.error ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: '5-Day Forecast', key: 'vol_5d', icon: '📅' },
                { label: '10-Day Forecast', key: 'vol_10d', icon: '🗓️' },
                { label: '30-Day Forecast', key: 'vol_30d', icon: '📆' },
              ].map(f => {
                const val = volForecast[f.key]
                const pct = val ? (val * 100).toFixed(1) : null
                return (
                  <div key={f.key} className="text-center p-4 bg-zinc-900 rounded-xl border border-border-default">
                    <div className="text-lg mb-2">{f.icon}</div>
                    <div className="text-text-muted text-xs mb-1">{f.label}</div>
                    <div className={`font-heading text-2xl font-bold ${
                      !pct ? 'text-text-muted' :
                      parseFloat(pct) > 30 ? 'text-accent-red' :
                      parseFloat(pct) > 20 ? 'text-accent-amber' : 'text-accent-green'
                    }`}>
                      {pct ? `${pct}%` : '—'}
                    </div>
                    <div className="text-text-muted text-xs mt-1">Annualized vol</div>
                  </div>
                )
              })}
            </div>

            {/* Feature importances */}
            {volForecast.feature_importance && typeof volForecast.feature_importance === 'object' && (
              <div>
                <div className="text-text-secondary text-xs font-semibold mb-2 flex items-center gap-1">
                  <Info size={12} className="text-zinc-400" />
                  Top predictive features (5-day model)
                </div>
                {volForecast.feature_importance['vol_5d'] &&
                  Object.entries(volForecast.feature_importance['vol_5d'])
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([feature, importance]) => (
                      <div key={feature} className="flex items-center gap-3 mb-2">
                        <span className="text-text-muted text-xs font-mono w-32 truncate">{feature}</span>
                        <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-500 rounded-full"
                            style={{ width: `${importance * 100}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 text-xs font-mono w-10 text-right">
                          {(importance * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))
                }
              </div>
            )}
          </>
        ) : (
          <div className="text-text-muted text-sm flex items-center gap-2">
            <Info size={14} />
            Insufficient historical data for ML volatility forecast. Try a longer timeframe (1Y+).
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="card">
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent-amber" />
          Smart Risk Alerts
          <span className="badge-amber text-xs ml-auto">
            {alerts.filter(a => !!a.type).length} triggered
          </span>
        </h3>

        {alerts.length === 0 || alerts.every(a => !a.type) ? (
          <div className="text-accent-green text-sm flex items-center gap-2">
            ✓ No risk alerts triggered. Portfolio metrics are within normal ranges.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.filter(a => !!a.type).map((alert, i) => (
              <div key={i} className={`p-3 rounded-xl border text-sm ${
                (alert.severity || '').toLowerCase() === 'critical' ? 'bg-zinc-800 border-zinc-800 text-accent-red' :
                (alert.severity || '').toLowerCase() === 'warning' ? 'bg-zinc-800 border-zinc-800 text-accent-amber' :
                'bg-zinc-800 border-zinc-800 text-zinc-400'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 min-w-[14px]" />
                  <div>
                    <div className="font-semibold text-xs uppercase tracking-wide opacity-70 mb-0.5">
                      {(alert.severity || '').toLowerCase()} · {(alert.type || alert.alert_type || '').replace(/_/g, ' ')}
                    </div>
                    <div>{alert.message || `Value: ${alert.value?.toFixed ? alert.value.toFixed(3) : alert.value} (threshold: ${alert.threshold})`}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
