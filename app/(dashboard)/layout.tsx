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
  ChevronLeft,
  ChevronRight,
  Command,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  isCollapsed: boolean
  onToggle: () => void
}

const links = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Goals", icon: BarChart3, href: "/goals" },
  { name: "Community", icon: Users, href: "/community" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Create New Goal", icon: Target, href: "/onboarding" },
]

function Sidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  
  return (
    <div className={cn("relative pb-12", className)}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 z-20 rounded-full border shadow-md"
        onClick={onToggle}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className={cn(
            "mb-2 flex items-center space-x-2",
            isCollapsed && "justify-center"
          )}>
            <Command className="h-6 w-6" />
            {!isCollapsed && <h2 className="text-lg font-semibold">Menu</h2>}
          </div>
          <div className="space-y-1">
            {links.map((link) => (
              <Button
                key={link.name}
                variant={pathname === link.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
                asChild
              >
                <Link href={link.href}>
                  <link.icon className={cn(
                    "h-4 w-4",
                    !isCollapsed && "mr-2"
                  )} />
                  {!isCollapsed && <span>{link.name}</span>}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* User Profile Section */}
      <div className="px-3 py-2 border-t">
        <div className={cn(
          "px-4 py-2 flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && <span className="text-sm font-medium">Account</span>}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:block border-r min-h-screen transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-64"
      )}>
        <div className="sticky top-0">
          <div className={cn(
            "flex h-14 items-center border-b px-6 transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-start"
          )}>
            <Flame className="h-5 w-5 text-primary" />
            {!isCollapsed && <span className="ml-2 font-semibold">Tandem</span>}
          </div>
          <Sidebar 
            isCollapsed={isCollapsed} 
            onToggle={() => setIsCollapsed(!isCollapsed)} 
          />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden absolute left-4 top-4">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center border-b px-6 font-semibold">
            <Flame className="mr-2 h-5 w-5 text-primary" />
            Tandem
          </div>
          <Sidebar 
            isCollapsed={false} 
            onToggle={() => {}} 
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
} 