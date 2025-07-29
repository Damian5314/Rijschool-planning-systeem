// API Configuration and Types
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  requestId?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Entity Types based on backend models
export interface User {
  id: number
  naam: string
  email: string
  rol: 'admin' | 'instructeur' | 'gebruiker'
  actief: boolean
  created_at: string
  updated_at: string
}

export interface Student {
  id: number
  naam: string
  email: string
  telefoon?: string
  adres?: string
  postcode?: string
  plaats?: string
  geboortedatum?: string
  rijbewijs_type: 'B' | 'A' | 'C'
  transmissie: 'Handgeschakeld' | 'Automaat'
  status: 'Actief' | 'Inactief' | 'Gepauzeerd' | 'Afgestudeerd'
  instructeur_id?: number
  instructeur_naam?: string
  tegoed: number
  openstaand_bedrag: number
  laatste_betaling?: string
  totaal_lessen?: number
  komende_lessen?: number
  created_at: string
  updated_at: string
}

export interface Instructeur {
  id: number
  naam: string
  email: string
  telefoon?: string
  rijbewijs_type: string[]
  status: 'Actief' | 'Inactief'
  user_id?: number
  totaal_studenten?: number
  actieve_studenten?: number
  totaal_lessen?: number
  komende_lessen?: number
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: number
  merk: string
  model: string
  bouwjaar: number
  kenteken: string
  transmissie: 'Handgeschakeld' | 'Automaat'
  brandstof: 'benzine' | 'diesel' | 'elektrisch' | 'hybride'
  kilometerstand: number
  laatste_onderhoud?: string
  volgende_onderhoud?: string
  apk_datum?: string
  status: 'beschikbaar' | 'onderhoud' | 'defect'
  instructeur_id?: number
  instructeur_naam?: string
  totaal_lessen?: number
  komende_lessen?: number
  onderhoud_nodig?: boolean
  apk_verloopt_binnenkort?: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: number
  datum: string
  tijd: string
  duur: number
  student_id: number
  student_naam?: string
  student_telefoon?: string
  instructeur_id: number
  instructeur_naam?: string
  vehicle_id?: number
  vehicle_merk?: string
  vehicle_model?: string
  vehicle_kenteken?: string
  type: 'Rijles' | 'Examen' | 'Intake' | 'Anders'
  status: 'Gepland' | 'Bevestigd' | 'Voltooid' | 'Geannuleerd'
  opmerkingen?: string
  prijs?: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  student_id: number
  bedrag: number
  type: 'betaling' | 'factuur' | 'korting'
  beschrijving?: string
  datum: string
  created_at: string
}

export interface Exam {
  id: number
  student_id: number
  datum: string
  type: string
  resultaat?: 'Geslaagd' | 'Gezakt' | 'Gepland'
  opmerkingen?: string
  created_at: string
}

// API Client Class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      defaultHeaders.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication methods
  async login(email: string, wachtwoord: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, wachtwoord }),
    })
    
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }
    
    return response
  }

  async register(naam: string, email: string, wachtwoord: string, rol?: string): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ naam, email, wachtwoord, rol }),
    })
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/auth/profile')
  }

  async changePassword(huidigWachtwoord: string, wachtwoord: string): Promise<ApiResponse> {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ huidigWachtwoord, wachtwoord }),
    })
  }

  // Student methods
  async getStudents(params?: {
    page?: number
    limit?: number
    status?: string
    instructeur_id?: number
  }): Promise<ApiResponse<Student[]>> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.status) query.set('status', params.status)
    if (params?.instructeur_id) query.set('instructeur_id', params.instructeur_id.toString())
    
    const endpoint = `/api/students${query.toString() ? `?${query.toString()}` : ''}`
    return this.request<Student[]>(endpoint)
  }

  async getStudent(id: number): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/api/students/${id}`)
  }

  async createStudent(student: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.request<Student>('/api/students', {
      method: 'POST',
      body: JSON.stringify(student),
    })
  }

  async updateStudent(id: number, student: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    })
  }

  async deleteStudent(id: number): Promise<ApiResponse> {
    return this.request(`/api/students/${id}`, {
      method: 'DELETE',
    })
  }

  async getStudentLessons(id: number): Promise<ApiResponse<Lesson[]>> {
    return this.request<Lesson[]>(`/api/students/${id}/lessen`)
  }

  async getStudentFinancial(id: number): Promise<ApiResponse<{ student: Partial<Student>; transacties: Transaction[] }>> {
    return this.request(`/api/students/${id}/financieel`)
  }

  async getStudentExams(id: number): Promise<ApiResponse<Exam[]>> {
    return this.request<Exam[]>(`/api/students/${id}/examens`)
  }

  async addTransaction(studentId: number, transaction: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/api/students/${studentId}/transactie`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    })
  }

  // Instructeur methods
  async getInstructeurs(): Promise<ApiResponse<Instructeur[]>> {
    return this.request<Instructeur[]>('/api/instructeurs')
  }

  async getInstructeur(id: number): Promise<ApiResponse<Instructeur>> {
    return this.request<Instructeur>(`/api/instructeurs/${id}`)
  }

  async createInstructeur(instructeur: Partial<Instructeur>): Promise<ApiResponse<Instructeur>> {
    return this.request<Instructeur>('/api/instructeurs', {
      method: 'POST',
      body: JSON.stringify(instructeur),
    })
  }

  async updateInstructeur(id: number, instructeur: Partial<Instructeur>): Promise<ApiResponse<Instructeur>> {
    return this.request<Instructeur>(`/api/instructeurs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(instructeur),
    })
  }

  async deleteInstructeur(id: number): Promise<ApiResponse> {
    return this.request(`/api/instructeurs/${id}`, {
      method: 'DELETE',
    })
  }

  async getInstructeurPlanning(id: number, params?: { startDatum?: string; eindDatum?: string }): Promise<ApiResponse<Lesson[]>> {
    const query = new URLSearchParams()
    if (params?.startDatum) query.set('startDatum', params.startDatum)
    if (params?.eindDatum) query.set('eindDatum', params.eindDatum)
    
    const endpoint = `/api/instructeurs/${id}/planning${query.toString() ? `?${query.toString()}` : ''}`
    return this.request<Lesson[]>(endpoint)
  }

  async getInstructeurStudents(id: number): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>(`/api/instructeurs/${id}/students`)
  }

  async getInstructeurVehicles(id: number): Promise<ApiResponse<Vehicle[]>> {
    return this.request<Vehicle[]>(`/api/instructeurs/${id}/vehicles`)
  }

  async getInstructeurStats(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/instructeurs/${id}/stats`)
  }

  // Vehicle methods
  async getVehicles(params?: {
    status?: string
    instructeur_id?: number
    transmissie?: string
    brandstof?: string
  }): Promise<ApiResponse<Vehicle[]>> {
    const query = new URLSearchParams()
    if (params?.status) query.set('status', params.status)
    if (params?.instructeur_id) query.set('instructeur_id', params.instructeur_id.toString())
    if (params?.transmissie) query.set('transmissie', params.transmissie)
    if (params?.brandstof) query.set('brandstof', params.brandstof)
    
    const endpoint = `/api/vehicles${query.toString() ? `?${query.toString()}` : ''}`
    return this.request<Vehicle[]>(endpoint)
  }

  async getVehicle(id: number): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/api/vehicles/${id}`)
  }

  async createVehicle(vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    })
  }

  async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    })
  }

  async deleteVehicle(id: number): Promise<ApiResponse> {
    return this.request(`/api/vehicles/${id}`, {
      method: 'DELETE',
    })
  }

  async getMaintenanceAlerts(): Promise<ApiResponse<Vehicle[]>> {
    return this.request<Vehicle[]>('/api/vehicles/maintenance/alerts')
  }

  async getAvailableVehicles(datum: string, tijd: string): Promise<ApiResponse<Vehicle[]>> {
    return this.request<Vehicle[]>(`/api/vehicles/available/now?datum=${datum}&tijd=${tijd}`)
  }

  async getVehiclePlanning(id: number, params?: { startDatum?: string; eindDatum?: string }): Promise<ApiResponse<Lesson[]>> {
    const query = new URLSearchParams()
    if (params?.startDatum) query.set('startDatum', params.startDatum)
    if (params?.eindDatum) query.set('eindDatum', params.eindDatum)
    
    const endpoint = `/api/vehicles/planning/${id}${query.toString() ? `?${query.toString()}` : ''}`
    return this.request<Lesson[]>(endpoint)
  }

  // Lesson methods
  async getLessons(params?: {
    page?: number
    limit?: number
    student_id?: number
    instructeur_id?: number
    vehicle_id?: number
    datum?: string
    status?: string
  }): Promise<ApiResponse<Lesson[]>> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.student_id) query.set('student_id', params.student_id.toString())
    if (params?.instructeur_id) query.set('instructeur_id', params.instructeur_id.toString())
    if (params?.vehicle_id) query.set('vehicle_id', params.vehicle_id.toString())
    if (params?.datum) query.set('datum', params.datum)
    if (params?.status) query.set('status', params.status)
    
    const endpoint = `/api/lessons${query.toString() ? `?${query.toString()}` : ''}`
    return this.request<Lesson[]>(endpoint)
  }

  async getLesson(id: number): Promise<ApiResponse<Lesson>> {
    return this.request<Lesson>(`/api/lessons/${id}`)
  }

  async createLesson(lesson: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    return this.request<Lesson>('/api/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    })
  }

  async updateLesson(id: number, lesson: Partial<Lesson>): Promise<ApiResponse<Lesson>> {
    return this.request<Lesson>(`/api/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lesson),
    })
  }

  async deleteLesson(id: number): Promise<ApiResponse> {
    return this.request(`/api/lessons/${id}`, {
      method: 'DELETE',
    })
  }

  async getTodayLessons(): Promise<ApiResponse<Lesson[]>> {
    return this.request<Lesson[]>('/api/lessons/planning/today')
  }

  async getWeekLessons(): Promise<ApiResponse<Lesson[]>> {
    return this.request<Lesson[]>('/api/lessons/planning/week')
  }

  async getMonthLessons(): Promise<ApiResponse<Lesson[]>> {
    return this.request<Lesson[]>('/api/lessons/planning/month')
  }

  async checkConflicts(params: {
    datum: string
    tijd: string
    instructeur_id: number
    vehicle_id?: number
    exclude_lesson_id?: number
  }): Promise<ApiResponse<{ conflicts: boolean; data: Lesson[] }>> {
    const query = new URLSearchParams()
    query.set('datum', params.datum)
    query.set('tijd', params.tijd)
    query.set('instructeur_id', params.instructeur_id.toString())
    if (params.vehicle_id) query.set('vehicle_id', params.vehicle_id.toString())
    if (params.exclude_lesson_id) query.set('exclude_lesson_id', params.exclude_lesson_id.toString())
    
    return this.request(`/api/lessons/conflicts/check?${query.toString()}`)
  }

  async updateLessonStatus(id: number, status: string): Promise<ApiResponse<Lesson>> {
    return this.request<Lesson>(`/api/lessons/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }
}

// Export singleton instance
export const api = new ApiClient()

// Export the class for custom instances if needed
export { ApiClient }