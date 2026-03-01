import React from 'react'
import { Outlet } from 'react-router-dom'
import MarketingNavbar from '../components/MarketingNavbar.jsx'
import Footer from '../components/Footer.jsx'

export default function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
