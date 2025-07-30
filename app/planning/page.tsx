"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus, Search, Filter, Calendar as CalendarIcon, 
  ChevronLeft, ChevronRight, Clock, User, Car, 
  Edit, Trash2, MapPin 
} from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek } from "date-fns"
import { nl } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Afspraak {
  id: string
  type: 'les' | 'examen' | 'intake'
  leerling: string
  instructeur: string
  datum: string
  tijd: string
  duur: number
  transmissie: 'Automaat' | 'Schakel'
  voertuig?: string
  locatie?: string
  opmerkingen?: string
  status: 'gepland' | 'bevestigd' | 'voltooid' | 'geannuleerd'
}

interface NewAfspraak {
  type: string
  leerling: string
  instructeur: string
  datum: Date | undefined
  startTijd: string
  eindTijd: string
  voertuig: string
  opmerkingen: string
}

export default function Planning() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'dag' | 'week'>('week')
  const [selectedInstructeur, setSelectedInstructeur] = useState('alle')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [newAfspraak, setNewAfspraak] = useState<NewAfspraak>({
    type: '',
    leerling: '',
    instructeur: '',
    datum: undefined,
    startTijd: '09:00',
    eindTijd: '10:00',
    voertuig: '',
    opmerkingen: ''
  })

  // Mock data - replace with API calls
  const [afspraken, setAfspraken] = useState<Afspraak[]>([
    {
      id: '1',
      type: 'les',
      leerling: 'Emma van der Berg',
      instructeur: 'Jan Bakker',
      datum: format(new Date(), 'yyyy-MM-dd'),
      tijd: '09:00',
      duur: 60,
      transmissie: 'Automaat',
      voertuig: 'VW Polo',
      status: 'gepland'
    },
    {
      id: '2',
      type: 'examen',
      leerling: 'Tom Jansen',
      instructeur: 'Lisa de Vries',
      datum: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      tijd: '14:00',
      duur: 90,
      transmissie: 'Schakel',
      voertuig: 'Toyota Yaris',
      locatie: 'CBR Rotterdam',
      status: 'bevestigd'
    }
  ])

  const instructeurs = ['Jan Bakker', 'Lisa de Vries', 'Mark Peters', 'Sarah Jansen']
  const leerlingen = ['Emma van der Berg', 'Tom Jansen', 'Sophie Willems', 'David Smit']
  const voertuigen = ['VW Polo (Automaat)', 'Toyota Yaris (Schakel)', 'Opel Corsa (Automaat)']

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i)
    return {
      date,
      label: format(date, 'EEE d MMM', { locale: nl }),
      shortLabel: format(date, 'EEE', { locale: nl }),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    }
  })

  const filteredAfspraken = afspraken.filter(afspraak => {
    const matchesInstructeur = selectedInstructeur === 'alle' || afspraak.instructeur === selectedInstructeur
    const matchesSearch = afspraak.leerling.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         afspraak.instructeur.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesInstructeur && matchesSearch
  })

  const getAfsprakenForDateAndTime = (date: Date, tijd: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return filteredAfspraken.filter(a => a.datum === dateStr && a.tijd === tijd)
  }

  const getAfsprakenForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return filteredAfspraken.filter(a => a.datum === dateStr).sort((a, b) => a.tijd.localeCompare(b.tijd))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'gepland': return 'bg-blue-100 text-blue-800'
      case 'bevestigd': return 'bg-green-100 text-green-800'
      case 'voltooid': return 'bg-gray-100 text-gray-800'
      case 'geannuleerd': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'les': return 'bg-blue-500'
      case 'examen': return 'bg-red-500'
      case 'intake': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const handleCreateAfspraak = async () => {
    if (!newAfspraak.leerling || !newAfspraak.instructeur || !newAfspraak.datum) {
      toast.error('Vul alle verplichte velden in')
      return
    }

    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const afspraak: Afspraak = {
        id: Date.now().toString(),
        type: newAfspraak.type as 'les' | 'examen' | 'intake',
        leerling: newAfspraak.leerling,
        instructeur: newAfspraak.instructeur,
        datum: format(newAfspraak.datum, 'yyyy-MM-dd'),
        tijd: newAfspraak.startTijd,
        duur: 60, // Calculate from start/end time
        transmissie: 'Automaat', // Should come from student data
        voertuig: newAfspraak.voertuig,
        opmerkingen: newAfspraak.opmerkingen,
        status: 'gepland'
      }

      setAfspraken(prev => [...prev, afspraak])
      setIsDialogOpen(false)
      setNewAfspraak({
        type: '',
        leerling: '',
        instructeur: '',
        datum: undefined,
        startTijd: '09:00',
        eindTijd: '10:00',
        voertuig: '',
        opmerkingen: ''
      })
      
      toast.success('Afspraak succesvol aangemaakt')
    } catch (error) {
      toast.error('Fout bij aanmaken afspraak')
    } finally {
      setLoading(false)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7
    setCurrentDate(prev => addDays(prev, days))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Planning</h1>
            <p className="text-gray-600">Beheer lessen, examens en afspraken</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Afspraak
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nieuwe Afspraak</DialogTitle>
                <DialogDescription>Plan een nieuwe les, examen of intake</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={newAfspraak.type} onValueChange={(value) => setNewAfspraak(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="les">Rijles</SelectItem>
                      <SelectItem value="examen">Praktijkexamen</SelectItem>
                      <SelectItem value="intake">Intake gesprek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="leerling">Leerling *</Label>
                  <Select value={newAfspraak.leerling} onValueChange={(value) => setNewAfspraak(prev => ({ ...prev, leerling: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer leerling" />
                    </SelectTrigger>
                    <SelectContent>
                      {leerlingen.map(leerling => (
                        <SelectItem key={leerling} value={leerling}>{leerling}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="instructeur">Instructeur *</Label>
                  <Select value={newAfspraak.instructeur} onValueChange={(value) => setNewAfspraak(prev => ({ ...prev, instructeur: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer instructeur" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructeurs.map(instructeur => (
                        <SelectItem key={instructeur} value={instructeur}>{instructeur}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Datum *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newAfspraak.datum && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAfspraak.datum ? format(newAfspraak.datum, "dd MMM yyyy", { locale: nl }) : "Selecteer datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={newAfspraak.datum}
                        onSelect={(date) => setNewAfspraak(prev => ({ ...prev, datum: date }))}
                        initialFocus
                        locale={nl}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="rounded-md border"
                        classNames={{
                          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption: "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium",
                          nav: "space-x-1 flex items-center",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-0",
                          nav_button_previous: "absolute left-1",
                          nav_button_next: "absolute right-1",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex",
                          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                          row: "flex w-full mt-2",
                          cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                          day_today: "bg-accent text-accent-foreground",
                          day_outside: "text-muted-foreground opacity-50",
                          day_disabled: "text-muted-foreground opacity-50",
                          day_hidden: "invisible"
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTijd">Start tijd</Label>
                    <Select value={newAfspraak.startTijd} onValueChange={(value) => setNewAfspraak(prev => ({ ...prev, startTijd: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(tijd => (
                          <SelectItem key={tijd} value={tijd}>{tijd}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eindTijd">Eind tijd</Label>
                    <Select value={newAfspraak.eindTijd} onValueChange={(value) => setNewAfspraak(prev => ({ ...prev, eindTijd: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(tijd => (
                          <SelectItem key={tijd} value={tijd}>{tijd}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="voertuig">Voertuig</Label>
                  <Select value={newAfspraak.voertuig} onValueChange={(value) => setNewAfspraak(prev => ({ ...prev, voertuig: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer voertuig" />
                    </SelectTrigger>
                    <SelectContent>
                      {voertuigen.map(voertuig => (
                        <SelectItem key={voertuig} value={voertuig}>{voertuig}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="opmerkingen">Opmerkingen</Label>
                  <Textarea
                    placeholder="Extra opmerkingen..."
                    value={newAfspraak.opmerkingen}
                    onChange={(e) => setNewAfspraak(prev => ({ ...prev, opmerkingen: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={handleCreateAfspraak} disabled={loading}>
                  {loading ? 'Aanmaken...' : 'Afspraak aanmaken'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters en Controls */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Zoek leerling of instructeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Select value={selectedInstructeur} onValueChange={setSelectedInstructeur}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alle">Alle instructeurs</SelectItem>
                    {instructeurs.map(instructeur => (
                      <SelectItem key={instructeur} value={instructeur}>{instructeur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-1">
                  <Button
                    variant={viewMode === 'dag' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('dag')}
                  >
                    Dag
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Vandaag
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-40 text-center">
                  {format(currentDate, 'MMMM yyyy', { locale: nl })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planning Grid */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle>
              {viewMode === 'week' ? 'Weekplanning' : 'Dagplanning'}
            </CardTitle>
            <CardDescription>
              {viewMode === 'week' 
                ? `Week van ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: nl })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: nl })}`
                : format(currentDate, 'EEEE d MMMM yyyy', { locale: nl })
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            {viewMode === 'week' ? (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header */}
                  <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
                    <div className="bg-gray-50 p-2 font-medium text-center text-sm">Tijd</div>
                    {weekDays.map(day => (
                      <div key={day.label} className={cn(
                        "bg-gray-50 p-2 font-medium text-center text-sm",
                        day.isToday && "bg-blue-50 text-blue-600"
                      )}>
                        <div>{day.shortLabel}</div>
                        <div className="text-xs text-gray-500">{format(day.date, 'd MMM')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  {timeSlots.map(tijd => (
                    <div key={tijd} className="grid grid-cols-8 gap-px bg-gray-200">
                      <div className="bg-white p-2 font-medium text-gray-600 text-center border-r text-sm">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {tijd}
                      </div>
                      {weekDays.map(day => {
                        const afspraken = getAfsprakenForDateAndTime(day.date, tijd)
                        return (
                          <div key={`${tijd}-${day.label}`} className="bg-white p-1 min-h-12 border-r border-b">
                            {afspraken.map(afspraak => (
                              <div key={afspraak.id} className="mb-1 last:mb-0">
                                <div className={cn(
                                  "text-xs p-1 rounded cursor-pointer hover:shadow-md transition-shadow",
                                  getTypeColor(afspraak.type), "text-white"
                                )}>
                                  <div className="font-medium truncate text-xs">{afspraak.leerling}</div>
                                  <div className="opacity-90 truncate text-xs">{afspraak.instructeur}</div>
                                  {afspraak.voertuig && (
                                    <div className="opacity-75 truncate text-xs">{afspraak.voertuig}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Day view
              <div className="space-y-4">
                {timeSlots.map(tijd => {
                  const afspraken = getAfsprakenForDateAndTime(currentDate, tijd)
                  return (
                    <div key={tijd} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="w-16 text-sm font-medium text-gray-600">
                        {tijd}
                      </div>
                      <div className="flex-1">
                        {afspraken.length > 0 ? (
                          <div className="space-y-2">
                            {afspraken.map(afspraak => (
                              <div key={afspraak.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={cn("w-3 h-3 rounded-full", getTypeColor(afspraak.type))} />
                                <div className="flex-1">
                                  <div className="font-medium">{afspraak.leerling}</div>
                                  <div className="text-sm text-gray-600">{afspraak.instructeur}</div>
                                  {afspraak.voertuig && (
                                    <div className="text-xs text-gray-500">{afspraak.voertuig}</div>
                                  )}
                                </div>
                                <Badge className={getStatusColor(afspraak.status)}>
                                  {afspraak.status}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">Geen afspraken</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}