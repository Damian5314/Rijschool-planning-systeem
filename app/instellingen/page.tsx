"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Building, Clock, Bell, Database, Save, Download, Upload } from "lucide-react"
import { rijschoolSettings } from "@/lib/data"
import { toast } from "@/hooks/use-toast"

export default function Instellingen() {
  const [settings, setSettings] = useState(rijschoolSettings)

  const handleSave = () => {
    toast({
      title: "Instellingen opgeslagen",
      description: "Alle instellingen zijn succesvol opgeslagen.",
    })
    console.log("Instellingen opgeslagen:", settings)
  }

  const handleExport = () => {
    toast({
      title: "Export gestart",
      description: "Instellingen worden geëxporteerd...",
    })
  }

  const handleImportBackup = () => {
    toast({
      title: "Import functie",
      description: "Backup import functionaliteit wordt binnenkort toegevoegd.",
    })
  }

  const handleDownloadBackup = () => {
    toast({
      title: "Download gestart",
      description: "Backup wordt gedownload...",
    })
  }

  const dagen = [
    { key: "maandag", label: "Maandag" },
    { key: "dinsdag", label: "Dinsdag" },
    { key: "woensdag", label: "Woensdag" },
    { key: "donderdag", label: "Donderdag" },
    { key: "vrijdag", label: "Vrijdag" },
    { key: "zaterdag", label: "Zaterdag" },
    { key: "zondag", label: "Zondag" },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Instellingen</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporteren
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Opslaan
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Rijschool Informatie */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <CardTitle>Rijschool Informatie</CardTitle>
            </div>
            <CardDescription>Algemene informatie over {settings.rijschoolNaam}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rijschoolNaam">Rijschool Naam</Label>
                <Input
                  id="rijschoolNaam"
                  value={settings.rijschoolNaam}
                  onChange={(e) => setSettings({ ...settings, rijschoolNaam: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kvkNummer">KvK Nummer</Label>
                <Input
                  id="kvkNummer"
                  value={settings.kvkNummer}
                  onChange={(e) => setSettings({ ...settings, kvkNummer: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adres">Adres</Label>
              <Input
                id="adres"
                value={settings.adres}
                onChange={(e) => setSettings({ ...settings, adres: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={settings.postcode}
                  onChange={(e) => setSettings({ ...settings, postcode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plaats">Plaats</Label>
                <Input
                  id="plaats"
                  value={settings.plaats}
                  onChange={(e) => setSettings({ ...settings, plaats: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefoon">Telefoon</Label>
                <Input
                  id="telefoon"
                  value={settings.telefoon}
                  onChange={(e) => setSettings({ ...settings, telefoon: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Planning Instellingen */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Planning Instellingen</CardTitle>
            </div>
            <CardDescription>Configureer openingstijden en lesduur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lesDuur">Les Duur (minuten)</Label>
                <Input
                  id="lesDuur"
                  type="number"
                  value={settings.lesDuur}
                  onChange={(e) => setSettings({ ...settings, lesDuur: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examenDuur">Examen Duur (minuten)</Label>
                <Input
                  id="examenDuur"
                  type="number"
                  value={settings.examenDuur}
                  onChange={(e) => setSettings({ ...settings, examenDuur: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pauzeMinuten">Pauze tussen lessen (minuten)</Label>
                <Input
                  id="pauzeMinuten"
                  type="number"
                  value={settings.pauzeMinuten}
                  onChange={(e) => setSettings({ ...settings, pauzeMinuten: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Openingstijden</h4>
              {dagen.map((dag) => (
                <div key={dag.key} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium">{dag.label}</div>
                  <Switch
                    checked={!settings.openingstijden[dag.key as keyof typeof settings.openingstijden].gesloten}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        openingstijden: {
                          ...settings.openingstijden,
                          [dag.key]: {
                            ...settings.openingstijden[dag.key as keyof typeof settings.openingstijden],
                            gesloten: !checked,
                          },
                        },
                      })
                    }}
                  />
                  {!settings.openingstijden[dag.key as keyof typeof settings.openingstijden].gesloten && (
                    <>
                      <Input
                        type="time"
                        value={settings.openingstijden[dag.key as keyof typeof settings.openingstijden].open}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            openingstijden: {
                              ...settings.openingstijden,
                              [dag.key]: {
                                ...settings.openingstijden[dag.key as keyof typeof settings.openingstijden],
                                open: e.target.value,
                              },
                            },
                          })
                        }}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">tot</span>
                      <Input
                        type="time"
                        value={settings.openingstijden[dag.key as keyof typeof settings.openingstijden].dicht}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            openingstijden: {
                              ...settings.openingstijden,
                              [dag.key]: {
                                ...settings.openingstijden[dag.key as keyof typeof settings.openingstijden],
                                dicht: e.target.value,
                              },
                            },
                          })
                        }}
                        className="w-24"
                      />
                    </>
                  )}
                  {settings.openingstijden[dag.key as keyof typeof settings.openingstijden].gesloten && (
                    <Badge variant="secondary">Gesloten</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prijzen */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Badge className="h-5 w-5" />
              <CardTitle>Prijzen</CardTitle>
            </div>
            <CardDescription>Stel de prijzen in voor lessen en examens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prijsAutomaat">Prijs Automaat Les (€)</Label>
                <Input
                  id="prijsAutomaat"
                  type="number"
                  value={settings.prijsAutomaat}
                  onChange={(e) => setSettings({ ...settings, prijsAutomaat: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prijsSchakel">Prijs Schakel Les (€)</Label>
                <Input
                  id="prijsSchakel"
                  type="number"
                  value={settings.prijsSchakel}
                  onChange={(e) => setSettings({ ...settings, prijsSchakel: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prijsExamen">Prijs Examen (€)</Label>
                <Input
                  id="prijsExamen"
                  type="number"
                  value={settings.prijsExamen}
                  onChange={(e) => setSettings({ ...settings, prijsExamen: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaties */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificatie Instellingen</CardTitle>
            </div>
            <CardDescription>Configureer automatische herinneringen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notificaties</Label>
                <p className="text-sm text-muted-foreground">Verstuur email herinneringen naar leerlingen</p>
              </div>
              <Switch
                checked={settings.emailNotificaties}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotificaties: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notificaties</Label>
                <p className="text-sm text-muted-foreground">Verstuur SMS herinneringen naar leerlingen</p>
              </div>
              <Switch
                checked={settings.smsNotificaties}
                onCheckedChange={(checked) => setSettings({ ...settings, smsNotificaties: checked })}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="herinneringVoorExamen">Herinnering voor examen (uren)</Label>
                <Select
                  value={settings.herinneringVoorExamen.toString()}
                  onValueChange={(value) => setSettings({ ...settings, herinneringVoorExamen: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 uur</SelectItem>
                    <SelectItem value="4">4 uur</SelectItem>
                    <SelectItem value="12">12 uur</SelectItem>
                    <SelectItem value="24">24 uur</SelectItem>
                    <SelectItem value="48">48 uur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="herinneringVoorLes">Herinnering voor les (uren)</Label>
                <Select
                  value={settings.herinneringVoorLes.toString()}
                  onValueChange={(value) => setSettings({ ...settings, herinneringVoorLes: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 uur</SelectItem>
                    <SelectItem value="2">2 uur</SelectItem>
                    <SelectItem value="4">4 uur</SelectItem>
                    <SelectItem value="12">12 uur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Systeem Instellingen  */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Systeem Instellingen</CardTitle>
            </div>
            <CardDescription>Backup en data beheer instellingen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automatische Backup</Label>
                <p className="text-sm text-muted-foreground">Maak dagelijks automatisch een backup</p>
              </div>
              <Switch
                checked={settings.automatischeBackup}
                onCheckedChange={(checked) => setSettings({ ...settings, automatischeBackup: checked })}
              />
            </div>

            {settings.automatischeBackup && (
              <div className="space-y-2">
                <Label htmlFor="backupTijd">Backup Tijd</Label>
                <Input
                  id="backupTijd"
                  type="time"
                  value={settings.backupTijd}
                  onChange={(e) => setSettings({ ...settings, backupTijd: e.target.value })}
                  className="w-32"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dataRetentie">Data Retentie (dagen)</Label>
              <Input
                id="dataRetentie"
                type="number"
                value={settings.dataRetentie}
                onChange={(e) => setSettings({ ...settings, dataRetentie: Number.parseInt(e.target.value) })}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                Hoe lang data bewaard wordt voordat het automatisch wordt verwijderd
              </p>
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleImportBackup}>
                <Upload className="mr-2 h-4 w-4" />
                Backup Importeren
              </Button>
              <Button variant="outline" onClick={handleDownloadBackup}>
                <Download className="mr-2 h-4 w-4" />
                Backup Downloaden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
//test