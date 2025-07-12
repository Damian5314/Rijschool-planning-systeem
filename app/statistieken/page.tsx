"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Award, Calendar, Car, Target } from "lucide-react"

export default function Statistieken() {
  const statistieken = {
    totaalLeerlingen: 45,
    actieveLeerlingen: 38,
    afgerondeLeerlingen: 7,
    slagingspercentage: 78,
    gemiddeldeLessen: 24,
    totaalLessen: 1080,
    dezeWeek: 32,
    dezeMaand: 128,
    automaat: {
      aantal: 28,
      slagingspercentage: 82,
    },
    schakel: {
      aantal: 17,
      slagingspercentage: 71,
    },
  }

  const instructeurStats = [
    {
      naam: "Jan Bakker",
      leerlingen: 15,
      slagingspercentage: 85,
      lessenDezeWeek: 12,
    },
    {
      naam: "Lisa de Vries",
      leerlingen: 12,
      slagingspercentage: 75,
      lessenDezeWeek: 10,
    },
    {
      naam: "Mark Peters",
      leerlingen: 11,
      slagingspercentage: 73,
      lessenDezeWeek: 10,
    },
  ]

  const maandelijkseData = [
    { maand: "Sep", leerlingen: 8, geslaagd: 6 },
    { maand: "Okt", leerlingen: 12, geslaagd: 9 },
    { maand: "Nov", leerlingen: 10, geslaagd: 8 },
    { maand: "Dec", leerlingen: 15, geslaagd: 12 },
    { maand: "Jan", leerlingen: 13, geslaagd: 10 },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Statistieken</h2>
        <Badge variant="outline">Laatste update: vandaag</Badge>
      </div>

      {/* Hoofdstatistieken */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leerlingen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistieken.totaalLeerlingen}</div>
            <p className="text-xs text-muted-foreground">
              {statistieken.actieveLeerlingen} actief, {statistieken.afgerondeLeerlingen} afgerond
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slagingspercentage</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistieken.slagingspercentage}%</div>
            <Progress value={statistieken.slagingspercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddeld Lessen</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistieken.gemiddeldeLessen}</div>
            <p className="text-xs text-muted-foreground">Per leerling tot slagen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessen Deze Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistieken.dezeWeek}</div>
            <p className="text-xs text-muted-foreground">Van {statistieken.dezeMaand} deze maand</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Transmissie Verdeling */}
        <Card>
          <CardHeader>
            <CardTitle>Transmissie Verdeling</CardTitle>
            <CardDescription>Verdeling tussen automaat en schakel leerlingen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4" />
                  <span className="font-medium">Automaat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{statistieken.automaat.aantal} leerlingen</span>
                  <Badge variant="default">{statistieken.automaat.slagingspercentage}% slaagkans</Badge>
                </div>
              </div>
              <Progress value={(statistieken.automaat.aantal / statistieken.totaalLeerlingen) * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4" />
                  <span className="font-medium">Schakel</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{statistieken.schakel.aantal} leerlingen</span>
                  <Badge variant="secondary">{statistieken.schakel.slagingspercentage}% slaagkans</Badge>
                </div>
              </div>
              <Progress value={(statistieken.schakel.aantal / statistieken.totaalLeerlingen) * 100} />
            </div>
          </CardContent>
        </Card>

        {/* Instructeur Prestaties */}
        <Card>
          <CardHeader>
            <CardTitle>Instructeur Prestaties</CardTitle>
            <CardDescription>Overzicht per instructeur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {instructeurStats.map((instructeur, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{instructeur.naam}</span>
                    <Badge variant="outline">{instructeur.slagingspercentage}% slaagkans</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{instructeur.leerlingen} leerlingen</span>
                    <span>{instructeur.lessenDezeWeek} lessen deze week</span>
                  </div>
                  <Progress value={instructeur.slagingspercentage} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maandelijkse Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Maandelijkse Trend</CardTitle>
          <CardDescription>Aantal leerlingen en slagingen per maand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maandelijkseData.map((data, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 text-sm font-medium">{data.maand}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Leerlingen: {data.leerlingen}</span>
                    <span>Geslaagd: {data.geslaagd}</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="flex-1 bg-blue-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(data.leerlingen / 15) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-green-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(data.geslaagd / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((data.geslaagd / data.leerlingen) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
