

export default function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null

  const text = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
    ? `${users[0]} and ${users[1]} are typing`
    : `${users[0]} and ${users.length - 1} others are typing`

  return (
    <div className={styles.wrap}>
      <div className={styles.dots}>
        <span /><span /><span />
      </div>
      <span className={styles.text}>{text}</span>
    </div>
  )
}