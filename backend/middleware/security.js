const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const compression = require('compression')
const { pool } = require('../config/db')

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator om IP + user te gebruiken
    keyGenerator: (req) => {
      return req.ip + ':' + (req.userId || 'anonymous')
    }
  })
}

// Different rate limits for different endpoints
const rateLimiters = {
  // Strenge limiet voor auth endpoints
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minuten
    5, // 5 attempts
    'Te veel login pogingen. Probeer over 15 minuten opnieuw.'
  ),
  
  // Matige limiet voor API calls
  api: createRateLimiter(
    15 * 60 * 1000, // 15 minuten
    100, // 100 requests
    'Te veel API verzoeken. Probeer over 15 minuten opnieuw.'
  ),
  
  // Strenge limiet voor password changes
  passwordChange: createRateLimiter(
    60 * 60 * 1000, // 1 uur
    3, // 3 attempts
    'Te veel wachtwoord wijzigingen. Probeer over 1 uur opnieuw.'
  ),
  
  // Limiet voor file uploads (als je die toevoegt)
  upload: createRateLimiter(
    15 * 60 * 1000, // 15 minuten
    10, // 10 uploads
    'Te veel uploads. Probeer over 15 minuten opnieuw.'
  )
}

// Security headers met helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Voor API compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
})

// Request size limiting
const requestSizeLimit = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request te groot. Maximaal 10MB toegestaan.'
    })
  }
  next()
}

// SQL Injection protection (extra layer)
const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\b(OR|AND)\b.*[=<>])/i,
    /([\'"]);?\s*(DROP|DELETE|UPDATE|INSERT)/i
  ]
  
  const checkValue = (value) => {
    if (typeof value === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(value))
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue)
    }
    return false
  }
  
  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    console.warn('⚠️ Verdachte SQL patterns gedetecteerd:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      body: req.body,
      query: req.query
    })
    
    return res.status(400).json({
      success: false,
      message: 'Ongeldige karakters gedetecteerd in request.'
    })
  }
  
  next()
}

// XSS Protection
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img.*?onerror.*?>/gi
  ]
  
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return xssPatterns.reduce((val, pattern) => {
        return val.replace(pattern, '')
      }, value)
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized = {}
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val)
      }
      return sanitized
    }
    return value
  }
  
  req.body = sanitizeValue(req.body)
  req.query = sanitizeValue(req.query)
  
  next()
}

// Request logging voor security monitoring
const securityLogging = (req, res, next) => {
  const startTime = Date.now()
  
  // Log verdachte activiteit
  const logSuspiciousActivity = () => {
    const suspiciousIndicators = [
      req.url.includes('..'),
      req.url.includes('eigenaar') && !req.url.includes('/api/'),
      req.headers['user-agent']?.includes('sqlmap'),
      req.headers['user-agent']?.includes('nikto'),
      Object.keys(req.query || {}).length > 20,
      JSON.stringify(req.body || {}).length > 100000
    ]
    
    if (suspiciousIndicators.some(indicator => indicator)) {
      console.warn('🚨 Verdachte activiteit gedetecteerd:', {
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      })
    }
  }
  
  logSuspiciousActivity()
  
  // Response time logging
  res.on('finish', () => {
    const duration = Date.now() - startTime
    if (duration > 5000) { // Log slow requests
      console.warn('🐌 Langzame request:', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode
      })
    }
  })
  
  next()
}

// IP whitelist/blacklist (optioneel)
const ipFilter = (req, res, next) => {
  const blacklistedIPs = process.env.BLACKLISTED_IPS ? 
    process.env.BLACKLISTED_IPS.split(',') : []
  
  if (blacklistedIPs.includes(req.ip)) {
    console.warn('🚫 Geblokkeerd IP toegang geprobeerd:', req.ip)
    return res.status(403).json({
      success: false,
      message: 'Toegang geweigerd.'
    })
  }
  
  next()
}

// Database connection monitoring
const dbHealthCheck = async (req, res, next) => {
  if (req.url === '/health' || req.url === '/api/health') {
    try {
      const result = await pool.query('SELECT 1')
      res.json({
        success: true,
        database: 'connected',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      res.status(503).json({
        success: false,
        database: 'disconnected',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Database error'
      })
    }
    return
  }
  next()
}

// Request ID generator voor tracing
const requestId = (req, res, next) => {
  req.requestId = Math.random().toString(36).substr(2, 9)
  res.setHeader('X-Request-ID', req.requestId)
  next()
}

// CORS security
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3000'
      ]
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn('🚫 CORS blocked origin:', origin)
      console.warn('🔧 Allowed origins:', allowedOrigins)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'X-Requested-With'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400 // 24 hours
}

module.exports = {
  rateLimiters,
  securityHeaders,
  requestSizeLimit,
  sqlInjectionProtection,
  xssProtection,
  securityLogging,
  ipFilter,
  dbHealthCheck,
  requestId,
  corsOptions,
  compression: compression()
}