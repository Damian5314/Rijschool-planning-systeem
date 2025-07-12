"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, Mail, MapPin, Car, Euro, FileText, Edit, MessageSquare, Clock, Award, User, Plus } from "lucide-react"

export default function LeerlingProfiel({ params }: { params: { id: string } }) {
  const [leerling] = useState({
    id: 1,
    naam: "Abir (automaat) Alaweh",
    telefoon: "0648222269",
    email: "abiralaweh23@gmail.com",
    adres: "Rodanstraat 30",
    postcode: "3066LA",
    plaats: "Rotterdam",
    transmissie: "Automaat",
    status: "Nieuw",
    instructeur: "Leon Wilson",
    datumLeerlingnummer: "294",
    debiteurNummer: "40",
    leerlingSinds: "08-07-2025",
    tegoed: 0,
    chatViaWhatsApp: true,
  })

  const [lesGeschiedenis] = useState([
    {
      id: 1,
      datum: "21 aug 25",
      tijd: "08:00 (60min)",
      rijles: "B - Praktijkexamen",
      status: "Examen bij Borendrecht (aftel 8)",
      type: "examen",
      opmerkingen: "Uitstekend gereden, geen fouten gemaakt",
    },
    {
      id: 2,
      datum: "21 aug 25",
      tijd: "07:30 (60min)",
      rijles: "Rijles #10",
      status: "Thuis ophalen (voorrijden)",
      type: "les",
      opmerkingen: "Goed geoefend met parkeren",
    },
    {
      id: 3,
      datum: "19 jul 25",
      tijd: "10:30 (60min)",
      rijles: "Rijles #9",
      status: "Thuis ophalen (wil 30 min les)",
      type: "les",
      opmerkingen: "Voorrang oefenen, gaat steeds beter",
    },
    {
      id: 4,
      datum: "15 jul 25",
      tijd: "11:30 (60min)",
      rijles: "Rijles #8",
      status: "Thuis ophalen (wil 30 min les)",
      type: "les",
      opmerkingen: "Inhalen geoefend, meer zelfvertrouwen",
    },
    {
      id: 5,
      datum: "12 jul 25",
      tijd: "10:30 (60min)",
      rijles: "Rijles #7",
      status: "Thuis ophalen (wil 30 min les)",
      type: "les",
      opmerkingen: "Rotonde oefening, nog wat onzeker",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nieuw":
        return "bg-blue-100 text-blue-800"
      case "Actief":
        return "bg-green-100 text-green-800"
      case "Examen":
        return "bg-yellow-100 text-yellow-800"
      case "Geslaagd":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRijlesColor = (type: string) => {
    return type === "examen" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">AaA</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{leerling.naam}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getStatusColor(leerling.status)}>{leerling.status}</Badge>
              <Badge variant="outline">
                <Car className="h-3 w-3 mr-1" />
                {leerling.transmissie}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Profiel bewerken
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Bericht sturen
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Linker kolom - Contact & Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Contactgegevens</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{leerling.telefoon}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{leerling.email}</span>
              </div>
              {leerling.chatViaWhatsApp && (
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Chat via WhatsApp</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Adres</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div>{leerling.adres}</div>
                <div>
                  {leerling.postcode} {leerling.plaats}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leerling Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dation leerlingnummer:</span>
                <span className="font-medium">{leerling.datumLeerlingnummer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Debiteursnummer:</span>
                <span className="font-medium">{leerling.debiteurNummer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Leerling sinds:</span>
                <span className="font-medium">{leerling.leerlingSinds}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Instructeur:</span>
                <span className="font-medium">{leerling.instructeur}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Euro className="h-5 w-5" />
                <span>Tegoed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€ {leerling.tegoed.toFixed(2)}</div>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                Tegoed bijwerken
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Rechter kolom - Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="lesoverzicht" className="space-y-4">
            <TabsList>
              <TabsTrigger value="lesoverzicht">Lesoverzicht</TabsTrigger>
              <TabsTrigger value="examens">Examens</TabsTrigger>
              <TabsTrigger value="financieel">Financieel</TabsTrigger>
              <TabsTrigger value="notities">Notities & Taken</TabsTrigger>
              <TabsTrigger value="tijdlijn">Tijdlijn</TabsTrigger>
            </TabsList>

            <TabsContent value="lesoverzicht" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rijles Geschiedenis</CardTitle>
                  <CardDescription>Overzicht van alle lessen en examens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lesGeschiedenis.map((les) => (
                      <div key={les.id} className="border-l-4 border-blue-200 pl-4 py-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <Badge className={getRijlesColor(les.type)}>{les.rijles}</Badge>
                              <span className="text-sm text-gray-600">
                                {les.datum} - {les.tijd}
                              </span>
                            </div>
                            <div className="text-sm font-medium">{les.status}</div>
                            {les.opmerkingen && <div className="text-sm text-gray-600 italic">"{les.opmerkingen}"</div>}
                          </div>
                          <Button variant="ghost" size="sm">
                            Leskaart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examens" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Examens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">B - Praktijkexamen</div>
                          <div className="text-sm text-gray-600">21 augustus 2025 - 08:00</div>
                          <div className="text-sm text-green-600 font-medium">Geslaagd</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Geslaagd</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financieel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Euro className="h-5 w-5" />
                    <span>Financieel Overzicht</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">Totaal Betaald</div>
                        <div className="text-2xl font-bold text-blue-600">€ 1.250,00</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">Huidig Tegoed</div>
                        <div className="text-2xl font-bold text-green-600">€ {leerling.tegoed.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Laatste betaling: 15 juli 2025 - € 300,00</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Notities & Taken</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                      <div className="font-medium">Aandachtspunten</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Extra oefening nodig met parkeren en voorrang verlenen
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Notitie toevoegen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tijdlijn" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Tijdlijn</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Praktijkexamen geslaagd</div>
                        <div className="text-sm text-gray-600">21 augustus 2025</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Eerste rijles</div>
                        <div className="text-sm text-gray-600">8 juli 2025</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
