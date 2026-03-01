import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, X, ArrowRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need for portfolio risk analysis. No signup required.',
    color: 'border-border-default',
    badge: null,
    cta: { label: 'Start Free Analysis', to: '/signup', primary: true },
    features: [
      { label: 'Historical VaR & CVaR', included: true },
      { label: 'Parametric & Monte Carlo VaR', included: true },
      { label: 'Sharpe, Sortino, Beta, Max Drawdown', included: true },
      { label: 'Correlation Heatmap', included: true },
      { label: 'Portfolio Optimization (Efficient Frontier)', included: true },
      { label: 'Scenario Analysis (What-If)', included: true },
      { label: 'Google Trends Sentiment', included: true },
      { label: 'ML Volatility Forecasting', included: true },
      { label: 'Crash Probability Predictor', included: true },
      { label: 'Smart Risk Alerts', included: true },
      { label: 'Saved Portfolios', included: false },
      { label: 'PDF Risk Reports', included: false },
      { label: 'Real-time Alerts', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For investors who want portfolio persistence and advanced reporting.',
    color: 'border-zinc-800',
    badge: 'Coming Soon',
    cta: { label: 'Join Waitlist', to: '#', primary: false },
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Saved Portfolios', included: true },
      { label: 'PDF Risk Reports', included: true },
      { label: 'Real-time Risk Alerts (Email/Push)', included: true },
      { label: 'Portfolio Comparison', included: true },
      { label: 'Custom Benchmarks', included: true },
      { label: 'Historical Report Archive', included: true },
      { label: 'Priority Support', included: true },
      { label: 'API Access', included: false },
      { label: 'White-label Reports', included: false },
      { label: 'Multi-user Collaboration', included: false },
      { label: 'Custom Risk Models', included: false },
      { label: 'Institutional SLA', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For fund managers and research firms needing custom integrations.',
    color: 'border-zinc-800',
    badge: 'Coming Soon',
    cta: { label: 'Contact Sales', to: '#', primary: false },
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'API Access (REST)', included: true },
      { label: 'White-label Reports', included: true },
      { label: 'Multi-user Collaboration', included: true },
      { label: 'Custom Risk Models', included: true },
      { label: 'Institutional SLA', included: true },
      { label: 'Dedicated Support', included: true },
      { label: 'On-premise Deployment', included: true },
      { label: 'Custom Data Sources', included: true },
      { label: 'Factor Models (Fama-French)', included: true },
      { label: 'GARCH Volatility Models', included: true },
      { label: 'Black-Litterman Optimization', included: true },
      { label: 'Real-time Streaming Data', included: true },
    ],
  },
]

export default function Pricing() {
  return (
    <div className="pt-24 pb-16">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6 text-center mb-16"
      >
        <div className="badge-blue mb-4 inline-flex">Pricing</div>
        <h1 className="font-heading text-5xl font-bold text-text-primary mb-4">
          Simple, transparent <span className="text-zinc-400">pricing</span>
        </h1>
        <p className="section-subheading mx-auto">
          Start free with full analytics. Upgrade when you need portfolio persistence and advanced reporting.
        </p>
      </motion.div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          {plans.map(plan => (
            <motion.div
              key={plan.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
              }}
              whileHover={{ scale: 1.02 }}
              className={`card relative flex flex-col border transition-all hover:border-zinc-700 ${plan.color} ${plan.badge ? 'opacity-80' : ''}`}
            >
              {plan.badge && (
                <div className="absolute top-4 right-4 badge-blue text-xs">{plan.badge}</div>
              )}
              <div className="mb-6">
                <h2 className="font-heading text-xl font-semibold text-text-primary mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-heading text-4xl font-bold text-text-primary">{plan.price}</span>
                  <span className="text-text-muted text-sm">/{plan.period}</span>
                </div>
                <p className="text-text-secondary text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm">
                    {f.included
                      ? <CheckCircle size={14} className="text-accent-green min-w-[14px]" />
                      : <X size={14} className="text-text-muted min-w-[14px]" />
                    }
                    <span className={f.included ? 'text-text-secondary' : 'text-text-muted'}>{f.label}</span>
                  </li>
                ))}
              </ul>

              {plan.cta.primary
                ? <Link to={plan.cta.to} className="btn-primary text-center">{plan.cta.label}</Link>
                : <button disabled className="btn-secondary opacity-60 cursor-not-allowed">{plan.cta.label}</button>
              }
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
