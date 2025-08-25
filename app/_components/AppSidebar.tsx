"use client"

import React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar"
import {
  BookType,
  ChartNoAxesColumn,
  GalleryThumbnails,
  Gauge,
  Home,
  ImageIcon,
  Lightbulb,
  Settings,
  User2,
} from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Thumbnails Generator", url: "/ai-thumbnail-generator", icon: ImageIcon },
  { title: "Thumbnails Search", url: "/thumbnail-search", icon: GalleryThumbnails },
  { title: "Keywords", url: "/trending-keywords", icon: BookType },
  { title: "Optimize", url: "/coming-soon", icon: ChartNoAxesColumn },
  { title: "Outlier", url: "/outlier", icon: Gauge },
  { title: "AI Content Generator", url: "/ai-content-generator", icon: Lightbulb },
  { title: "Billing", url: "/billing", icon: Settings },
  { title: "Profile", url: "#", icon: User2 },
]

export function AppSidebar() {
  const path = usePathname()

  return (
    <Sidebar className="bg-gradient-to-b from-[#ff7917]/10 via-[#584424]/10 to-[#68dbff]/10 shadow-lg border-r border-gray-200 dark:border-gray-800">
      {/* Logo / Header */}
      <SidebarHeader>
        <div className="flex flex-col items-center justify-center p-6">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-[#ff7917] via-[#584424] to-[#68dbff] shadow-md">
            <Image
              src="/logo.svg"
              alt="App Logo"
              width={80}
              height={80}
              className="rounded-xl"
              priority
            />
          </div>
          <h2 className="mt-3 text-sm font-semibold gradient-text">
            Imagine & Build
          </h2>
        </div>
      </SidebarHeader>

      {/* Menu Items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-3">
              {items.map((item, index) => {
                const active = path === item.url
                return (
                  <a
                    key={index}
                    href={item.url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      ${
                        active
                          ? "bg-gradient-to-r from-[#ff7917] via-[#584424] to-[#68dbff] text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
                      }`}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-transform ${
                        active ? "scale-110 text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span>{item.title}</span>
                  </a>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <div className="p-4 text-xs text-gray-400 dark:text-gray-500 text-center border-t border-gray-200 dark:border-gray-800">
          © 2025 Imagine & Build
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
