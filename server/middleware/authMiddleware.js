const { verifyToken } = require('../utils/generateToken')
const { getDb } = require('../config/db')

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const db = getDb()
    const user = db.prepare(
      'SELECT id, username, email, avatar, status FROM users WHERE id = ?'
    ).get(decoded.id)

    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Socket.io auth middleware
const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentication required'))

    const decoded = verifyToken(token)
    const db = getDb()
    const user = db.prepare(
      'SELECT id, username, email, avatar, status FROM users WHERE id = ?'
    ).get(decoded.id)

    if (!user) return next(new Error('User not found'))

    socket.user = user
    next()
  } catch {
    next(new Error('Invalid token'))
  }
}

module.exports = { protect, socketAuth }