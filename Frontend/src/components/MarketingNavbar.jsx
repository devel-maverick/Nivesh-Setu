import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Menu, X, TrendingUp, BarChart2, ChevronRight } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

export default function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Handle cross-page hash routing
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } else if (location.pathname === '/' && !location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-[#0a0a0a]/85 backdrop-blur-md border-white/[0.06]' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 border border-zinc-800">
            <TrendingUp size={16} className="text-zinc-50" />
          </div>
          <span className="font-heading font-bold text-lg text-zinc-50">
            Nivesh<span className="text-zinc-400">Setu</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.label} to={link.href} className="text-zinc-400 hover:text-zinc-50 font-medium text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <SignedOut>
            <Link to="/login" className="text-zinc-400 hover:text-zinc-50 text-sm font-medium transition-colors">Sign In</Link>
            <Link to="/signup" className="bg-zinc-50 text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center">
              Get Started <ChevronRight size={14} className="ml-1" />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link to="/app/dashboard" className="bg-zinc-50 text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center">
              <BarChart2 size={14} className="mr-1.5" /> Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/[0.04] px-6 pb-6 absolute top-full left-0 right-0 shadow-2xl">
          <nav className="flex flex-col gap-2 pt-4">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.href}
                className="text-zinc-400 hover:text-zinc-50 font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3 mt-4">
            <SignedOut>
              <Link to="/login" className="border border-zinc-800 text-zinc-300 w-full text-center py-3 rounded-lg font-medium hover:bg-zinc-900 transition-colors" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/signup" className="bg-zinc-50 text-zinc-950 w-full text-center py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </SignedOut>
            <SignedIn>
              <Link to="/app/dashboard" className="bg-zinc-50 text-zinc-950 w-full text-center py-3 rounded-lg font-medium hover:bg-zinc-200 transition-colors" onClick={() => setMobileOpen(false)}>
                Open Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      )}
    </header>
  )
}
