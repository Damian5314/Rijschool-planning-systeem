"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { type RijschoolSettings, rijschoolSettings as defaultSettings } from "@/lib/data"

export default function InstellingenPage() {
  const [settings, setSettings] = useState<RijschoolSettings>(defaultSettings)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    if (name.startsWith("openingstijden.")) {
      const [_, day, field] = name.split(".")
      setSettings((prevSettings) => ({
        ...prevSettings,
        openingstijden: {
          ...prevSettings.openingstijden,
          [day]: {
            ...prevSettings.openingstijden[day as keyof typeof prevSettings.openingstijden],
            [field]: type === "checkbox" ? checked : value,
          },
        },
      }))
    } else {
      setSettings((prevSettings) => ({
        ...prevSettings,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, you would send this data to your backend API
    console.log("Instellingen opgeslagen:", settings)
    toast({
      title: "Instellingen Opgeslagen",
      description: "Uw rijschoolinstellingen zijn succesvol bijgewerkt.",
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Instellingen</h1>
      </div>
      <form onSubmit={handleSave} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Algemene Informatie</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="rijschoolNaam">Rijschool Naam</Label>
              <Input
                id="rijschoolNaam"
                name="rijschoolNaam"
                value={settings.rijschoolNaam}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="adres">Adres</Label>
              <Input id="adres" name="adres" value={settings.adres} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" name="postcode" value={settings.postcode} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="plaats">Plaats</Label>
              <Input id="plaats" name="plaats" value={settings.plaats} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="telefoon">Telefoon</Label>
              <Input id="telefoon" name="telefoon" value={settings.telefoon} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" value={settings.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={settings.website} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="kvkNummer">KVK Nummer</Label>
              <Input id="kvkNummer" name="kvkNummer" value={settings.kvkNummer} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="btwNummer">BTW Nummer</Label>
              <Input id="btwNummer" name="btwNummer" value={settings.btwNummer || ""} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" name="iban" value={settings.iban || ""} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Openingstijden</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {Object.entries(settings.openingstijden).map(([day, times]) => (
              <div key={day} className="grid grid-cols-4 items-center gap-4">
                <Label className="capitalize">{day}</Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`gesloten-${day}`}
                    name={`openingstijden.${day}.gesloten`}
                    checked={times.gesloten}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: {
                          name: `openingstijden.${day}.gesloten`,
                          value: checked,
                          type: "checkbox",
                          checked: checked as boolean,
                        },
                      } as React.ChangeEvent<HTMLInputElement>)
                    }
                  />
                  <Label htmlFor={`gesloten-${day}`}>Gesloten</Label>
                </div>
                <Input
                  type="time"
                  name={`openingstijden.${day}.open`}
                  value={times.open}
                  onChange={handleChange}
                  disabled={times.gesloten}
                />
                <Input
                  type="time"
                  name={`openingstijden.${day}.dicht`}
                  value={times.dicht}
                  onChange={handleChange}
                  disabled={times.gesloten}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Les- en Exameninstellingen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="lesDuur">Standaard Lesduur (minuten)</Label>
              <Input
                id="lesDuur"
                name="lesDuur"
                type="number"
                value={settings.lesDuur}
                onChange={handleChange}
                min="15"
                step="15"
                required
              />
            </div>
            <div>
              <Label htmlFor="examenDuur">Standaard Examenduur (minuten)</Label>
              <Input
                id="examenDuur"
                name="examenDuur"
                type="number"
                value={settings.examenDuur}
                onChange={handleChange}
                min="30"
                step="15"
                required
              />
            </div>
            <div>
              <Label htmlFor="pauzeMinuten">Pauze tussen lessen (minuten)</Label>
              <Input
                id="pauzeMinuten"
                name="pauzeMinuten"
                type="number"
                value={settings.pauzeMinuten}
                onChange={handleChange}
                min="0"
                step="5"
                required
              />
            </div>
            <div>
              <Label htmlFor="prijsAutomaat">Prijs per les Automaat (€)</Label>
              <Input
                id="prijsAutomaat"
                name="prijsAutomaat"
                type="number"
                value={settings.prijsAutomaat}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="prijsSchakel">Prijs per les Schakel (€)</Label>
              <Input
                id="prijsSchakel"
                name="prijsSchakel"
                type="number"
                value={settings.prijsSchakel}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="prijsExamen">Prijs Examen (€)</Label>
              <Input
                id="prijsExamen"
                name="prijsExamen"
                type="number"
                value={settings.prijsExamen}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaties</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotificaties"
                name="emailNotificaties"
                checked={settings.emailNotificaties}
                onCheckedChange={(checked) =>
                  handleChange({
                    target: {
                      name: "emailNotificaties",
                      value: checked,
                      type: "checkbox",
                      checked: checked as boolean,
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
              <Label htmlFor="emailNotificaties">E-mail Notificaties inschakelen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsNotificaties"
                name="smsNotificaties"
                checked={settings.smsNotificaties}
                onCheckedChange={(checked) =>
                  handleChange({
                    target: {
                      name: "smsNotificaties",
                      value: checked,
                      type: "checkbox",
                      checked: checked as boolean,
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
              <Label htmlFor="smsNotificaties">SMS Notificaties inschakelen</Label>
            </div>
            <div>
              <Label htmlFor="herinneringVoorExamen">Herinnering voor examen (uur van tevoren)</Label>
              <Input
                id="herinneringVoorExamen"
                name="herinneringVoorExamen"
                type="number"
                value={settings.herinneringVoorExamen}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="herinneringVoorLes">Herinnering voor les (uur van tevoren)</Label>
              <Input
                id="herinneringVoorLes"
                name="herinneringVoorLes"
                type="number"
                value={settings.herinneringVoorLes}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Backup</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="automatischeBackup"
                name="automatischeBackup"
                checked={settings.automatischeBackup}
                onCheckedChange={(checked) =>
                  handleChange({
                    target: {
                      name: "automatischeBackup",
                      value: checked,
                      type: "checkbox",
                      checked: checked as boolean,
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
              <Label htmlFor="automatischeBackup">Automatische Backup inschakelen</Label>
            </div>
            <div>
              <Label htmlFor="backupTijd">Backup Tijd</Label>
              <Input
                id="backupTijd"
                name="backupTijd"
                type="time"
                value={settings.backupTijd}
                onChange={handleChange}
                disabled={!settings.automatischeBackup}
                required
              />
            </div>
            <div>
              <Label htmlFor="dataRetentie">Data Retentie (dagen)</Label>
              <Input
                id="dataRetentie"
                name="dataRetentie"
                type="number"
                value={settings.dataRetentie}
                onChange={handleChange}
                min="30"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto">
          Instellingen Opslaan
        </Button>
      </form>
    </div>
  )
}
