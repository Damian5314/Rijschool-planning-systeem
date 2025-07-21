const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

exports.signup = async (req, res) => {
  try {
    const { naam, email, wachtwoord, rol } = req.body

    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "Gebruiker bestaat al" })
    }

    // Create new user
    user = new User({
      naam,
      email,
      wachtwoord, // Mongoose pre-save hook will hash this
      rol: rol || "gebruiker", // Default role
    })

    await user.save()

    res.status(201).json({ message: "Gebruiker succesvol geregistreerd" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Serverfout bij registratie" })
  }
}

exports.signin = async (req, res) => {
  try {
    const { email, wachtwoord } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "Gebruiker niet gevonden." })
    }

    // Validate password
    const passwordIsValid = bcrypt.compareSync(wachtwoord, user.wachtwoord)
    if (!passwordIsValid) {
      return res.status(401).json({ accessToken: null, message: "Ongeldig wachtwoord!" })
    }

    // Generate token
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    })

    res.status(200).json({
      id: user._id,
      naam: user.naam,
      email: user.email,
      rol: user.rol,
      accessToken: token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Serverfout bij inloggen" })
  }
}
