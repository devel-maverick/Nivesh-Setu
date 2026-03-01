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
import { motion } from 'framer-motion'

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
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  }

  const itemVars = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

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
      <motion.nav 
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="flex-1 px-2 py-4 space-y-1 overflow-y-auto"
      >
        {navItems.map(item => (
          <motion.div key={item.to} variants={itemVars}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item group ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <item.icon size={18} className="min-w-[18px]" />
              </motion.div>
              {!collapsed && <span className="text-sm transition-colors">{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}
      </motion.nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-border-default space-y-1">
        {bottomItems.map(item => (
          <motion.div key={item.to} variants={itemVars}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item group ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <item.icon size={18} className="min-w-[18px]" />
              </motion.div>
              {!collapsed && <span className="text-sm transition-colors">{item.label}</span>}
            </NavLink>
          </motion.div>
        ))}

        {/* Collapse Toggle */}
        <motion.button
          variants={itemVars}
          whileHover={{ x: collapsed ? 2 : -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className={`sidebar-item w-full ${collapsed ? 'justify-center' : 'justify-between'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {!collapsed && <span className="text-sm text-text-muted transition-colors">Collapse</span>}
          {collapsed
            ? <ChevronRight size={16} className="text-zinc-500" />
            : <ChevronLeft size={16} className="text-zinc-500" />
          }
        </motion.button>
      </div>
    </aside>
  )
}
