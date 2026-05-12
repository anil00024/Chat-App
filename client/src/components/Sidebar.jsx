import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { getSocket } from '../services/socket'
import CreateRoomModal from './CreateRoomModal'


export default function Sidebar({ currentChatId, type }) {
  const { user, logout } = useAuth()
  const { onlineUsers } = useSocket()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [conversations, setConversations] = useState([])
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [r, c] = await Promise.all([api.get('/rooms'), api.get('/conversations')])
        setRooms(r.data.rooms || [])
        setConversations(c.data.conversations || [])
      } catch {}
    }
    load()

    const socket = getSocket()
    if (socket) {
      socket.on('room_created', (room) => setRooms(prev => [room, ...prev]))
      socket.on('new_conversation', (conv) => setConversations(prev => [conv, ...prev]))
      socket.on('new_message', (msg) => {
        if (msg.conversation_id) {
          setConversations(prev => prev.map(c =>
            c.id === msg.conversation_id ? { ...c, last_message: msg.content, unread_count: (c.unread_count || 0) + (c.id !== currentChatId ? 1 : 0) } : c
          ))
        }
      })
      return () => {
        socket.off('room_created')
        socket.off('new_conversation')
        socket.off('new_message')
      }
    }
  }, [currentChatId])

  return (
    <>
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.header}>
          {!collapsed && (
            <Link to="/dashboard" className={styles.brand}>
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 8.5V19.5L14 26L2 19.5V8.5L14 2Z" stroke="#4f9cf9" strokeWidth="1.5" fill="none"/>
                <circle cx="14" cy="14" r="3" fill="#4f9cf9"/>
              </svg>
              <span className={styles.brandName}>NEXUS</span>
            </Link>
          )}
          <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: collapsed ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}>
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {/* Rooms section */}
          <div className={styles.section}>
            {!collapsed && (
              <div className={styles.sectionHeader}>
                <span>ROOMS</span>
                <button className={styles.addBtn} onClick={() => setShowCreateRoom(true)}>+</button>
              </div>
            )}
            {rooms.slice(0, 15).map(room => (
              <button
                key={room.id}
                className={`${styles.item} ${type === 'room' && currentChatId == room.id ? styles.itemActive : ''}`}
                onClick={() => navigate(`/chat/room/${room.id}`)}
                title={collapsed ? `#${room.name}` : ''}
              >
                <span className={styles.itemIcon}>#</span>
                {!collapsed && <span className={styles.itemLabel}>{room.name}</span>}
              </button>
            ))}
          </div>

          {/* DMs section */}
          <div className={styles.section}>
            {!collapsed && (
              <div className={styles.sectionHeader}>
                <span>DIRECT MESSAGES</span>
              </div>
            )}
            {conversations.slice(0, 15).map(conv => {
              const other = conv.participants?.find(p => p.id !== user.id)
              if (!other) return null
              const isOnline = onlineUsers.includes(other.id)
              return (
                <button
                  key={conv.id}
                  className={`${styles.item} ${type === 'dm' && currentChatId == conv.id ? styles.itemActive : ''}`}
                  onClick={() => navigate(`/chat/dm/${conv.id}`)}
                  title={collapsed ? other.username : ''}
                >
                  <div className={styles.dmAvatar}>
                    {other.username[0].toUpperCase()}
                    <span className={`${styles.dmDot} ${isOnline ? styles.dmDotOn : ''}`} />
                  </div>
                  {!collapsed && (
                    <>
                      <span className={styles.itemLabel}>{other.username}</span>
                      {conv.unread_count > 0 && (
                        <span className={styles.unread}>{conv.unread_count}</span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user?.username[0].toUpperCase()}</div>
            {!collapsed && (
              <div className={styles.userMeta}>
                <span className={styles.userName}>{user?.username}</span>
                <span className={styles.userStatus}>● Online</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className={styles.logoutBtn} onClick={logout} title="Logout">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l4-3-4-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </aside>
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreate={(room) => {
            setRooms(prev => [room, ...prev])
            setShowCreateRoom(false)
            navigate(`/chat/room/${room.id}`)
          }}
        />
      )}
    </>
  )
}