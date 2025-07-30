"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Users,
  Calendar,
  Car,
  Award,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Building,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: "Planning",
      href: "/planning",
      icon: Calendar,
      current: pathname === "/planning",
    },
    {
      name: "Leerlingen",
      href: "/leerlingen",
      icon: Users,
      current: pathname.startsWith("/leerlingen"),
    },
    {
      name: "Instructeurs",
      href: "/instructeurs",
      icon: User,
      current: pathname.startsWith("/instructeurs"),
    },
    {
      name: "Voertuigen",
      href: "/voertuigen",
      icon: Car,
      current: pathname.startsWith("/voertuigen"),
    },
    {
      name: "Examens",
      href: "/examens",
      icon: Award,
      current: pathname.startsWith("/examens"),
    },
    {
      name: "Facturatie",
      href: "/facturatie",
      icon: FileText,
      current: pathname.startsWith("/facturatie"),
    },
    {
      name: "Statistieken",
      href: "/statistieken",
      icon: BarChart3,
      current: pathname.startsWith("/statistieken"),
    },
    {
      name: "Instellingen",
      href: "/instellingen",
      icon: Settings,
      current: pathname.startsWith("/instellingen"),
    },
  ]

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Willes-Rijschool</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                item.current
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                  item.current ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-3 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 w-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                    {getInitials(user?.naam || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.naam || "User"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.rol || "gebruiker"}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.naam || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
                <Badge variant="secondary" className="w-fit text-xs">
                  {user?.rol || "gebruiker"}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/instellingen" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Instellingen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Uitloggen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}