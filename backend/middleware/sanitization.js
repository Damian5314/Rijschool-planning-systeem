const DOMPurify = require('isomorphic-dompurify')
const validator = require('validator')

// Data sanitization middleware
const sanitizeInput = (req, res, next) => {
  
  // Helper function to recursively sanitize objects
  const sanitizeValue = (value, key = '') => {
    if (value === null || value === undefined) {
      return value
    }
    
    if (typeof value === 'string') {
      // Email fields - normalize email
      if (key.toLowerCase().includes('email')) {
        return validator.normalizeEmail(value.trim()) || value.trim()
      }
      
      // Phone fields - remove non-digits except + and spaces
      if (key.toLowerCase().includes('telefoon') || key.toLowerCase().includes('phone')) {
        return value.replace(/[^\d\s\+\-\(\)]/g, '').trim()
      }
      
      // Postcode - uppercase and remove spaces
      if (key.toLowerCase().includes('postcode')) {
        return value.toUpperCase().replace(/\s/g, '').trim()
      }
      
      // Kenteken - uppercase and remove spaces/dashes
      if (key.toLowerCase().includes('kenteken')) {
        return value.toUpperCase().replace(/[-\s]/g, '').trim()
      }
      
      // General string sanitization
      let sanitized = value.trim()
      
      // Remove potential XSS
      sanitized = DOMPurify.sanitize(sanitized, { 
        ALLOWED_TAGS: [], 
        ALLOWED_ATTR: [] 
      })
      
      // Escape HTML entities
      sanitized = validator.escape(sanitized)
      
      // Remove control characters except newlines and tabs
      sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      
      return sanitized
    }
    
    if (typeof value === 'number') {
      // Ensure numbers are finite
      return isFinite(value) ? value : 0
    }
    
    if (typeof value === 'boolean') {
      return value
    }
    
    if (Array.isArray(value)) {
      return value.map((item, index) => sanitizeValue(item, `${key}[${index}]`))
    }
    
    if (typeof value === 'object') {
      const sanitized = {}
      for (const [objKey, objValue] of Object.entries(value)) {
        sanitized[objKey] = sanitizeValue(objValue, objKey)
      }
      return sanitized
    }
    
    return value
  }
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body)
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query)
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params)
  }
  
  next()
}

// Specific sanitizers for different data types
const sanitizers = {
  
  // Name sanitizer - allows letters, spaces, hyphens, apostrophes, dots
  name: (value) => {
    if (typeof value !== 'string') return value
    return value
      .trim()
      .replace(/[^a-zA-ZÀ-ž\s\-'\.]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 255)
  },
  
  // Email sanitizer
  email: (value) => {
    if (typeof value !== 'string') return value
    return validator.normalizeEmail(value.trim()) || value.trim().toLowerCase()
  },
  
  // Phone sanitizer
  phone: (value) => {
    if (typeof value !== 'string') return value
    // Keep only digits, spaces, +, -, (, )
    return value.replace(/[^\d\s\+\-\(\)]/g, '').trim()
  },
  
  // Address sanitizer
  address: (value) => {
    if (typeof value !== 'string') return value
    return value
      .trim()
      .replace(/[<>\"']/g, '') // Remove dangerous chars
      .substring(0, 500)
  },
  
  // Postcode sanitizer (Nederlandse postcode: 1234AB)
  postcode: (value) => {
    if (typeof value !== 'string') return value
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .trim()
      .substring(0, 6) // Nederlandse postcode is max 6 chars
  },
  
  // License plate sanitizer (Nederlands kenteken)
  kenteken: (value) => {
    if (typeof value !== 'string') return value
    return value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .trim()
      .substring(0, 8) // Max length voor kenteken
  },
  
  // Text content sanitizer (for comments, descriptions)
  text: (value, maxLength = 1000) => {
    if (typeof value !== 'string') return value
    let sanitized = value.trim()
    
    // Remove XSS attempts
    sanitized = DOMPurify.sanitize(sanitized, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    })
    
    // Escape remaining HTML entities
    sanitized = validator.escape(sanitized)
    
    return sanitized.substring(0, maxLength)
  },
  
  // Number sanitizer with bounds
  number: (value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => {
    const num = parseFloat(value)
    if (isNaN(num) || !isFinite(num)) return 0
    return Math.max(min, Math.min(max, num))
  },
  
  // Integer sanitizer with bounds
  integer: (value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || !isFinite(num)) return 0
    return Math.max(min, Math.min(max, num))
  },
  
  // Currency sanitizer (Euro cents precision)
  currency: (value) => {
    const num = parseFloat(value)
    if (isNaN(num) || !isFinite(num)) return 0.00
    // Round to 2 decimal places (cent precision)
    return Math.round(num * 100) / 100
  },
  
  // Date sanitizer (returns ISO date string or null)
  date: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) return null
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  },
  
  // Time sanitizer (HH:MM format)
  time: (value) => {
    if (typeof value !== 'string') return value
    const timeMatch = value.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
    if (timeMatch) {
      // Ensure 2-digit format
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`
    }
    return value
  },
  
  // URL sanitizer (only allows http/https)
  url: (value) => {
    if (typeof value !== 'string') return value
    try {
      const url = new URL(value.trim())
      // Only allow http and https protocols
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.toString()
      }
    } catch (e) {
      // Invalid URL format
    }
    return ''
  },
  
  // Boolean sanitizer
  boolean: (value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim()
      return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on'
    }
    if (typeof value === 'number') {
      return value !== 0
    }
    return false
  },
  
  // Array sanitizer
  array: (value, itemSanitizer = null, maxLength = 100) => {
    if (!Array.isArray(value)) return []
    let sanitized = value.slice(0, maxLength) // Limit array size
    
    if (itemSanitizer && typeof itemSanitizer === 'function') {
      sanitized = sanitized.map(item => itemSanitizer(item))
    }
    
    return sanitized
  },
  
  // Slug sanitizer (for URLs)
  slug: (value) => {
    if (typeof value !== 'string') return value
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s\-]/g, '') // Only letters, numbers, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100)
  }
}

// Custom sanitization middleware for specific routes
const sanitizeStudentData = (req, res, next) => {
  if (req.body) {
    if (req.body.naam) req.body.naam = sanitizers.name(req.body.naam)
    if (req.body.email) req.body.email = sanitizers.email(req.body.email)
    if (req.body.telefoon) req.body.telefoon = sanitizers.phone(req.body.telefoon)
    if (req.body.adres) req.body.adres = sanitizers.address(req.body.adres)
    if (req.body.postcode) req.body.postcode = sanitizers.postcode(req.body.postcode)
    if (req.body.plaats) req.body.plaats = sanitizers.name(req.body.plaats)
    if (req.body.geboortedatum) req.body.geboortedatum = sanitizers.date(req.body.geboortedatum)
    if (req.body.tegoed !== undefined) req.body.tegoed = sanitizers.currency(req.body.tegoed)
    if (req.body.openstaand_bedrag !== undefined) req.body.openstaand_bedrag = sanitizers.currency(req.body.openstaand_bedrag)
    if (req.body.instructeur_id !== undefined) req.body.instructeur_id = sanitizers.integer(req.body.instructeur_id, 1)
  }
  next()
}

const sanitizeInstructeurData = (req, res, next) => {
  if (req.body) {
    if (req.body.naam) req.body.naam = sanitizers.name(req.body.naam)
    if (req.body.email) req.body.email = sanitizers.email(req.body.email)
    if (req.body.telefoon) req.body.telefoon = sanitizers.phone(req.body.telefoon)
    if (req.body.rijbewijs_type && Array.isArray(req.body.rijbewijs_type)) {
      req.body.rijbewijs_type = sanitizers.array(
        req.body.rijbewijs_type,
        (type) => type && ['B', 'A', 'C', 'D', 'E'].includes(type.toString().toUpperCase()) ? type.toString().toUpperCase() : null,
        5
      ).filter(Boolean) // Remove null values
    }
  }
  next()
}

const sanitizeLesData = (req, res, next) => {
  if (req.body) {
    if (req.body.datum) req.body.datum = sanitizers.date(req.body.datum)
    if (req.body.tijd) req.body.tijd = sanitizers.time(req.body.tijd)
    if (req.body.duur !== undefined) req.body.duur = sanitizers.integer(req.body.duur, 15, 480) // 15 min to 8 hours
    if (req.body.student_id !== undefined) req.body.student_id = sanitizers.integer(req.body.student_id, 1)
    if (req.body.instructeur_id !== undefined) req.body.instructeur_id = sanitizers.integer(req.body.instructeur_id, 1)
    if (req.body.vehicle_id !== undefined) req.body.vehicle_id = sanitizers.integer(req.body.vehicle_id, 1)
    if (req.body.opmerkingen) req.body.opmerkingen = sanitizers.text(req.body.opmerkingen, 1000)
    if (req.body.prijs !== undefined) req.body.prijs = sanitizers.currency(req.body.prijs)
  }
  next()
}

const sanitizeVehicleData = (req, res, next) => {
  if (req.body) {
    if (req.body.merk) req.body.merk = sanitizers.name(req.body.merk)
    if (req.body.model) req.body.model = sanitizers.name(req.body.model)
    if (req.body.bouwjaar !== undefined) req.body.bouwjaar = sanitizers.integer(req.body.bouwjaar, 1990, new Date().getFullYear() + 1)
    if (req.body.kenteken) req.body.kenteken = sanitizers.kenteken(req.body.kenteken)
    if (req.body.kilometerstand !== undefined) req.body.kilometerstand = sanitizers.integer(req.body.kilometerstand, 0, 9999999)
    if (req.body.laatste_onderhoud) req.body.laatste_onderhoud = sanitizers.date(req.body.laatste_onderhoud)
    if (req.body.volgende_onderhoud) req.body.volgende_onderhoud = sanitizers.date(req.body.volgende_onderhoud)
    if (req.body.apk_datum) req.body.apk_datum = sanitizers.date(req.body.apk_datum)
    if (req.body.instructeur_id !== undefined) req.body.instructeur_id = sanitizers.integer(req.body.instructeur_id, 1)
  }
  next()
}

const sanitizeTransactionData = (req, res, next) => {
  if (req.body) {
    if (req.body.bedrag !== undefined) req.body.bedrag = sanitizers.currency(req.body.bedrag)
    if (req.body.beschrijving) req.body.beschrijving = sanitizers.text(req.body.beschrijving, 500)
    if (req.body.datum) req.body.datum = sanitizers.date(req.body.datum)
  }
  next()
}

// Remove empty strings and convert to null
const cleanEmptyValues = (req, res, next) => {
  const cleanObject = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const cleaned = {}
      for (const [key, value] of Object.entries(obj)) {
        if (value === '' || value === 'undefined' || value === 'null') {
          cleaned[key] = null
        } else if (typeof value === 'object' && value !== null) {
          cleaned[key] = cleanObject(value)
        } else {
          cleaned[key] = value
        }
      }
      return cleaned
    }
    return obj
  }
  
  req.body = cleanObject(req.body)
  req.query = cleanObject(req.query)
  
  next()
}

// Trim whitespace from all string values
const trimWhitespace = (req, res, next) => {
  const trimObject = (obj) => {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const trimmed = {}
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          trimmed[key] = value.trim()
        } else if (typeof value === 'object' && value !== null) {
          trimmed[key] = trimObject(value)
        } else {
          trimmed[key] = value
        }
      }
      return trimmed
    } else if (Array.isArray(obj)) {
      return obj.map(item => typeof item === 'string' ? item.trim() : trimObject(item))
    }
    return obj
  }
  
  req.body = trimObject(req.body)
  req.query = trimObject(req.query)
  
  next()
}

// File upload sanitization (voor toekomstige file uploads)
const sanitizeFileUpload = (req, res, next) => {
  if (req.files) {
    const allowedMimes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv'
    ]
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    for (const [fieldName, file] of Object.entries(req.files)) {
      // Handle both single files and arrays
      const files = Array.isArray(file) ? file : [file]
      
      for (const singleFile of files) {
        // Check file type
        if (!allowedMimes.includes(singleFile.mimetype)) {
          return res.status(400).json({
            success: false,
            message: `Bestandstype '${singleFile.mimetype}' niet toegestaan. Toegestane types: ${allowedMimes.join(', ')}`
          })
        }
        
        // Check file size
        if (singleFile.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `Bestand '${singleFile.name}' te groot (${Math.round(singleFile.size / 1024 / 1024)}MB). Maximaal 5MB toegestaan.`
          })
        }
        
        // Sanitize filename
        const originalName = singleFile.name || 'unknown'
        const extension = originalName.split('.').pop() || ''
        const baseName = originalName.replace(/\.[^/.]+$/, '') // Remove extension
        
        singleFile.name = sanitizers.slug(baseName).substring(0, 50) + 
                         (extension ? '.' + extension.toLowerCase() : '')
        
        // Ensure filename is not empty
        if (!singleFile.name || singleFile.name === '.') {
          singleFile.name = `file_${Date.now()}.${extension || 'bin'}`
        }
      }
    }
  }
  next()
}

// Query parameter sanitization for search and filters
const sanitizeQueryParams = (req, res, next) => {
  if (req.query) {
    // Pagination
    if (req.query.page) req.query.page = sanitizers.integer(req.query.page, 1, 1000)
    if (req.query.limit) req.query.limit = sanitizers.integer(req.query.limit, 1, 100)
    
    // Search terms
    if (req.query.search) req.query.search = sanitizers.text(req.query.search, 100)
    if (req.query.q) req.query.q = sanitizers.text(req.query.q, 100)
    
    // Dates
    if (req.query.startDatum) req.query.startDatum = sanitizers.date(req.query.startDatum)
    if (req.query.eindDatum) req.query.eindDatum = sanitizers.date(req.query.eindDatum)
    if (req.query.datum) req.query.datum = sanitizers.date(req.query.datum)
    
    // IDs
    if (req.query.student_id) req.query.student_id = sanitizers.integer(req.query.student_id, 1)
    if (req.query.instructeur_id) req.query.instructeur_id = sanitizers.integer(req.query.instructeur_id, 1)
    if (req.query.vehicle_id) req.query.vehicle_id = sanitizers.integer(req.query.vehicle_id, 1)
    
    // Sort and order
    if (req.query.sortBy) req.query.sortBy = sanitizers.slug(req.query.sortBy)
    if (req.query.order) {
      req.query.order = ['asc', 'desc'].includes(req.query.order.toLowerCase()) 
        ? req.query.order.toLowerCase() 
        : 'asc'
    }
  }
  next()
}

// Advanced sanitization for nested objects
const sanitizeNestedData = (req, res, next) => {
  if (req.body) {
    // Handle financieel object in student data
    if (req.body.financieel && typeof req.body.financieel === 'object') {
      if (req.body.financieel.openstaandBedrag !== undefined) {
        req.body.financieel.openstaandBedrag = sanitizers.currency(req.body.financieel.openstaandBedrag)
      }
      if (req.body.financieel.laatsteBetaling) {
        req.body.financieel.laatsteBetaling = sanitizers.date(req.body.financieel.laatsteBetaling)
      }
    }
    
    // Handle arrays of lesson history, exams, etc.
    if (req.body.lesGeschiedenis && Array.isArray(req.body.lesGeschiedenis)) {
      req.body.lesGeschiedenis = req.body.lesGeschiedenis.map(les => ({
        datum: les.datum ? sanitizers.date(les.datum) : null,
        duur: les.duur ? sanitizers.integer(les.duur, 15, 480) : null,
        opmerkingen: les.opmerkingen ? sanitizers.text(les.opmerkingen, 500) : null
      }))
    }
    
    if (req.body.examens && Array.isArray(req.body.examens)) {
      req.body.examens = req.body.examens.map(examen => ({
        datum: examen.datum ? sanitizers.date(examen.datum) : null,
        type: examen.type ? sanitizers.text(examen.type, 50) : null,
        resultaat: examen.resultaat && ['Geslaagd', 'Gezakt', 'Gepland'].includes(examen.resultaat) 
          ? examen.resultaat 
          : null
      }))
    }
  }
  next()
}

module.exports = {
  sanitizeInput,
  sanitizers,
  sanitizeStudentData,
  sanitizeInstructeurData,
  sanitizeLesData,
  sanitizeVehicleData,
  sanitizeTransactionData,
  cleanEmptyValues,
  trimWhitespace,
  sanitizeFileUpload,
  sanitizeQueryParams,
  sanitizeNestedData
}