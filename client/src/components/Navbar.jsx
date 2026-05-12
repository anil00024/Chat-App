import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'


export default function Navbar() {
  const { user, logout } = useAuth()
  const { notifications, clearNotifications } = useSocket()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)

  return (
    <header className={styles.nav}>
      <Link to="/dashboard" className={styles.brand}>
        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
          <path d="M14 2L26 8.5V19.5L14 26L2 19.5V8.5L14 2Z" stroke="#4f9cf9" strokeWidth="1.5" fill="none"/>
          <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="#4f9cf9" opacity="0.3"/>
          <circle cx="14" cy="14" r="3" fill="#4f9cf9"/>
        </svg>
        <span className={styles.brandName}>NEXUS</span>
      </Link>

      <div className={styles.actions}>
        <div className={styles.notifWrap}>
          <button className={styles.iconBtn} onClick={() => { setShowNotifs(!showNotifs); setShowMenu(false) }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2a5.5 5.5 0 0 1 5.5 5.5c0 3 1.5 4 1.5 4H2s1.5-1 1.5-4A5.5 5.5 0 0 1 9 2Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 14.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            {notifications.length > 0 && <span className={styles.notifBadge}>{notifications.length}</span>}
          </button>
          {showNotifs && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span>Mentions</span>
                <button onClick={clearNotifications} className={styles.clearBtn}>Clear all</button>
              </div>
              {notifications.length === 0 ? (
                <div className={styles.notifEmpty}>No new mentions</div>
              ) : notifications.slice(0, 5).map((n, i) => (
                <div key={i} className={styles.notifItem} onClick={() => {
                  setShowNotifs(false)
                  navigate(n.roomId ? `/chat/room/${n.roomId}` : `/chat/dm/${n.conversationId}`)
                }}>
                  <span className={styles.notifUser}>@{n.mentionedBy}</span>
                  <span className={styles.notifMsg}>{n.content?.substring(0, 60)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.userWrap}>
          <button className={styles.userBtn} onClick={() => { setShowMenu(!showMenu); setShowNotifs(false) }}>
            <div className={styles.avatar}>{user?.username[0].toUpperCase()}</div>
            <span className={styles.username}>{user?.username}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transition: 'transform 0.15s', transform: showMenu ? 'rotate(180deg)' : '' }}>
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          {showMenu && (
            <div className={styles.menu}>
              <Link to="/dashboard" className={styles.menuItem} onClick={() => setShowMenu(false)}>Dashboard</Link>
              <button className={`${styles.menuItem} ${styles.menuLogout}`} onClick={() => { logout(); setShowMenu(false) }}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}