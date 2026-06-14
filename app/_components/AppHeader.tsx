"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import ProfileModal from "./ProfileModal"

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/ai-thumbnail-generator": "Thumbnail generator",
  "/thumbnail-search": "Thumbnail search",
  "/outlier": "Outlier finder",
  "/ai-content-generator": "Content generator",
  "/billing": "Billing",
  "/coming-soon": "Coming soon",
}

function AppHeader() {
  const pathname = usePathname()
  const title = pageNames[pathname] || "Imagine & Build"

  return (
    <header className="dashboard-header">
      <div className="dashboard-header__title">
        <SidebarTrigger
          className="dashboard-sidebar-trigger"
          aria-label="Open or close sidebar"
          title="Open or close sidebar"
        />
        <div>
          <p>Workspace</p>
          <h2>{title}</h2>
        </div>
      </div>
      <ProfileModal />
    </header>
  )
}

export default AppHeader
