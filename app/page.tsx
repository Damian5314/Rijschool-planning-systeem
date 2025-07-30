"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  Car, 
  CalendarDays, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import Link from "next/link"

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  totalInstructeurs: number
  totalVehicles: number
  todayLessons: number
  weekLessons: number
  pendingLessons: number
  completedLessons: number
  maintenanceAlerts: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [todayLessons, setTodayLessons] = useState<any[]>([])
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isInstructeur, isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDashboardData()
    }
  }, [isAuthenticated, authLoading])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [
        studentsRes,
        instructeursRes,
        vehiclesRes,
        todayLessonsRes,
        weekLessonsRes,
        maintenanceRes
      ] = await Promise.all([
        api.getStudents(),
        api.getInstructeurs(),
        api.getVehicles(),
        api.getTodayLessons(),
        api.getWeekLessons(),
        api.getMaintenanceAlerts()
      ])

      // Process students data
      const students = studentsRes.data || []
      const activeStudents = students.filter(s => s.status === 'Actief')

      // Process lessons data
      const todayLessonsData = todayLessonsRes.data || []
      const weekLessonsData = weekLessonsRes.data || []
      const pendingLessons = weekLessonsData.filter(l => l.status === 'Gepland')
      const completedLessons = weekLessonsData.filter(l => l.status === 'Voltooid')

      // Set dashboard stats
      setStats({
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        totalInstructeurs: instructeursRes.data?.length || 0,
        totalVehicles: vehiclesRes.data?.length || 0,
        todayLessons: todayLessonsData.length,
        weekLessons: weekLessonsData.length,
        pendingLessons: pendingLessons.length,
        completedLessons: completedLessons.length,
        maintenanceAlerts: maintenanceRes.data?.length || 0
      })

      setTodayLessons(todayLessonsData)
      setMaintenanceAlerts(maintenanceRes.data || [])

    } catch (error: any) {
      console.error('Dashboard data fetch error:', error)
      toast.error('Kon dashboard gegevens niet laden')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Gepland': return 'default'
      case 'Bevestigd': return 'secondary'
      case 'Voltooid': return 'default'
      case 'Geannuleerd': return 'destructive'
      default: return 'default'
    }
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // HH:MM format
  }

  if (loading || authLoading || !isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welkom terug, {user?.naam}</p>
        </div>
        <Button asChild>
          <Link href="/planning">Naar Planning</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalStudents} totaal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructeurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInstructeurs}</div>
            <p className="text-xs text-muted-foreground">Beschikbaar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voertuigen</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">In vloot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vandaag</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayLessons}</div>
            <p className="text-xs text-muted-foreground">Geplande lessen</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Today's Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lessen Vandaag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayLessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">Geen lessen vandaag</p>
              ) : (
                todayLessons.slice(0, 5).map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{lesson.student_naam}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(lesson.tijd)} - {lesson.instructeur_naam}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeColor(lesson.status)}>
                      {lesson.status}
                    </Badge>
                  </div>
                ))
              )}
              {todayLessons.length > 5 && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/planning">Alle lessen bekijken</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Onderhoud Meldingen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maintenanceAlerts.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Alle voertuigen zijn up-to-date</span>
                </div>
              ) : (
                maintenanceAlerts.slice(0, 5).map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{alert.merk} {alert.model}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.kenteken} - {alert.alert_type}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      Urgent
                    </Badge>
                  </div>
                ))
              )}
              {maintenanceAlerts.length > 5 && (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/voertuigen">Alle meldingen bekijken</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/leerlingen?action=new">
                <Users className="mr-2 h-4 w-4" />
                Nieuwe Leerling
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/planning?action=new">
                <CalendarDays className="mr-2 h-4 w-4" />
                Nieuwe Les
              </Link>
            </Button>
            {user?.rol === 'eigenaar' && (
              <>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/instructeurs?action=new">
                    <Users className="mr-2 h-4 w-4" />
                    Nieuwe Instructeur
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/voertuigen?action=new">
                    <Car className="mr-2 h-4 w-4" />
                    Nieuw Voertuig
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}