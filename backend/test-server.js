require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()

// Simple CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ 
    message: "Test server is working!",
    timestamp: new Date().toISOString()
  })
})

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: "API test endpoint working",
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`)
  console.log('✅ CORS enabled for localhost:3000 and localhost:3001')
})