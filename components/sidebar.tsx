"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserCheck, Calendar, BarChart3, Settings, Car, Award } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Leerlingen",
    href: "/leerlingen",
    icon: Users,
  },
  {
    title: "Instructeurs",
    href: "/instructeurs",
    icon: UserCheck,
  },
  {
    title: "Voertuigen",
    href: "/voertuigen",
    icon: Car,
  },
  {
    title: "Planning",
    href: "/planning",
    icon: Calendar,
  },
  {
    title: "Examens",
    href: "/examens",
    icon: Award,
  },
  {
    title: "Statistieken",
    href: "/statistieken",
    icon: BarChart3,
  },
  {
    title: "Instellingen",
    href: "/instellingen",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="pb-12 w-64 bg-white border-r flex flex-col">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 mb-4">
            <Car className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Rijschool Systeem</h2>
          </div>
          <div className="space-y-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === item.href ? "bg-muted text-primary" : "",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
      <div className="mt-auto p-4 border-t">
        <LogoutButton />
      </div>
    </div>
  )
}
