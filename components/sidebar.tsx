"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar,
  Users,
  Car,
  GraduationCap,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Receipt,
} from "lucide-react"
import { LogoutButton } from "./logout-button"

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Planning", href: "/planning", icon: Calendar },
  { name: "Leerlingen", href: "/leerlingen", icon: Users },
  { name: "Instructeurs", href: "/instructeurs", icon: GraduationCap },
  { name: "Voertuigen", href: "/voertuigen", icon: Car },
  { name: "Examens", href: "/examens", icon: FileText },
  { name: "Facturatie", href: "/facturatie", icon: Receipt },
  { name: "Statistieken", href: "/statistieken", icon: BarChart3 },
  { name: "Instellingen", href: "/instellingen", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out md:relative md:z-auto",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Car className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Willes-Rijschool
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-slate-400 hover:text-white hover:bg-slate-700"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-slate-700/50 hover:text-white group",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-white",
                      )}
                    />
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-slate-700 p-4">
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="text-xs text-slate-400 mb-2">
                  <div>Willes-Rijschool</div>
                  <div>Versie 1.0.0</div>
                </div>
              )}
              <LogoutButton collapsed={isCollapsed} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
