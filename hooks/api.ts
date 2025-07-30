// API service voor communicatie met de backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('authToken')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const text = await response.text()
    let data: ApiResponse<T>
    
    try {
      data = JSON.parse(text)
    } catch (error) {
      data = {
        success: false,
        error: 'Invalid JSON response'
      }
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`)
    }

    return data
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      return await this.handleResponse<T>(response)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error')
    }
  }

  // Auth endpoints
  async login(email: string, wachtwoord: string) {
    const response = await this.request<{
      token: string
      user: {
        id: number
        naam: string
        email: string
        rol: string
      }
    }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, wachtwoord }),
    })

    if (response.success && response.data) {
      // Store token in localStorage
      localStorage.setItem('authToken', response.data.token)
      localStorage.setItem('userRole', response.data.user.rol)
      localStorage.setItem('userEmail', response.data.user.email)
      localStorage.setItem('isLoggedIn', 'true')
    }

    return response
  }

  async register(data: {
    naam: string
    email: string
    wachtwoord: string
    rol?: string
  }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile() {
    return this.request('/auth/profile')
  }

  async changePassword(huidigWachtwoord: string, nieuwWachtwoord: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ huidigWachtwoord, nieuwWachtwoord }),
    })
  }

  // Students endpoints
  async getStudents(params?: {
    page?: number
    limit?: number
    status?: string
    instructeur_id?: number
  }) {
    const queryString = params ? 
      '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : 
      ''
    
    return this.request(`/students${queryString}`)
  }

  async getStudent(id: number) {
    return this.request(`/students/${id}`)
  }

  async createStudent(data: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateStudent(id: number, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteStudent(id: number) {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    })
  }

  async addStudentTransaction(id: number, data: {
    bedrag: number
    type: 'betaling' | 'factuur' | 'korting'
    beschrijving?: string
  }) {
    return this.request(`/students/${id}/transactie`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Instructeurs endpoints
  async getInstructeurs() {
    return this.request('/instructeurs')
  }

  async getInstructeur(id: number) {
    return this.request(`/instructeurs/${id}`)
  }

  async createInstructeur(data: any) {
    return this.request('/instructeurs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateInstructeur(id: number, data: any) {
    return this.request(`/instructeurs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteInstructeur(id: number) {
    return this.request(`/instructeurs/${id}`, {
      method: 'DELETE',
    })
  }

  async getInstructeurPlanning(id: number, startDatum?: string, eindDatum?: string) {
    const params = new URLSearchParams()
    if (startDatum) params.append('startDatum', startDatum)
    if (eindDatum) params.append('eindDatum', eindDatum)
    
    return this.request(`/instructeurs/${id}/planning?${params.toString()}`)
  }

  // Lessons endpoints
  async getLessons(params?: {
    page?: number
    limit?: number
    startDatum?: string
    eindDatum?: string
    instructeur_id?: number
    student_id?: number
    status?: string
    type?: string
  }) {
    const queryString = params ? 
      '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : 
      ''
    
    return this.request(`/lessons${queryString}`)
  }

  async getLesson(id: number) {
    return this.request(`/lessons/${id}`)
  }

  async createLesson(data: any) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateLesson(id: number, data: any) {
    return this.request(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteLesson(id: number) {
    return this.request(`/lessons/${id}`, {
      method: 'DELETE',
    })
  }

  async getTodayLessons() {
    return this.request('/lessons/planning/today')
  }

  async getWeekLessons() {
    return this.request('/lessons/planning/week')
  }

  async checkConflicts(params: {
    datum: string
    tijd: string
    instructeur_id: number
    vehicle_id?: number
    exclude_lesson_id?: number
  }) {
    const queryString = '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    return this.request(`/lessons/conflicts/check${queryString}`)
  }

  // Vehicles endpoints
  async getVehicles(params?: {
    status?: string
    instructeur_id?: number
    transmissie?: string
    brandstof?: string
  }) {
    const queryString = params ? 
      '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString() : 
      ''
    
    return this.request(`/vehicles${queryString}`)
  }

  async getVehicle(id: number) {
    return this.request(`/vehicles/${id}`)
  }

  async createVehicle(data: any) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateVehicle(id: number, data: any) {
    return this.request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteVehicle(id: number) {
    return this.request(`/vehicles/${id}`, {
      method: 'DELETE',
    })
  }

  async getMaintenanceAlerts() {
    return this.request('/vehicles/maintenance/alerts')
  }

  async getAvailableVehicles(datum: string, tijd: string) {
    return this.request(`/vehicles/available/now?datum=${datum}&tijd=${tijd}`)
  }

  async updateVehicleMaintenance(id: number, data: {
    laatste_onderhoud?: string
    volgende_onderhoud?: string
    apk_datum?: string
    kilometerstand?: number
  }) {
    return this.request(`/vehicles/${id}/maintenance`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('isLoggedIn')
  }
}

export const apiService = new ApiService()
export default apiService