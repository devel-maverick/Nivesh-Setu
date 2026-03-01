import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { SignUp, useAuth } from '@clerk/clerk-react'
import { Loader2, TrendingUp, CheckCircle } from 'lucide-react'

const perks = [
  'All 25+ risk metrics included',
  'Monte Carlo & ML models',
  'No credit card required',
  'Analysis in under 60 seconds',
]

export default function SignupPage() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 size={32} className="text-zinc-500 animate-spin" />
    </div>
  )

  if (isSignedIn) return <Navigate to="/app/dashboard" replace />

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-20 relative overflow-hidden bg-[#0a0a0a] border-r border-white/[0.03]">

        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-800">
            <TrendingUp size={20} className="text-zinc-50" />
          </div>
          <span className="font-heading font-bold text-xl text-zinc-50">
            Nivesh<span className="text-zinc-400">Setu</span>
          </span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Start your <span className="text-zinc-500">risk analysis</span><br />
            journey today
          </h2>
          <p className="text-zinc-400 mb-12 leading-relaxed max-w-md">
            Join investors and quant enthusiasts who use Nivesh-Setu to understand their portfolio risk like never before.
          </p>
          <div className="space-y-3">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle size={16} className="text-accent-green" />
                <span className="text-text-secondary text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-600 text-xs relative z-10 font-mono tracking-tight">
          Not financial advice. For educational and research purposes only.
        </p>
      </div>

      {/* Right — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-[#0a0a0a]">
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
            Create your account
          </h1>
          <p className="text-text-muted text-sm text-center mb-8">
            Free forever. No credit card required.
          </p>

          <SignUp
            routing="hash"
            redirectUrl="/app/portfolio"
          />
        </div>
      </div>
    </div>
  )
}
