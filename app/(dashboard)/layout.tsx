"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { 
  Plus, 
  Flame, 
  BarChart3, 
  Users, 
  Settings, 
  Menu, 
  Home,
  Target 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SidebarLinkProps {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}

function SidebarLink({ href, icon: Icon, label, badge }: SidebarLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-accent"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
      {badge ? (
        <Badge variant="secondary" className="ml-auto">
          {badge}
        </Badge>
      ) : null}
    </Link>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [unreadCommunityCount] = useState(5) // Example unread count

  const links = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/goals", icon: BarChart3, label: "Goals" },
    { 
      href: "/community", 
      icon: Users, 
      label: "Community",
      badge: unreadCommunityCount 
    },
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-background md:block">
        <div className="flex h-full flex-col gap-4 p-4">
          <div className="flex h-14 items-center border-b px-4">
            <span className="font-semibold">Tandem</span>
          </div>
          <nav className="flex-1 space-y-2">
            {links.map((link) => (
              <SidebarLink key={link.href} {...link} />
            ))}
          </nav>
          <Button 
            className="w-full justify-start gap-2" 
            onClick={() => window.location.href = '/onboarding'}
          >
            <Plus className="h-5 w-5" />
            Create New Goal
          </Button>
          <div className="border-t pt-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background md:hidden">
        <div className="flex h-14 items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <nav className="flex flex-col gap-4 p-4">
                {links.map((link) => (
                  <SidebarLink key={link.href} {...link} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Tandem</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
} 