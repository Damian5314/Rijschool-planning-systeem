"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Calendar, Car, ClipboardList, DollarSign, Home, Settings, Users, BarChart2, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { LogoutButton } from "./logout-button"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isAdmin, isInstructeur } = useAuth()

  const navItems = [
    {
      title: "Algemeen",
      items: [
        {
          href: "/",
          icon: Home,
          text: "Dashboard",
        },
        {
          href: "/planning",
          icon: Calendar,
          text: "Planning",
        },
        {
          href: "/leerlingen",
          icon: Users,
          text: "Leerlingen",
        },
        {
          href: "/instructeurs",
          icon: ClipboardList,
          text: "Instructeurs",
        },
        {
          href: "/voertuigen",
          icon: Car,
          text: "Voertuigen",
        },
      ],
    },
    {
      title: "Financieel",
      items: [
        {
          href: "/facturatie",
          icon: DollarSign,
          text: "Facturatie",
        },
      ],
    },
    {
      title: "Rapportage",
      items: [
        {
          href: "/statistieken",
          icon: BarChart2,
          text: "Statistieken",
        },
        {
          href: "/examens",
          icon: ClipboardList,
          text: "Examens",
        },
      ],
    },
    {
      title: "Systeem",
      items: [
        {
          href: "/instellingen",
          icon: Settings,
          text: "Instellingen",
        },
      ],
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Car className="h-6 w-6" />
          <span className="text-lg">Rijschool Plansysteem</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navItems.map((group, index) => (
          <React.Fragment key={group.title}>
            <SidebarGroup>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.text}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            {index < navItems.length - 1 && <SidebarSeparator />}
          </React.Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1 text-sm">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{user.naam}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.rol}</span>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
