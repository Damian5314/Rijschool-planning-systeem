const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"]

  if (!token) {
    return res.status(403).send({ message: "Geen token verstrekt!" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Ongeautoriseerd!" })
    }
    req.userId = decoded.id
    req.userRole = decoded.rol // Store user role
    next()
  })
}

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (user && user.rol === "admin") {
      next()
    } else {
      res.status(403).send({ message: "Vereist Admin Rol!" })
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

const isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (user && user.rol === "gebruiker") {
      next()
    } else {
      res.status(403).send({ message: "Vereist Gebruiker Rol!" })
    }
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

const authJwt = {
  verifyToken,
  isAdmin,
  isUser,
}
module.exports = authJwt
