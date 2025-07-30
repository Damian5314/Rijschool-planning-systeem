"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart } from "recharts"
import { toast } from "@/components/ui/use-toast"
import type { Lesson, Student } from "@/lib/data"

const chartConfig = {
  lessons: {
    label: "Lessen",
    color: "hsl(var(--primary))",
  },
  students: {
    label: "Nieuwe Leerlingen",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig

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
      // Fetch lessons
      const lessonsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons`)
      if (!lessonsRes.ok) throw new Error("Failed to fetch lessons")
      const lessonsData: Lesson[] = await lessonsRes.json()
      setTotalLessons(lessonsData.length)

      // Fetch students
      const studentsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students`)
      if (!studentsRes.ok) throw new Error("Failed to fetch students")
      const studentsData: Student[] = await studentsRes.json()
      setTotalStudents(studentsData.length)
      setActiveStudents(studentsData.filter((s) => s.status === "Actief").length)

      // Aggregate data for chart (e.g., lessons and new students per month)
      const monthlyData: { [key: string]: { month: string; lessons: number; students: number } } = {}

      lessonsData.forEach((lesson) => {
        const lessonDate = new Date(lesson.date)
        const monthYear = `${lessonDate.getFullYear()}-${(lessonDate.getMonth() + 1).toString().padStart(2, "0")}`
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month: formatMonthYear(lessonDate), lessons: 0, students: 0 }
        }
        monthlyData[monthYear].lessons += 1
      })

      studentsData.forEach((student) => {
        const startDate = new Date(student.startDate)
        const monthYear = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}`
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month: formatMonthYear(startDate), lessons: 0, students: 0 }
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
      console.error("Fout bij het ophalen van statistieken data:", error)
      toast({
        title: "Fout",
        description: `Kon statistieken data niet ophalen: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat("nl-NL", { month: "short", year: "numeric" }).format(date)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <h1 className="text-lg font-semibold md:text-2xl">Statistieken</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Lessen</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">Alle voltooide en geplande lessen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">{activeStudents} actief</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Lesduur</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60 min</div> {/* Placeholder, calculate from lessons */}
            <p className="text-xs text-muted-foreground">Gebaseerd op voltooide lessen</p>
          </CardContent>
        </Card>
      </div>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Maandelijkse Activiteit</CardTitle>
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
//test