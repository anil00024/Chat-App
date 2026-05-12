const Conversation = require('../models/Conversation')
const User = require('../models/User')

const getConversations = (req, res) => {
  try {
    const conversations = Conversation.getAllForUser(req.user.id)
    return res.json({ conversations })
  } catch (err) {
    console.error('Get conversations error:', err)
    return res.status(500).json({ message: 'Failed to fetch conversations' })
  }
}

const getConversation = (req, res) => {
  try {
    const convId = parseInt(req.params.id)
    if (!Conversation.isParticipant(convId, req.user.id)) {
      return res.status(403).json({ message: 'Access denied' })
    }
    const conversation = Conversation.findById(convId, req.user.id)
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' })
    return res.json({ conversation })
  } catch (err) {
    console.error('Get conversation error:', err)
    return res.status(500).json({ message: 'Failed to fetch conversation' })
  }
}

const createConversation = (req, res) => {
  const { participantId } = req.body
  if (!participantId) return res.status(400).json({ message: 'participantId required' })
  if (parseInt(participantId) === req.user.id) {
    return res.status(400).json({ message: 'Cannot start conversation with yourself' })
  }

  const other = User.findById(participantId)
  if (!other) return res.status(404).json({ message: 'User not found' })

  try {
    const conversation = Conversation.findOrCreate(req.user.id, parseInt(participantId))
    // Notify the other participant
    req.app.get('io')?.to(`user:${participantId}`).emit('new_conversation', conversation)
    return res.status(201).json({ conversation })
  } catch (err) {
    console.error('Create conversation error:', err)
    return res.status(500).json({ message: 'Failed to create conversation' })
  }
}

module.exports = { getConversations, getConversation, createConversation }