require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const authRoutes = require("./routes/auth.routes")
const studentRoutes = require("./routes/student.routes")
const instructeurRoutes = require("./routes/instructeur.routes")
const lesRoutes = require("./routes/les.routes") // Import les routes

const app = express()

// Connect Database
connectDB()

// Middleware
app.use(cors()) // Enable CORS for all origins
app.use(express.json()) // Body parser for JSON

// Define Routes
app.use("/api/auth", authRoutes)
app.use("/api/studenten", studentRoutes)
app.use("/api/instructeurs", instructeurRoutes)
app.use("/api/lessen", lesRoutes) // Use les routes

// Basic route for testing
app.get("/", (req, res) => {
  res.send("API is running...")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
