require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { testConnection } = require("./config/db")

// Security middleware imports
const {
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
  compression
} = require("./middleware/security")

const {
  sanitizeInput,
  trimWhitespace,
  cleanEmptyValues
} = require("./middleware/sanitization")

const app = express()

// Connect Database
testConnection()

// ===== SECURITY MIDDLEWARE (ORDER MATTERS!) =====

// 1. Request ID generation (for tracing)
app.use(requestId)

// 2. Security headers (Helmet)
app.use(securityHeaders)

// 3. Compression (before other middleware)
app.use(compression)

// 4. IP filtering (if needed)
app.use(ipFilter)

// 5. Request size limiting
app.use(requestSizeLimit)

// 6. Security logging
app.use(securityLogging)

// 7. CORS with security options
app.use(cors(corsOptions))

// 8. Body parsing with size limits
app.use(express.json({ 
  extended: false,
  limit: '10mb',
  strict: true
}))
app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb'
}))

// 9. Input sanitization (trim, clean, sanitize)
app.use(trimWhitespace)
app.use(cleanEmptyValues)
app.use(sanitizeInput)

// 10. SQL injection protection
app.use(sqlInjectionProtection)

// 11. XSS protection
app.use(xssProtection)

// 12. Database health check endpoint
app.use(dbHealthCheck)

// ===== API RATE LIMITING =====

// Apply general API rate limiting to all API routes
app.use('/api', rateLimiters.api)

// Apply strict rate limiting to auth routes
app.use('/api/auth/signin', rateLimiters.auth)
app.use('/api/auth/signup', rateLimiters.auth)
app.use('/api/auth/change-password', rateLimiters.passwordChange)

// ===== ROUTES =====

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Rijschool API is running!", 
    status: "OK",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    database: "PostgreSQL (Neon)",
    security: "Enhanced",
    requestId: req.requestId,
    endpoints: {
      docs: "/api",
      health: "/health",
      auth: "/api/auth/*",
      students: "/api/students/*",
      instructeurs: "/api/instructeurs/*", 
      lessons: "/api/lessons/*",
      vehicles: "/api/vehicles/*"
    }
  })
})

// API Documentation route
app.get("/api", (req, res) => {
  res.json({
    message: "Rijschool Planning Systeem API",
    version: "1.0.0",
    database: "PostgreSQL via Neon",
    authentication: "JWT Bearer Token",
    security: {
      rateLimit: "100 requests per 15 minutes",
      authRateLimit: "5 attempts per 15 minutes",
      requestSizeLimit: "10MB",
      cors: "Configured",
      headers: "Helmet secured",
      inputValidation: "Express-validator",
      sanitization: "DOMPurify + custom"
    },
    endpoints: {
      auth: {
        "POST /api/auth/signup": "Registreer nieuwe gebruiker",
        "POST /api/auth/signin": "Inloggen",
        "GET /api/auth/profile": "Gebruikersprofiel ophalen (token required)",
        "POST /api/auth/change-password": "Wachtwoord wijzigen (token required)"
      },
      students: {
        "GET /api/students": "Alle studenten ophalen (met filters & paginatie)",
        "GET /api/students/:id": "Student ophalen op ID",
        "POST /api/students": "Nieuwe student aanmaken (eigenaar only)",
        "PUT /api/students/:id": "Student bijwerken (eigenaar/instructeur)",
        "DELETE /api/students/:id": "Student verwijderen (eigenaar only)",
        "POST /api/students/:id/transactie": "Financiële transactie toevoegen (eigenaar only)"
      },
      instructeurs: {
        "GET /api/instructeurs": "Alle instructeurs ophalen",
        "GET /api/instructeurs/:id": "Instructeur ophalen op ID",
        "GET /api/instructeurs/:id/planning": "Planning van instructeur",
        "POST /api/instructeurs": "Nieuwe instructeur aanmaken (eigenaar only)",
        "PUT /api/instructeurs/:id": "Instructeur bijwerken (eigenaar only)",
        "DELETE /api/instructeurs/:id": "Instructeur verwijderen (eigenaar only)"
      },
      lessons: {
        "GET /api/lessons": "Alle lessen ophalen (met filters & paginatie)",
        "GET /api/lessons/:id": "Les ophalen op ID",
        "POST /api/lessons": "Nieuwe les aanmaken (eigenaar/instructeur)",
        "PUT /api/lessons/:id": "Les bijwerken (eigenaar/instructeur)",
        "DELETE /api/lessons/:id": "Les verwijderen (eigenaar only)"
      },
      vehicles: {
        "GET /api/vehicles": "Alle voertuigen ophalen (met filters)",
        "GET /api/vehicles/:id": "Voertuig ophalen op ID",
        "GET /api/vehicles/maintenance-alerts": "Onderhoudsmeldingen",
        "POST /api/vehicles": "Nieuw voertuig aanmaken (eigenaar only)",
        "PUT /api/vehicles/:id": "Voertuig bijwerken (eigenaar only)",
        "DELETE /api/vehicles/:id": "Voertuig verwijderen (eigenaar only)"
      }
    },
    authorization_roles: {
      eigenaar: "Volledige toegang tot alle resources",
      instructeur: "Kan lessen beheren en studenten bekijken/bewerken",
      gebruiker: "Alleen lezen van eigen gegevens"
    },
    example_requests: {
      login: {
        url: "POST /api/auth/signin",
        body: {
          email: "eigenaar@rijschool.nl",
          wachtwoord: "eigenaar123"
        }
      },
      get_students: {
        url: "GET /api/students?page=1&limit=10&status=Actief",
        headers: {
          Authorization: "Bearer YOUR_JWT_TOKEN"
        }
      }
    }
  })
})

// Define Routes with specific validation
app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/students", require("./routes/student.routes"))
app.use("/api/instructeurs", require("./routes/instructeur.routes"))
app.use("/api/lessons", require("./routes/les.routes"))
app.use("/api/vehicles", require("./routes/vehicle.routes"))

// ===== ERROR HANDLING =====

// Security error handler
app.use((err, req, res, next) => {
  // Log security-related errors
  if (err.message.includes('CORS') || 
      err.message.includes('rate limit') || 
      err.message.includes('validation')) {
    console.warn('🚨 Security event:', {
      error: err.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    })
  }
  
  next(err)
})

// General error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    requestId: req.requestId,
    url: req.url,
    method: req.method
  })
  
  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    return res.status(429).json({
      success: false,
      message: "Te veel verzoeken. Probeer later opnieuw.",
      requestId: req.requestId
    })
  }
  
  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: "CORS fout: Niet toegestane origin",
      requestId: req.requestId
    })
  }
  
  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      message: "Database verbinding mislukt",
      requestId: req.requestId,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Ongeldige token",
      requestId: req.requestId
    })
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Token is verlopen",
      requestId: req.requestId
    })
  }
  
  // Validation errors
  if (err.name === 'ValidationError' || err.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Validatie fout",
      requestId: req.requestId,
      details: err.details || err.message
    })
  }
  
  // PostgreSQL errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(400).json({
      success: false,
      message: "Deze waarde bestaat al in het systeem",
      requestId: req.requestId
    })
  }
  
  if (err.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({
      success: false,
      message: "Kan dit record niet verwijderen omdat het nog in gebruik is",
      requestId: req.requestId
    })
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Er is een serverfout opgetreden",
    requestId: req.requestId,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} niet gevonden`,
    suggestion: "Controleer de API documentatie op /api",
    requestId: req.requestId,
    available_routes: [
      "GET /",
      "GET /api",
      "GET /health",
      "POST /api/auth/signup",
      "POST /api/auth/signin",
      "GET /api/students",
      "GET /api/instructeurs",
      "GET /api/lessons",
      "GET /api/vehicles"
    ]
  })
})

// ===== SERVER STARTUP =====

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  console.log('🚀 ===================================')
  console.log(`🏫 Rijschool API Server Started`)
  console.log('🚀 ===================================')
  console.log(`📍 Server URL: http://localhost:${PORT}`)
  console.log(`📋 API Docs: http://localhost:${PORT}/api`)
  console.log(`🏥 Health: http://localhost:${PORT}/health`)
  console.log(`🔐 Test Login: eigenaar@rijschool.nl / eigenaar123`)
  console.log(`💾 Database: PostgreSQL (Neon)`)
  console.log(`🛡️ Security: Enhanced (Rate limiting, Validation, Sanitization)`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log('🚀 ===================================')
})

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`🔄 ${signal} received, shutting down gracefully...`)
  server.close(() => {
    console.log('✅ HTTP server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})