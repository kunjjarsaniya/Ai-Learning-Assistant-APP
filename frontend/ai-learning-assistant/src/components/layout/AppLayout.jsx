import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout