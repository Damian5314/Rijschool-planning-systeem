"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Phone,
  Mail,
  MapPin,
  Car,
  Euro,
  FileText,
  Edit,
  MessageSquare,
  Clock,
  Award,
  User,
  Plus,
  ArrowLeft,
} from "lucide-react"
import { leerlingenData } from "@/lib/data"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function LeerlingProfiel({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [leerling, setLeerling] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const leerlingId = Number.parseInt(params.id)
    const gevondenLeerling = leerlingenData.find((l) => l.id === leerlingId)

    if (gevondenLeerling) {
      setLeerling(gevondenLeerling)
    } else {
      toast({
        title: "Leerling niet gevonden",
        description: "De opgevraagde leerling bestaat niet.",
        variant: "destructive",
      })
      router.push("/leerlingen")
    }
    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="md:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!leerling) {
    return null
  }

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

  const getInitials = (naam: string) => {
    return naam
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleEditProfile = () => {
    toast({
      title: "Profiel bewerken",
      description: "Profiel bewerken functionaliteit wordt binnenkort toegevoegd.",
    })
  }

  const handleSendMessage = () => {
    toast({
      title: "Bericht versturen",
      description: "Bericht functionaliteit wordt binnenkort toegevoegd.",
    })
  }

  const handleUpdateTegoed = () => {
    toast({
      title: "Tegoed bijwerken",
      description: "Tegoed bijwerken functionaliteit wordt binnenkort toegevoegd.",
    })
  }

  const handleAddNote = () => {
    toast({
      title: "Notitie toevoegen",
      description: "Notitie toevoegen functionaliteit wordt binnenkort toegevoegd.",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/leerlingen")} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
              {getInitials(leerling.naam)}
            </AvatarFallback>
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
          <Button variant="outline" onClick={handleEditProfile}>
            <Edit className="h-4 w-4 mr-2" />
            Profiel bewerken
          </Button>
          <Button variant="outline" onClick={handleSendMessage}>
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
                <span className="text-sm text-gray-600">Leerlingnummer:</span>
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
              <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={handleUpdateTegoed}>
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
                    {leerling.lesGeschiedenis.length > 0 ? (
                      leerling.lesGeschiedenis.map((les: any) => (
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
                              {les.opmerkingen && (
                                <div className="text-sm text-gray-600 italic">"{les.opmerkingen}"</div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm">
                              Leskaart
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">Nog geen lessen gevolgd</div>
                    )}
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
                    {leerling.examens.length > 0 ? (
                      leerling.examens.map((examen: any) => (
                        <div
                          key={examen.id}
                          className={`p-4 border rounded-lg ${
                            examen.status === "Geslaagd"
                              ? "bg-green-50 border-green-200"
                              : examen.status === "Gepland"
                                ? "bg-blue-50 border-blue-200"
                                : "bg-red-50 border-red-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{examen.type}</div>
                              <div className="text-sm text-gray-600">
                                {examen.datum} - {examen.tijd}
                              </div>
                              <div className="text-sm text-gray-600">{examen.locatie}</div>
                            </div>
                            <Badge
                              className={
                                examen.status === "Geslaagd"
                                  ? "bg-green-100 text-green-800"
                                  : examen.status === "Gepland"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {examen.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">Nog geen examens gepland</div>
                    )}
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
                        <div className="text-2xl font-bold text-blue-600">
                          € {leerling.financieel.totaalBetaald.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">Huidig Tegoed</div>
                        <div className="text-2xl font-bold text-green-600">€ {leerling.tegoed.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Laatste betaling: {leerling.financieel.laatsteBetaling.datum} - €{" "}
                      {leerling.financieel.laatsteBetaling.bedrag.toFixed(2)}
                    </div>
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
                    {leerling.status === "Nieuw" && (
                      <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                        <div className="font-medium">Nieuwe leerling</div>
                        <div className="text-sm text-gray-600 mt-1">Eerste kennismaking en intake gepland</div>
                      </div>
                    )}
                    {leerling.status === "Examen" && (
                      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                        <div className="font-medium">Examen gepland</div>
                        <div className="text-sm text-gray-600 mt-1">Leerling staat op het punt om examen te doen</div>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleAddNote}>
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
                    {leerling.status === "Geslaagd" && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <div className="font-medium">Praktijkexamen geslaagd</div>
                          <div className="text-sm text-gray-600">
                            {leerling.examens.find((e: any) => e.status === "Geslaagd")?.datum || "Recent"}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Leerling geregistreerd</div>
                        <div className="text-sm text-gray-600">{leerling.leerlingSinds}</div>
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
