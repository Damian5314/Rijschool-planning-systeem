"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line,
} from "recharts"

const lessonData = [
  { name: "Jan", lessen: 120 },
  { name: "Feb", lessen: 150 },
  { name: "Mrt", lessen: 130 },
  { name: "Apr", lessen: 160 },
  { name: "Mei", lessen: 140 },
  { name: "Jun", lessen: 170 },
]

const revenueData = [
  { name: "Jan", omzet: 5000 },
  { name: "Feb", omzet: 6000 },
  { name: "Mrt", omzet: 5500 },
  { name: "Apr", omzet: 6500 },
  { name: "Mei", omzet: 6000 },
  { name: "Jun", omzet: 7000 },
]

const studentStatusData = [
  { name: "Actief", value: 70 },
  { name: "Gepauzeerd", value: 15 },
  { name: "Afgestudeerd", value: 10 },
  { name: "Inactief", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export default function StatistiekenPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Statistieken</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Les Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Les Trends (Afgelopen 6 maanden)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lessonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lessen" fill="#8884d8" name="Aantal Lessen" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Omzet Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Omzet Trends (Afgelopen 6 maanden)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="omzet" stroke="#82ca9d" name="Totale Omzet" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Status Distributie */}
        <Card>
          <CardHeader>
            <CardTitle>Student Status Distributie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {studentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Meer statistieken kunnen hier worden toegevoegd */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Overige Statistieken</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hier kunnen meer gedetailleerde statistieken worden weergegeven, zoals:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground">
              <li>Gemiddelde lesduur per instructeur</li>
              <li>Slagingspercentages per rijbewijstype</li>
              <li>Populairste lespakketten</li>
              <li>Financiële overzichten per kwartaal</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
