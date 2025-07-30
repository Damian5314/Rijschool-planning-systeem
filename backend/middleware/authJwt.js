const jwt = require("jsonwebtoken")
const { pool } = require("../config/db")

/**
 * Middleware om JWT token te verifiëren
 * Controleert of de gebruiker een geldige token heeft
 */
const verifyToken = (req, res, next) => {
  // Zoek token in headers (meerdere mogelijke locaties)
  let token = req.headers["x-access-token"] || 
              req.headers["authorization"] || 
              req.headers["Authorization"]

  // Als authorization header gebruikt wordt, haal "Bearer " weg
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length)
  }

  // Geen token gevonden
  if (!token) {
    return res.status(403).json({ 
      success: false,
      message: "Geen token verstrekt! Toegang geweigerd." 
    })
  }

  // Verificeer JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ 
        success: false,
        message: "Ongeautoriseerd! Token is ongeldig of verlopen." 
      })
    }
    
    // Sla user info op in request object voor gebruik in volgende middleware
    req.userId = decoded.id
    req.userRole = decoded.rol
    req.userEmail = decoded.email // Extra info die handig kan zijn
    
    next() // Ga door naar volgende middleware/controller
  })
}

/**
 * Middleware om te controleren of gebruiker eigenaar rechten heeft
 * Moet ALTIJD na verifyToken gebruikt worden
 */
const isAdmin = async (req, res, next) => {
  try {
    // Haal user op uit database met PostgreSQL query
    const userQuery = 'SELECT id, email, rol, actief FROM users WHERE id = $1'
    const result = await pool.query(userQuery, [req.userId])
    
    // Controleer of user bestaat
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Gebruiker niet gevonden!" 
      })
    }
    
    const user = result.rows[0]
    
    // Controleer of account actief is
    if (!user.actief) {
      return res.status(403).json({ 
        success: false,
        message: "Account is gedeactiveerd!" 
      })
    }
    
    // Controleer eigenaar rol
    if (user.rol === "eigenaar") {
      req.user = user // Sla volledige user object op voor gebruik in controllers
      next()
    } else {
      res.status(403).json({ 
        success: false,
        message: "Vereist Admin Rol! Toegang geweigerd." 
      })
    }
  } catch (error) {
    console.error("Error in isAdmin middleware:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij rol verificatie",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Middleware om te controleren of gebruiker gewone gebruiker rechten heeft
 * Kan gebruikt worden voor user-only routes
 */
const isUser = async (req, res, next) => {
  try {
    // Haal user op uit database
    const userQuery = 'SELECT id, email, rol, actief FROM users WHERE id = $1'
    const result = await pool.query(userQuery, [req.userId])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Gebruiker niet gevonden!" 
      })
    }
    
    const user = result.rows[0]
    
    // Controleer of account actief is
    if (!user.actief) {
      return res.status(403).json({ 
        success: false,
        message: "Account is gedeactiveerd!" 
      })
    }
    
    // Controleer gebruiker rol
    if (user.rol === "gebruiker") {
      req.user = user
      next()
    } else {
      res.status(403).json({ 
        success: false,
        message: "Vereist Gebruiker Rol!" 
      })
    }
  } catch (error) {
    console.error("Error in isUser middleware:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij rol verificatie",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Middleware om te controleren of gebruiker instructeur rechten heeft
 * Nuttig voor instructeur-specifieke routes
 */
const isInstructeur = async (req, res, next) => {
  try {
    const userQuery = 'SELECT id, email, rol, actief FROM users WHERE id = $1'
    const result = await pool.query(userQuery, [req.userId])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Gebruiker niet gevonden!" 
      })
    }
    
    const user = result.rows[0]
    
    if (!user.actief) {
      return res.status(403).json({ 
        success: false,
        message: "Account is gedeactiveerd!" 
      })
    }
    
    if (user.rol === "instructeur") {
      req.user = user
      next()
    } else {
      res.status(403).json({ 
        success: false,
        message: "Vereist Instructeur Rol!" 
      })
    }
  } catch (error) {
    console.error("Error in isInstructeur middleware:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij rol verificatie",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Middleware om te controleren of gebruiker eigenaar OF instructeur is
 * Handig voor routes die beide rollen toegang moeten geven
 */
const isAdminOrInstructeur = async (req, res, next) => {
  try {
    const userQuery = 'SELECT id, email, rol, actief FROM users WHERE id = $1'
    const result = await pool.query(userQuery, [req.userId])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Gebruiker niet gevonden!" 
      })
    }
    
    const user = result.rows[0]
    
    if (!user.actief) {
      return res.status(403).json({ 
        success: false,
        message: "Account is gedeactiveerd!" 
      })
    }
    
    if (user.rol === "eigenaar" || user.rol === "instructeur") {
      req.user = user
      next()
    } else {
      res.status(403).json({ 
        success: false,
        message: "Vereist Admin of Instructeur Rol!" 
      })
    }
  } catch (error) {
    console.error("Error in isAdminOrInstructeur middleware:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij rol verificatie",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * Middleware om te controleren of gebruiker zichzelf of eigenaar is
 * Voor routes waar users hun eigen data kunnen bewerken
 */
const isSelfOrAdmin = async (req, res, next) => {
  try {
    const targetUserId = req.params.id || req.params.userId
    const currentUserId = req.userId
    
    const userQuery = 'SELECT id, email, rol, actief FROM users WHERE id = $1'
    const result = await pool.query(userQuery, [currentUserId])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Gebruiker niet gevonden!" 
      })
    }
    
    const user = result.rows[0]
    
    if (!user.actief) {
      return res.status(403).json({ 
        success: false,
        message: "Account is gedeactiveerd!" 
      })
    }
    
    // Admin heeft altijd toegang, of gebruiker bewerkt eigen gegevens
    if (user.rol === "eigenaar" || currentUserId.toString() === targetUserId.toString()) {
      req.user = user
      next()
    } else {
      res.status(403).json({ 
        success: false,
        message: "Je kunt alleen je eigen gegevens bewerken!" 
      })
    }
  } catch (error) {
    console.error("Error in isSelfOrAdmin middleware:", error)
    res.status(500).json({ 
      success: false,
      message: "Server error bij autorisatie controle",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Export alle middleware functies
const authJwt = {
  verifyToken,
  isAdmin,
  isUser,
  isInstructeur,
  isAdminOrInstructeur,
  isSelfOrAdmin
}

module.exports = authJwt