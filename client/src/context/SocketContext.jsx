import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getSocket } from '../services/socket'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState({}) // { roomId/convId: [usernames] }
  const [notifications, setNotifications] = useState([])
  const typingTimeout = useRef({})

  useEffect(() => {
    if (!user) return
    const socket = getSocket()
    if (!socket) return

    const onOnlineUsers = (users) => setOnlineUsers(users)
    const onUserOnline = ({ userId }) =>
      setOnlineUsers(prev => prev.includes(userId) ? prev : [...prev, userId])
    const onUserOffline = ({ userId }) =>
      setOnlineUsers(prev => prev.filter(id => id !== userId))

    const onTypingStart = ({ userId, username, roomId, conversationId }) => {
      const key = roomId || conversationId
      setTypingUsers(prev => ({
        ...prev,
        [key]: [...new Set([...(prev[key] || []), username])]
      }))
    }
    const onTypingStop = ({ username, roomId, conversationId }) => {
      const key = roomId || conversationId
      setTypingUsers(prev => ({
        ...prev,
        [key]: (prev[key] || []).filter(u => u !== username)
      }))
    }
    const onMentioned = (data) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)])
    }

    socket.on('online_users', onOnlineUsers)
    socket.on('user_online', onUserOnline)
    socket.on('user_offline', onUserOffline)
    socket.on('typing_start', onTypingStart)
    socket.on('typing_stop', onTypingStop)
    socket.on('mentioned', onMentioned)

    return () => {
      socket.off('online_users', onOnlineUsers)
      socket.off('user_online', onUserOnline)
      socket.off('user_offline', onUserOffline)
      socket.off('typing_start', onTypingStart)
      socket.off('typing_stop', onTypingStop)
      socket.off('mentioned', onMentioned)
    }
  }, [user])

  const emitTyping = useCallback((key, isRoom) => {
    const socket = getSocket()
    if (!socket) return
    const payload = isRoom ? { roomId: key } : { conversationId: key }
    socket.emit('typing_start', payload)

    if (typingTimeout.current[key]) clearTimeout(typingTimeout.current[key])
    typingTimeout.current[key] = setTimeout(() => {
      socket.emit('typing_stop', payload)
    }, 2000)
  }, [])

  const clearNotifications = useCallback(() => setNotifications([]), [])

  return (
    <SocketContext.Provider value={{
      onlineUsers, typingUsers, notifications,
      emitTyping, clearNotifications
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}