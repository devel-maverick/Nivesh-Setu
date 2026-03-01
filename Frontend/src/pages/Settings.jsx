import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { Settings as SettingsIcon, User, Bell, Shield, Info } from 'lucide-react'

export default function Settings() {
  const { user } = useUser()

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="card">
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <User size={18} className="text-zinc-400" />
          Profile
        </h3>
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-800 flex items-center justify-center font-heading font-bold text-zinc-50 text-xl">
              {user?.firstName?.[0] || 'U'}
            </div>
          )}
          <div>
            <div className="font-heading font-semibold text-text-primary">{user?.fullName || 'User'}</div>
            <div className="text-text-muted text-sm">{user?.primaryEmailAddress?.emailAddress}</div>
            <div className="badge-blue mt-1 text-xs">Free Plan</div>
          </div>
        </div>
      </div>

      {/* Analysis Preferences */}
      <div className="card">
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <SettingsIcon size={18} className="text-zinc-400" />
          Analysis Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-sm block mb-2">Default Timeframe</label>
            <select className="input-field w-48 py-2">
              <option value="1Y">1 Year</option>
              <option value="3Y">3 Years</option>
              <option value="5Y">5 Years</option>
            </select>
          </div>
          <div>
            <label className="text-text-secondary text-sm block mb-2">Risk-Free Rate</label>
            <div className="flex items-center gap-3">
              <input type="number" className="input-field w-32 py-2" defaultValue="4.0" step="0.1" min="0" max="10" />
              <span className="text-text-muted text-sm">% (used in Sharpe/Sortino)</span>
            </div>
          </div>
          <div>
            <label className="text-text-secondary text-sm block mb-2">Monte Carlo Paths</label>
            <select className="input-field w-48 py-2">
              <option value="1000">1,000 paths</option>
              <option value="5000">5,000 paths</option>
              <option value="10000">10,000 paths</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications (Coming Soon) */}
      <div className="card opacity-70">
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Bell size={18} className="text-accent-amber" />
          Notifications
          <span className="badge-amber text-xs ml-auto">Coming Soon</span>
        </h3>
        <p className="text-text-muted text-sm">Email and push alerts when risk thresholds are breached. Available in Pro tier.</p>
      </div>

      {/* Privacy */}
      <div className="card">
        <h3 className="font-heading font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield size={18} className="text-accent-green" />
          Privacy & Data
        </h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-zinc-500 mt-0.5" />
            Portfolio data is <strong className="text-text-primary">never stored</strong> on our servers. All analysis is ephemeral.
          </div>
          <div className="flex items-start gap-2">
            <Info size={14} className="text-zinc-500 mt-0.5" />
            Only your account details (email, name) are stored by Clerk (our auth provider).
          </div>
          <div className="flex items-start gap-2">
            <Info size={14} className="text-zinc-500 mt-0.5" />
            No portfolio data is shared with third parties.
          </div>
        </div>
      </div>
    </div>
  )
}
