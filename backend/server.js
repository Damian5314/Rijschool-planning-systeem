require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const app = express()

// Connect Database
connectDB()

// Init Middleware
app.use(express.json({ extended: false }))
app.use(cors())

// Define Routes
app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/students", require("./routes/student.routes"))
app.use("/api/instructeurs", require("./routes/instructeur.routes"))
app.use("/api/lessons", require("./routes/les.routes"))
app.use("/api/vehicles", require("./routes/vehicle.routes")) // New vehicle routes

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server gestart op poort ${PORT}`))
