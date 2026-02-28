import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Briefcase, 
  BarChart2, 
  TrendingUp, 
  Brain, 
  Settings, 
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', to: '/app/dashboard' },
  { icon: Briefcase, label: 'Portfolio', to: '/app/portfolio' },
  { icon: BarChart2, label: 'Risk Analysis', to: '/app/risk' },
  { icon: TrendingUp, label: 'Simulations', to: '/app/simulations' },
  { icon: Brain, label: 'ML Insights', to: '/app/ml-insights' },
]

const bottomItems = [
  { icon: Settings, label: 'Settings', to: '/app/settings' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-border-default"
      style={{
        width: collapsed ? '72px' : '240px',
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border-default">
        <div className="w-8 h-8 min-w-[2rem] rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-800">
          <TrendingUp size={16} className="text-zinc-50" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-base text-zinc-50 whitespace-nowrap">
            Nivesh<span className="text-zinc-400">Setu</span>
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="min-w-[18px]" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-border-default space-y-1">
        {bottomItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="min-w-[18px]" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`sidebar-item w-full ${collapsed ? 'justify-center' : 'justify-between'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!collapsed && <span className="text-sm text-text-muted">Collapse</span>}
          {collapsed
            ? <ChevronRight size={16} />
            : <ChevronLeft size={16} />
          }
        </button>
      </div>
    </aside>
  )
}
