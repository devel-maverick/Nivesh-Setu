import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { SignIn, useAuth } from '@clerk/clerk-react'
import { Loader2, TrendingUp, Shield, Brain, BarChart2 } from 'lucide-react'

const highlights = [
  { icon: Shield, text: 'VaR, CVaR & 25+ risk metrics' },
  { icon: Brain, text: 'ML Volatility & Crash Forecasting' },
  { icon: BarChart2, text: 'Monte Carlo Simulation (10K paths)' },
]

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 size={32} className="text-zinc-500 animate-spin" />
    </div>
  )

  if (isSignedIn) return <Navigate to="/app/dashboard" replace />

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-20 relative overflow-hidden bg-[#0a0a0a] border-r border-white/[0.03]">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-800">
            <TrendingUp size={20} className="text-zinc-50" />
          </div>
          <span className="font-heading font-bold text-xl text-zinc-50">
            Nivesh<span className="text-zinc-400">Setu</span>
          </span>
        </Link>

        {/* Center Content */}
        <div className="relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Institutional risk.<br />
            <span className="text-zinc-500">Zero latency.</span>
          </h2>
          <p className="text-zinc-400 mb-12 leading-relaxed max-w-md">
            Sign in to analyze your portfolio with institutional-grade risk tools. 100% free.
          </p>
          <div className="space-y-4">
            {highlights.map(h => (
              <div key={h.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <h.icon size={14} className="text-zinc-400" />
                </div>
                <span className="text-zinc-400 text-sm">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-zinc-600 text-xs relative z-10 font-mono tracking-tight">
          *Bringing institutional-grade risk analytics to every retail investor.*
        </p>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#0a0a0a]">
        {/* Mobile Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-800">
            <TrendingUp size={16} className="text-zinc-50" />
          </div>
          <span className="font-heading font-bold text-lg text-zinc-50">
            Nivesh<span className="text-zinc-400">Setu</span>
          </span>
        </Link>

        <div className="w-full max-w-md">
          <h1 className="font-heading text-2xl font-bold text-text-primary mb-2 text-center">
            Welcome back
          </h1>
          <p className="text-text-muted text-sm text-center mb-8">
            Sign in to continue to your dashboard
          </p>

          <SignIn
            routing="hash"
            redirectUrl="/app/dashboard"
          />
        </div>
      </div>
    </div>
  )
}
