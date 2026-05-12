require('dotenv').config()

// ================= IMPORTS =================

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const path = require('path')

const { initDb } = require('./config/db')
const { initSocket } = require('./socket/socketHandler')

// ================= ENV VALIDATION =================

const REQUIRED_ENV = [
  'JWT_SECRET',
]

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(
      `❌ Missing environment variable: ${key}`
    )

    process.exit(1)
  }
})

// ================= DATABASE =================

initDb()

// ================= EXPRESS APP =================

const app = express()

const server = http.createServer(app)

// ================= SOCKET.IO =================

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },

  transports: [
    'websocket',
    'polling',
  ],

  pingTimeout: 60000,
  pingInterval: 25000,
})

// Initialize socket logic
initSocket(io)

// Make io accessible everywhere
app.set('io', io)

// ================= SECURITY =================

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
)

// ================= PERFORMANCE =================

app.use(compression())

// ================= CORS =================

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
)

// ================= BODY PARSER =================

app.use(
  express.json({
    limit: '10kb',
  })
)

app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
)

// ================= LOGGER =================

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ================= RATE LIMITER =================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 200,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,

    message:
      'Too many requests. Please try again later.',
  },
})

app.use('/api', apiLimiter)

// ================= AUTH LIMITER =================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,

    message:
      'Too many authentication attempts.',
  },
})

// ================= API ROUTES =================

// AUTH ROUTES
app.use(
  '/api/auth',
  authLimiter,
  require('./routes/authRoutes')
)

// ROOM ROUTES
app.use(
  '/api/rooms',
  require('./routes/roomRoutes')
)

// MESSAGE ROUTES
app.use(
  '/api/messages',
  require('./routes/messageRoutes')
)

// USER ROUTES
// app.use(
//   '/api/users',
//   require('./routes/userRoutes')
// )

// CONVERSATION ROUTES
// app.use(
//   '/api/conversations',
//   require('./routes/conversationRoutes')
// )

// ================= HEALTH CHECK =================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,

    status: 'ok',

    uptime: process.uptime(),

    timestamp:
      new Date().toISOString(),
  })
})

// ================= ROOT ROUTE =================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,

    message:
      'Realtime Chat Server Running 🚀',
  })
})

// ================= PRODUCTION BUILD =================

if (process.env.NODE_ENV === 'production') {

  const clientPath = path.join(
    __dirname,
    '../client/dist'
  )

  app.use(express.static(clientPath))

  app.get('*', (req, res) => {

    res.sendFile(
      path.join(clientPath, 'index.html')
    )
  })
}

// ================= 404 HANDLER =================

app.use((req, res) => {

  res.status(404).json({
    success: false,

    message:
      `Route ${req.method} ${req.path} not found`,
  })
})

// ================= GLOBAL ERROR HANDLER =================

app.use((err, req, res, next) => {

  console.error('❌ SERVER ERROR')
  console.error(
    err.stack || err.message
  )

  const statusCode =
    err.statusCode ||
    err.status ||
    500

  res.status(statusCode).json({

    success: false,

    message:
      process.env.NODE_ENV ===
      'production'
        ? 'Internal server error'
        : err.message,
  })
})

// ================= SERVER START =================

const PORT =
  process.env.PORT || 5000

server.listen(PORT, () => {

  console.log(`
====================================
🚀 SERVER STARTED SUCCESSFULLY
🌍 PORT : ${PORT}
📦 MODE : ${
    process.env.NODE_ENV ||
    'development'
  }
====================================
`)
})

// ================= GRACEFUL SHUTDOWN =================

process.on('SIGINT', () => {

  console.log(
    '\n🛑 Shutting down server...'
  )

  server.close(() => {

    console.log(
      '✅ Server closed successfully'
    )

    process.exit(0)
  })
})

// ================= EXPORTS =================

module.exports = {
  app,
  server,
}