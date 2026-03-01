import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Github, Twitter, Linkedin } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Dashboard', href: '/app/dashboard' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Disclaimer', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.03] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-zinc-800">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-text-primary">
                Nivesh<span className="text-zinc-400">Setu</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Institutional-grade portfolio risk intelligence for every retail investor. Free, transparent, open.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="GitHub"><Github size={18} /></a>
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="LinkedIn"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="font-heading font-semibold text-text-primary text-sm mb-4">{group}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-text-muted hover:text-text-secondary text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.03] mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} Nivesh-Setu.
          </p>
          <p className="text-text-muted text-xs">
            Not financial advice. For educational and research purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
