import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { Loader2 } from 'lucide-react'

// Layouts
import MarketingLayout from './layouts/MarketingLayout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'

// Marketing Pages
import Landing from './pages/Landing.jsx'
import Pricing from './pages/Pricing.jsx'
import About from './pages/About.jsx'

// Auth Pages
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'

// Dashboard Pages
import Dashboard from './pages/Dashboard.jsx'
import Portfolio from './pages/Portfolio.jsx'
import RiskAnalysis from './pages/RiskAnalysis.jsx'
import Simulations from './pages/Simulations.jsx'
import MLInsights from './pages/MLInsights.jsx'
import Settings from './pages/Settings.jsx'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

// Inner component (only mounted when HAS_CLERK is true — safe to call useAuth)
function ClerkProtectedRoute({ children }) {
  const { isLoaded } = useAuth()

  // Show a full-screen spinner while Clerk initializes so the UI doesn't get stuck
  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 size={32} className="text-zinc-500 animate-spin" />
    </div>
  )

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn redirectUrl="/login" /></SignedOut>
    </>
  )
}

// Protected Route Wrapper — requires Clerk auth when configured, bypasses otherwise
function ProtectedRoute({ children }) {
  if (!HAS_CLERK) return children
  return <ClerkProtectedRoute>{children}</ClerkProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Marketing Routes */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboard Routes (Protected) */}
        <Route path="/app" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="risk" element={<RiskAnalysis />} />
          <Route path="simulations" element={<Simulations />} />
          <Route path="ml-insights" element={<MLInsights />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
