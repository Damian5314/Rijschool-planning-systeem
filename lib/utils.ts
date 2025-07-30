import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting helpers
export const formatDate = (date: string | Date, locale: string = 'nl-NL'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale)
}

export const formatDateTime = (date: string | Date, locale: string = 'nl-NL'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString(locale)
}

export const formatTime = (time: string): string => {
  return time.substring(0, 5) // HH:MM format
}

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'EUR', locale: string = 'nl-NL'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  // Simple Dutch phone number formatting
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('31')) {
    // International format
    return `+${cleaned.substring(0, 2)}-${cleaned.substring(2, 3)}-${cleaned.substring(3)}`
  }
  if (cleaned.startsWith('06')) {
    // Mobile format
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 4)}-${cleaned.substring(4, 6)}-${cleaned.substring(6)}`
  }
  return phone
}

// String helpers
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// Validation helpers
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+31|0031|0)6[0-9]{8}$|^(\+31|0031|0)[1-9][0-9]{8}$/
  const cleaned = phone.replace(/\D/g, '')
  return phoneRegex.test(cleaned)
}

export const isValidPostcode = (postcode: string): boolean => {
  const postcodeRegex = /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/
  return postcodeRegex.test(postcode)
}

export const isValidKenteken = (kenteken: string): boolean => {
  const kentekenRegex = /^[A-Z0-9]{6}$|^[0-9]{1,3}-[A-Z]{1,3}-[0-9]{1,3}$|^[A-Z]{1,3}-[0-9]{1,3}-[A-Z]{1,3}$/
  return kentekenRegex.test(kenteken.toUpperCase())
}

// Array helpers
export const sortByProperty = <T>(array: T[], property: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[property]
    const bVal = b[property]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export const groupBy = <T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item)
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

// Local storage helpers
export const getFromStorage = (key: string, defaultValue: any = null): any => {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

export const setToStorage = (key: string, value: any): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
  }
}

// URL helpers
export const buildUrl = (base: string, params: Record<string, any>): string => {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.append(key, String(value))
    }
  })
  return url.toString()
}

// File helpers
export const downloadFile = (content: string, filename: string, contentType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Status helpers
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Student statuses
    'Actief': 'bg-green-100 text-green-800',
    'Nieuw': 'bg-blue-100 text-blue-800',
    'Examen': 'bg-yellow-100 text-yellow-800',
    'Geslaagd': 'bg-purple-100 text-purple-800',
    'Gestopt': 'bg-red-100 text-red-800',
    'Gepauzeerd': 'bg-gray-100 text-gray-800',
    'Afgestudeerd': 'bg-purple-100 text-purple-800',
    
    // Instructor statuses
    'Verlof': 'bg-yellow-100 text-yellow-800',
    'Inactief': 'bg-red-100 text-red-800',
    
    // Vehicle statuses
    'Onderhoud': 'bg-yellow-100 text-yellow-800',
    'Buiten dienst': 'bg-red-100 text-red-800',
    'beschikbaar': 'bg-green-100 text-green-800',
    'defect': 'bg-red-100 text-red-800',
    
    // Lesson statuses
    'Gepland': 'bg-blue-100 text-blue-800',
    'Bevestigd': 'bg-green-100 text-green-800',
    'Voltooid': 'bg-gray-100 text-gray-800',
    'Geannuleerd': 'bg-red-100 text-red-800',
    
    // Invoice statuses
    'concept': 'bg-gray-100 text-gray-800',
    'verzonden': 'bg-blue-100 text-blue-800',
    'betaald': 'bg-green-100 text-green-800',
    'vervallen': 'bg-red-100 text-red-800',
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

// API helpers
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'Er is een onbekende fout opgetreden'
}

// Debounce helper
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}