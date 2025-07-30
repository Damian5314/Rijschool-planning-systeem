const { pool } = require("../config/db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

// Input validatie helper functies
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validatePassword = (password) => {
  return password && password.length >= 6
}

// Signup functie - volledig uitgewerkt
const signup = async (req, res) => {
  try {
    const { naam, email, wachtwoord, rol = 'gebruiker' } = req.body

    // Input validatie
    if (!naam || !email || !wachtwoord) {
      return res.status(400).json({ 
        success: false,
        message: "Naam, email en wachtwoord zijn verplicht!" 
      })
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Ongeldig email adres!" 
      })
    }

    if (!validatePassword(wachtwoord)) {
      return res.status(400).json({ 
        success: false,
        message: "Wachtwoord moet minimaal 6 karakters lang zijn!" 
      })
    }

    // Check if user already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = $1'
    const existingUser = await pool.query(existingUserQuery, [email.toLowerCase()])
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Gebruiker met dit email bestaat al!" 
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(wachtwoord, salt)

    // Create user
    const insertUserQuery = `
      INSERT INTO users (naam, email, wachtwoord, rol) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, naam, email, rol, created_at
    `
    const result = await pool.query(insertUserQuery, [naam, email.toLowerCase(), hashedPassword, rol])
    const user = result.rows[0]

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      success: true,
      message: "Gebruiker succesvol geregistreerd!",
      data: {
        token,
        user: {
          id: user.id,
          naam: user.naam,
          email: user.email,
          rol: user.rol,
          created_at: user.created_at
        }
      }
    })

  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ 
      success: false,
      message: "Serverfout bij registratie",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Signin functie - volledig uitgewerkt
const signin = async (req, res) => {
  try {
    const { email, wachtwoord } = req.body

    // Input validatie
    if (!email || !wachtwoord) {
      return res.status(400).json({ 
        success: false,
        message: "Email en wachtwoord zijn verplicht!" 
      })
    }

    // Find user
    const userQuery = `
      SELECT id, naam, email, wachtwoord, rol, actief, created_at 
      FROM users 
      WHERE email = $1
    `
    const result = await pool.query(userQuery, [email.toLowerCase()])
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: "Ongeldige inloggegevens!" 
      })
    }

    const user = result.rows[0]

    // Check if account is active
    if (!user.actief) {
      return res.status(403).json({ 
        success: false,
        message: "Account is gedeactiveerd! Neem contact op met de beheerder." 
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(wachtwoord, user.wachtwoord)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Ongeldige inloggegevens!" 
      })
    }

    // Update last login
    await pool.query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id])

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      message: "Succesvol ingelogd!",
      data: {
        token,
        user: {
          id: user.id,
          naam: user.naam,
          email: user.email,
          rol: user.rol,
          created_at: user.created_at
        }
      }
    })

  } catch (error) {
    console.error("Signin error:", error)
    res.status(500).json({ 
      success: false,
      message: "Serverfout bij inloggen",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Profiel ophalen functie
const getProfile = async (req, res) => {
  try {
    const userId = req.userId

    const userQuery = `
      SELECT id, naam, email, rol, actief, created_at, updated_at 
      FROM users 
      WHERE id = $1
    `
    const result = await pool.query(userQuery, [userId])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Gebruiker niet gevonden!" 
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ 
      success: false,
      message: "Serverfout bij ophalen profiel" 
    })
  }
}

// Wachtwoord wijzigen functie
const changePassword = async (req, res) => {
  try {
    const userId = req.userId
    const { huidigWachtwoord, nieuwWachtwoord } = req.body

    if (!huidigWachtwoord || !nieuwWachtwoord) {
      return res.status(400).json({ 
        success: false,
        message: "Huidig en nieuw wachtwoord zijn verplicht!" 
      })
    }

    if (!validatePassword(nieuwWachtwoord)) {
      return res.status(400).json({ 
        success: false,
        message: "Nieuw wachtwoord moet minimaal 6 karakters lang zijn!" 
      })
    }

    // Get current user
    const userQuery = 'SELECT wachtwoord FROM users WHERE id = $1'
    const userResult = await pool.query(userQuery, [userId])
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Gebruiker niet gevonden!" 
      })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(huidigWachtwoord, userResult.rows[0].wachtwoord)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ 
        success: false,
        message: "Huidig wachtwoord is onjuist!" 
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12)
    const hashedNewPassword = await bcrypt.hash(nieuwWachtwoord, salt)

    // Update password
    await pool.query('UPDATE users SET wachtwoord = $1 WHERE id = $2', [hashedNewPassword, userId])

    res.json({
      success: true,
      message: "Wachtwoord succesvol gewijzigd!"
    })

  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ 
      success: false,
      message: "Serverfout bij wijzigen wachtwoord" 
    })
  }
}

module.exports = { 
  signup, 
  signin, 
  getProfile, 
  changePassword 
}