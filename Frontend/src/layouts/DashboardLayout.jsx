import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import DashboardNavbar from '../components/DashboardNavbar.jsx'
import { PortfolioProvider } from '../context/PortfolioContext.jsx'

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <PortfolioProvider>
      <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </PortfolioProvider>
  )
}
