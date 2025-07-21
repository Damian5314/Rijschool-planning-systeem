"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, Car, CalendarDays } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Bar, Line } from "recharts"
import { toast } from "@/components/ui/use-toast"
import type { Student, Instructor, Lesson } from "@/lib/data"

const chartConfig = {
  lessons: {
    label: "Lessen",
    color: "hsl(var(--primary))",
  },
  students: {
    label: "Leerlingen",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalInstructors, setTotalInstructors] = useState(0)
  const [upcomingLessons, setUpcomingLessons] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students`)
      if (!studentsRes.ok) throw new Error("Failed to fetch students")
      const studentsData: Student[] = await studentsRes.json()
      setTotalStudents(studentsData.length)

      // Fetch instructors
      const instructorsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/instructeurs`)
      if (!instructorsRes.ok) throw new Error("Failed to fetch instructors")
      const instructorsData: Instructor[] = await instructorsRes.json()
      setTotalInstructors(instructorsData.length)

      // Fetch lessons and process for upcoming and chart data
      const lessonsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons`)
      if (!lessonsRes.ok) throw new Error("Failed to fetch lessons")
      const lessonsData: Lesson[] = await lessonsRes.json()

      const now = new Date()
      const upcoming = lessonsData.filter((lesson) => new Date(`${lesson.date}T${lesson.time}:00`) > now).length
      setUpcomingLessons(upcoming)

      // Aggregate data for chart (e.g., lessons per month)
      const monthlyData: { [key: string]: { month: string; lessons: number; students: number } } = {}
      lessonsData.forEach((lesson) => {
        const lessonDate = new Date(lesson.date)
        const monthYear = `${lessonDate.getFullYear()}-${(lessonDate.getMonth() + 1).toString().padStart(2, "0")}`
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month: format(lessonDate, "MMM yyyy"), lessons: 0, students: 0 }
        }
        monthlyData[monthYear].lessons += 1
      })

      studentsData.forEach((student) => {
        const startDate = new Date(student.startDate)
        const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}`
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month: format(startDate, "MMM yyyy"), lessons: 0, students: 0 }
        }
        monthlyData[monthYear].students += 1
      })

      const sortedChartData = Object.values(monthlyData).sort((a, b) => {
        const [monthA, yearA] = a.month.split(" ")
        const [monthB, yearB] = b.month.split(" ")
        const dateA = new Date(`${monthA} 1, ${yearA}`)
        const dateB = new Date(`${monthB} 1, ${yearB}`)
        return dateA.getTime() - dateB.getTime()
      })

      setChartData(sortedChartData)
    } catch (error: any) {
      console.error("Fout bij het ophalen van dashboard data:", error)
      toast({
        title: "Fout",
        description: `Kon dashboard data niet ophalen: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  function format(date: Date, fmt: string) {
    // Simple format for chart labels, replace with date-fns if needed
    const options: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" }
    return new Intl.DateTimeFormat("nl-NL", options).format(date)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Actieve en afgestudeerde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Instructeurs</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstructors}</div>
            <p className="text-xs text-muted-foreground">Beschikbare instructeurs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aankomende Lessen</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingLessons}</div>
            <p className="text-xs text-muted-foreground">Gepland voor de komende 7 dagen</p>
          </CardContent>
        </Card>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Overzicht Lessen & Leerlingen</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="lessons" fill="var(--color-lessons)" radius={4} />
              <Line type="monotone" dataKey="students" stroke="var(--color-students)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
