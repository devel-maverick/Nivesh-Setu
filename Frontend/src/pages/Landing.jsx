import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, Shield, Brain, BarChart, Activity, Zap, ArrowRight,
  CheckCircle, Star, Lock, Globe, Terminal, LineChart, Code, HelpCircle,
  Briefcase, TrendingDown, ChevronUp, ChevronDown, AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Demo data for dashboard preview
const demoMetrics = {
  tickers: ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN'],
  returnPct: '18.42',
  volPct: '24.67',
  varPct: '13.52',
  sharpe: '1.84',
  beta: '1.12',
  crashProb: '23',
}

// --- Hero ---
function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0a0a] text-zinc-50 pt-32 pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="max-w-4xl"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            Institutional risk.<br />
            <span className="text-zinc-500">Zero latency.</span>
          </motion.h1>
          
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="text-xl md:text-2xl text-zinc-400 font-light tracking-tight mb-10 max-w-2xl"
          >
            Nivesh-Setu brings hedge-fund risk tools to retail investors. 
            Run Value at Risk, Monte Carlo, and ML forecasting directly in your browser.
          </motion.p>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <Link to="/signup" className="bg-zinc-50 text-zinc-950 px-8 py-4 rounded-lg font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center">
              Talk to us
            </Link>
            <Link to="/signup" className="text-zinc-400 hover:text-zinc-50 px-8 py-4 font-medium transition-colors flex items-center justify-center">
              Try Demo Portfolio <ArrowRight size={18} className="ml-2" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 relative w-full rounded-2xl border border-white/[0.04] bg-white/[0.02] p-2 md:p-4 backdrop-blur-sm"
        >
          <div className="w-full rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shadow-2xl">
            {/* Window Header */}
            <div className="w-full h-12 border-b border-zinc-800 flex items-center px-4 gap-2 bg-zinc-900">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="ml-4 text-xs text-zinc-500 font-mono">nivesh-setu.app/dashboard</span>
            </div>
            
            {/* Dashboard Content */}
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-50">Portfolio Overview</h3>
                  <p className="text-zinc-500 text-xs">{demoMetrics.tickers.join(' · ')} · 1Y</p>
                </div>
                <span className="px-3 py-1 rounded text-xs font-mono bg-zinc-800 text-zinc-400">LOW RISK</span>
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {[
                  { label: 'Ann. Return', value: `${demoMetrics.returnPct}%`, color: 'text-green-400' },
                  { label: 'Volatility', value: `${demoMetrics.volPct}%`, color: 'text-amber-400' },
                  { label: 'VaR (95%)', value: `-${demoMetrics.varPct}%`, color: 'text-red-400' },
                  { label: 'Sharpe', value: demoMetrics.sharpe, color: 'text-zinc-50' },
                  { label: 'Beta', value: demoMetrics.beta, color: 'text-zinc-400' },
                  { label: 'Crash Prob.', value: `${demoMetrics.crashProb}%`, color: 'text-green-400' },
                ].map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px] mb-1">{m.label}</div>
                    <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>
              
              {/* Realistic Dashboard UI Preview */}
              <div className="grid grid-cols-2 gap-4">
                {/* Simulated Volatility Forecast Card */}
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={14} className="text-zinc-400" />
                    <h3 className="text-xs font-semibold text-zinc-300">ML Volatility Forecast</h3>
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[10px] ml-auto">high confidence</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '5-day', val: '24.1%' },
                      { label: '10-day', val: '25.8%' },
                      { label: '30-day', val: '28.2%' },
                    ].map(f => (
                      <div key={f.label} className="text-center p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                        <div className="text-zinc-500 text-[10px] mb-1">{f.label}</div>
                        <div className="font-bold text-sm text-zinc-50">{f.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Risk Alerts Card */}
                <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={14} className="text-amber-400" />
                    <h3 className="text-xs font-semibold text-zinc-300">Risk Alerts</h3>
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] ml-auto">2 alerts</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 rounded mb-1 bg-red-500/10 text-red-400 text-[10px]">
                      <AlertTriangle size={12} className="min-w-[12px]" />
                      <span>Volatility Spike: 30-day forecast exceeds historical average</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-amber-400 text-[10px]">
                      <AlertTriangle size={12} className="min-w-[12px]" />
                      <span>Correlation Breakdown: Tech sector moving inversely to S&P</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// --- Split View Feature ---
function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0)
  const featuresList = [
    { title: "Core Risk Metrics", description: "VaR, CVaR, Sharpe, Beta, and Max Drawdown calculated in real-time." },
    { title: "Monte Carlo Simulation", description: "10,000 simulated portfolio paths over 252 trading days." },
    { title: "ML Intelligence", description: "Random Forest volatility forecasting and GBM crash predictors." },
    { title: "Alt Data Signals", description: "Real-time Google Trends sentiment scoring and VIX integration." }
  ]

  return (
    <section className="py-24 bg-[#0a0a0a] text-zinc-50 border-t border-white/[0.03]" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16">
          Convert, optimize, distribute.
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="w-full aspect-square md:aspect-video lg:aspect-square border border-white/[0.04] rounded-2xl bg-white/[0.02] p-6 flex flex-col sticky top-24">
            <div className="text-xs font-mono text-zinc-500 mb-4 flex items-center gap-2">
              <Terminal size={14} /> nivesh-core --watch
            </div>
            <div className="flex-1 border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden p-4">
              <div className="text-xs font-mono text-zinc-600 mb-3 tracking-tighter">
                [ RUNNING {featuresList[activeFeature].title.toUpperCase()} ]
              </div>
              
              {/* Dashboard-like preview */}
              <motion.div layout className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'VaR', value: '-2.41%' },
                  { label: 'Sharpe', value: '1.84' },
                  { label: 'Beta', value: '1.12' },
                ].map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-800 text-center">
                    <div className="text-[9px] text-zinc-500 mb-0.5">{m.label}</div>
                    <div className="text-xs font-bold text-zinc-300">{m.value}</div>
                  </div>
                ))}
              </motion.div>
              
              {/* Simulated Deep Analysis Section */}
              <motion.div layout className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-800">
                 <div className="flex items-center justify-between mb-3 text-[10px] text-zinc-400 font-mono">
                    <span>{activeFeature === 0 ? 'RISK_CONTRIBUTION' : activeFeature === 1 ? 'MONTE_CARLO_PATHS' : activeFeature === 2 ? 'FEATURE_IMPORTANCE' : 'SENTIMENT_SCORE'}</span>
                    <span className="text-green-400 text-[9px]">ACTIVE</span>
                 </div>
                 
                 {/* Visual representation based on active feature */}
                 <div className="flex items-end gap-1 h-14">
                    {[40, 70, 45, 90, 65, 30, 85, 55, 75, 50].map((h, i) => (
                      <motion.div 
                        key={i} 
                        layout
                        initial={false}
                        animate={{ height: `${activeFeature === i % 4 ? h + 15 : h}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`flex-1 rounded-sm ${activeFeature === 1 ? 'bg-cyan-500/40' : activeFeature === 2 ? 'bg-amber-500/40' : activeFeature === 3 ? 'bg-green-500/40' : 'bg-red-500/40'}`} 
                      />
                    ))}
                 </div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col">
            {featuresList.map((feature, idx) => (
              <div 
                key={idx}
                className={`group cursor-pointer py-8 border-b border-white/[0.04] transition-colors ${activeFeature === idx ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                onClick={() => setActiveFeature(idx)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-3xl font-semibold tracking-tight">{feature.title}</h3>
                  <kbd className="hidden md:inline-flex px-3 py-1 text-sm border border-white/[0.04] rounded bg-white/[0.02] font-mono text-zinc-500">0{idx + 1}</kbd>
                </div>
                <AnimatePresence>
                  {activeFeature === idx && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="text-zinc-400 font-light text-lg max-w-md overflow-hidden"
                    >
                      {feature.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Bento Box Grid (Secondary Features) ---
function BentoGrid() {
  return (
    <section className="py-24 bg-[#0a0a0a] text-zinc-50 border-t border-white/[0.03]" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Engineered for edge cases.
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          <div className="md:col-span-2 rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8 flex flex-col justify-between hover:border-white/[0.08] transition-colors">
            <div>
              <Activity className="text-zinc-300 mb-6" size={28} />
              <h3 className="text-2xl font-bold tracking-tight mb-2">Markowitz Optimization</h3>
              <p className="text-zinc-400 max-w-md font-light">
                Discover the efficient frontier. Instantly calculate optimal asset weights that maximize your portfolio's Sharpe ratio.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8 flex flex-col justify-between hover:border-white/[0.08] transition-colors">
            <div>
              <Globe className="text-zinc-300 mb-6" size={28} />
              <h3 className="text-2xl font-bold tracking-tight mb-2">Global Data</h3>
              <p className="text-zinc-400 font-light text-sm">
                Seamless integration with Yahoo Finance. Support for any publicly traded asset globally.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8 flex flex-col justify-between hover:border-white/[0.08] transition-colors">
            <div>
              <Lock className="text-zinc-300 mb-6" size={28} />
              <h3 className="text-2xl font-bold tracking-tight mb-2">Stateless Privacy</h3>
              <p className="text-zinc-400 font-light text-sm">
                No tracking. No permanent storage. Your portfolio holdings stay strictly local until explicitly saved.
              </p>
            </div>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8 flex flex-col justify-between hover:border-white/[0.08] transition-colors relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-zinc-800 opacity-20 pointer-events-none p-4">
              <Code size={180} />
            </div>
            <div className="relative z-10">
              <Zap className="text-zinc-300 mb-6" size={28} />
              <h3 className="text-2xl font-bold tracking-tight mb-2">Smart Risk Alerts</h3>
              <p className="text-zinc-400 max-w-md font-light">
                Rule-based parameters mixed with ML anomaly detection. Get instantly alerted on volatility spikes or correlation breakdowns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Metrics ---
function MetricsShowcase() {
  const stats = [
    { value: "-2.41%", label: "Value at Risk (95%)", fill: "60%" },
    { value: "1.84", label: "Sharpe Ratio", fill: "85%" },
    { value: "10K+", label: "Monte Carlo Paths", fill: "100%" },
    { value: "23%", label: "Crash Probability", fill: "23%" },
  ]

  return (
    <section className="py-24 bg-[#0a0a0a] text-zinc-50 border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            What Nivesh-Setu delivers today.
          </h2>
          <p className="text-zinc-400 text-xl font-light max-w-2xl">
            Hardened quantitative models producing real-time institutional metrics with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="flex flex-col border-l border-white/[0.04] pl-6"
            >
              <div className="text-5xl md:text-6xl font-bold tracking-tight tabular-nums mb-4">
                {stat.value}
              </div>
              <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: stat.fill }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1.5, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
                  className="h-full bg-zinc-400" 
                />
              </div>
              <div className="text-sm font-medium text-zinc-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Pricing (with Enterprise) ---
function PricingSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] text-zinc-50 border-t border-white/[0.03]" id="pricing">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16">
          Simple logic. No catch.
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8 flex flex-col transition-all cursor-crosshair hover:border-white/[0.08]"
          >
            <div className="border-b border-white/[0.04] pb-6 mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1">Free</h3>
              <p className="text-zinc-400 text-sm mb-4">Forever access</p>
              <div><span className="text-3xl font-bold">$0</span><span className="text-zinc-500">/mo</span></div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['VaR, CVaR, Sharpe, Beta', 'Monte Carlo simulation', 'ML forecasts', 'Scenario analysis'].map(f => (
                <li key={f} className="flex items-center gap-3 text-zinc-300 font-light text-sm">
                  <CheckCircle size={14} className="text-zinc-600" /> {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="w-full text-center bg-zinc-50 text-zinc-950 px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors">
              Start Building
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border border-white/[0.03] bg-transparent p-8 flex flex-col relative opacity-60 transition-all hover:bg-white/[0.01]"
          >
            <div className="absolute top-6 right-6 text-xs font-mono uppercase tracking-widest text-zinc-500 border border-zinc-800 px-2 py-1 rounded">
              Waitlist
            </div>
            <div className="border-b border-zinc-800 pb-6 mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1">Pro</h3>
              <p className="text-zinc-400 text-sm mb-4">Early access</p>
              <div><span className="text-3xl font-bold">$9</span><span className="text-zinc-500">/mo</span></div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['Saved portfolios', 'PDF Risk Reports', 'Real-time alerts', 'API access'].map(f => (
                <li key={f} className="flex items-center gap-3 text-zinc-400 font-light text-sm">
                  <CheckCircle size={14} className="text-zinc-700" /> {f}
                </li>
              ))}
            </ul>
            <button disabled className="w-full text-center bg-zinc-900 border border-zinc-800 text-zinc-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </motion.div>

          {/* Enterprise */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl border border-white/[0.03] bg-transparent p-8 flex flex-col relative opacity-60 transition-all hover:bg-white/[0.01]"
          >
            <div className="absolute top-6 right-6 text-xs font-mono uppercase tracking-widest text-zinc-500 border border-zinc-800 px-2 py-1 rounded">
              Waitlist
            </div>
            <div className="border-b border-zinc-800 pb-6 mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1">Enterprise</h3>
              <p className="text-zinc-400 text-sm mb-4">Custom integrations</p>
              <div><span className="text-3xl font-bold">Custom</span></div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['Everything in Pro', 'API Access (REST)', 'White-label Reports', 'Custom Risk Models'].map(f => (
                <li key={f} className="flex items-center gap-3 text-zinc-400 font-light text-sm">
                  <CheckCircle size={14} className="text-zinc-700" /> {f}
                </li>
              ))}
            </ul>
            <button disabled className="w-full text-center bg-zinc-900 border border-zinc-800 text-zinc-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed">
              Contact Sales
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// --- FAQs ---
const faqs = [
  { q: 'Is the free plan really free forever?', a: 'Yes. All core risk analytics are free with no hidden costs. We may introduce optional Pro features in the future, but the free tier will always exist.' },
  { q: 'Do you store my portfolio data?', a: 'No. Your portfolio tickers and weights are sent to our backend only during the analysis and are never persisted to any database.' },
  { q: 'What stock exchanges are supported?', a: 'Any ticker supported by Yahoo Finance — US equities, ETFs, and many international listings. Just enter the correct Yahoo Finance ticker symbol.' },
  { q: 'How accurate are the ML models?', a: 'The RandomForest volatility forecaster and GBM crash predictor are trained on historical data. They provide probabilistic signals, not guarantees.' },
  { q: 'How long does analysis take?', a: 'Typically 20–60 seconds depending on the number of tickers and timeframe. The ML models and Monte Carlo simulation add computation time.' },
]

function FAQSection() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <section className="py-24 bg-[#0a0a0a] text-zinc-50 border-t border-white/[0.03]" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 text-center">
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i} 
              layout
              className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5 cursor-pointer transition-colors hover:border-white/[0.08] overflow-hidden" 
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <motion.div layout className="flex items-center justify-between gap-4">
                <span className="font-medium text-zinc-50">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown
                    size={18}
                    className={`min-w-[18px] transition-colors ${openFaq === i ? 'text-zinc-50' : 'text-zinc-500'}`}
                  />
                </motion.div>
              </motion.div>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="text-zinc-400 text-sm leading-relaxed"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- CTA Section ---
function CTASection() {
  return (
    <section className="py-32 bg-[#0a0a0a] text-zinc-50 border-t border-white/[0.03]">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
          Analyze it now.
        </h2>
        <p className="text-xl md:text-2xl text-zinc-400 font-light mb-12 max-w-2xl">
          Get institutional risk metrics on your portfolio in 60 seconds. No account needed.
        </p>
        <Link to="/signup" className="inline-flex items-center justify-center bg-zinc-50 text-zinc-950 px-8 py-5 rounded-xl font-semibold hover:bg-zinc-200 transition-colors text-lg tracking-tight">
          Start Free Analysis <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>
    </section>
  )
}

export default function Landing() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <Hero />
      <MetricsShowcase />
      <FeaturesSection />
      <BentoGrid />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  )
}
