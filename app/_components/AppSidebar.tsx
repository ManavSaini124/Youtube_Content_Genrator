"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ArrowUpRight,
  ChartNoAxesColumn,
  GalleryThumbnails,
  Gauge,
  Home,
  ImageIcon,
  Lightbulb,
  Settings,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const workspaceItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Content generator", url: "/ai-content-generator", icon: Lightbulb },
  { title: "Thumbnail generator", url: "/ai-thumbnail-generator", icon: ImageIcon },
  { title: "Thumbnail search", url: "/thumbnail-search", icon: GalleryThumbnails },
  { title: "Outlier finder", url: "/outlier", icon: Gauge },
  { title: "Optimize", url: "/coming-soon", icon: ChartNoAxesColumn },
]

const accountItems = [
  { title: "Billing", url: "/billing", icon: Settings },
]

export function AppSidebar() {
  const path = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false)
  }

  const renderItems = (items: typeof workspaceItems) =>
    items.map((item) => {
      const active = path === item.url

      return (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            asChild
            isActive={active}
            size="lg"
            tooltip={item.title}
            className="dashboard-sidebar__item"
          >
            <Link href={item.url} onClick={closeMobileSidebar}>
              <item.icon aria-hidden="true" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })

  return (
    <Sidebar className="dashboard-sidebar" variant="inset" collapsible="offcanvas">
      <SidebarHeader className="dashboard-sidebar__header">
        <Link className="dashboard-sidebar__brand" href="/" onClick={closeMobileSidebar}>
          <span className="dashboard-sidebar__mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="dashboard-sidebar__brand-copy">
            <strong>Imagine &amp; Build</strong>
            <small>Creator workspace</small>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="dashboard-sidebar__content">
        <SidebarGroup className="dashboard-sidebar__group">
          <SidebarGroupLabel className="dashboard-sidebar__label">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(workspaceItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="dashboard-sidebar__group">
          <SidebarGroupLabel className="dashboard-sidebar__label">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(accountItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="dashboard-sidebar__footer">
        <div>
          <span>Current plan</span>
          <strong>Basic</strong>
        </div>
        <Link href="/billing" onClick={closeMobileSidebar} aria-label="Manage billing">
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
