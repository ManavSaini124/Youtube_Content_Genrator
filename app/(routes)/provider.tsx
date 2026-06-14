"use client"

import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppHeader from "../_components/AppHeader"
import { AppSidebar } from "../_components/AppSidebar"

function DashboardProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider
      className="dashboard-shell"
      style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <main className="dashboard-main">
        <AppHeader />
        <div className="dashboard-content">{children}</div>
      </main>
    </SidebarProvider>
  )
}

export default DashboardProvider
