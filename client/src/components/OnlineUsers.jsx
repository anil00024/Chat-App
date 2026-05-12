

export default function OnlineUsers({ members, onlineUsers }) {
  const online = members.filter(m => onlineUsers.includes(m.id))
  const offline = members.filter(m => !onlineUsers.includes(m.id))

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>Members</div>
      <div className={styles.list}>
        {online.length > 0 && (
          <>
            <div className={styles.section}>ONLINE — {online.length}</div>
            {online.map(u => (
              <div key={u.id} className={styles.user}>
                <div className={styles.avatar}>
                  {u.username[0].toUpperCase()}
                  <span className={`${styles.dot} ${styles.online}`} />
                </div>
                <span className={styles.name}>{u.username}</span>
              </div>
            ))}
          </>
        )}
        {offline.length > 0 && (
          <>
            <div className={styles.section}>OFFLINE — {offline.length}</div>
            {offline.map(u => (
              <div key={u.id} className={`${styles.user} ${styles.userOff}`}>
                <div className={styles.avatar}>
                  {u.username[0].toUpperCase()}
                  <span className={styles.dot} />
                </div>
                <span className={styles.name}>{u.username}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  )
}