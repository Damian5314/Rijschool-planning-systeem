"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Users, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"

// Mock data interfaces
interface LessonData {
  id: number
  date: string
  status: string
}

interface StudentData {
  id: number
  naam: string
  status: string
  startdatum: string
}

export default function StatistiekenPage() {
  const [totalLessons, setTotalLessons] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [activeStudents, setActiveStudents] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchStatisticsData()
  }, [])

  const fetchStatisticsData = async () => {
    try {
      // Mock data for demonstration
      const mockLessons: LessonData[] = [
        { id: 1, date: "2024-07-15", status: "voltooid" },
        { id: 2, date: "2024-07-16", status: "voltooid" },
        { id: 3, date: "2024-07-17", status: "gepland" },
        { id: 4, date: "2024-06-20", status: "voltooid" },
        { id: 5, date: "2024-06-25", status: "voltooid" },
        { id: 6, date: "2024-05-10", status: "voltooid" },
      ]

      const mockStudents: StudentData[] = [
        { id: 1, naam: "Emma van der Berg", status: "Actief", startdatum: "2024-01-15" },
        { id: 2, naam: "Tom Jansen", status: "Examen", startdatum: "2023-11-20" },
        { id: 3, naam: "Sophie Willems", status: "Actief", startdatum: "2024-02-10" },
        { id: 4, naam: "David Smit", status: "Geslaagd", startdatum: "2023-09-05" },
      ]

      setTotalLessons(mockLessons.length)
      setTotalStudents(mockStudents.length)
      setActiveStudents(mockStudents.filter((s) => s.status === "Actief").length)

      // Create chart data
      const chartData = [
        { month: "Mei 2024", lessen: 1, studenten: 0 },
        { month: "Jun 2024", lessen: 2, studenten: 0 },
        { month: "Jul 2024", lessen: 3, studenten: 1 },
      ]

      setChartData(chartData)
    } catch (error: any) {
      console.error("Fout bij het ophalen van statistieken data:", error)
      toast.error("Fout", {
        description: `Kon statistieken data niet ophalen: ${error.message}`,
      })
    }
  }

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat("nl-NL", { month: "short", year: "numeric" }).format(date)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Statistieken
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Lessen</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {totalLessons}
            </div>
            <p className="text-xs text-muted-foreground">Alle voltooide en geplande lessen</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">{activeStudents} actief</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Lesduur</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              60 min
            </div>
            <p className="text-xs text-muted-foreground">Gebaseerd op voltooide lessen</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover glass-effect">
        <CardHeader>
          <CardTitle>Maandelijkse Activiteit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="lessen" fill="#3b82f6" radius={4} />
                <Bar dataKey="studenten" fill="#10b981" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}