import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format, isToday, isYesterday } from 'date-fns'


const formatTime = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return `Yesterday ${format(d, 'HH:mm')}`
  return format(d, 'MMM d, HH:mm')
}

const renderMentions = (content) => {
  if (!content) return content
  return content.replace(/@(\w+)/g, '**@$1**')
}

export default function MessageBubble({ message, isOwn, prevMessage, onEdit, onDelete, canEdit, type }) {
  const [showActions, setShowActions] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isSameAuthor = prevMessage &&
    (prevMessage.sender_id === message.sender_id || prevMessage.user_id === message.user_id) &&
    new Date(message.created_at) - new Date(prevMessage.created_at) < 5 * 60 * 1000

  const senderName = message.sender?.username || message.username || 'Unknown'
  const isDeleted = message.deleted

  const readByOthers = type === 'dm' && message.read_by?.length > 0 && isOwn

  const handleDelete = () => {
    if (confirmDelete) { onDelete(); setConfirmDelete(false) }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000) }
  }

  return (
    <div
      className={`${styles.wrapper} ${isOwn ? styles.own : ''} ${isSameAuthor ? styles.grouped : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setConfirmDelete(false) }}
    >
      {!isSameAuthor && !isOwn && (
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>{senderName[0]?.toUpperCase()}</div>
        </div>
      )}
      {isSameAuthor && !isOwn && <div className={styles.avatarSpacer} />}

      <div className={styles.content}>
        {!isSameAuthor && !isOwn && (
          <div className={styles.meta}>
            <span className={styles.sender}>{senderName}</span>
            <span className={styles.time}>{formatTime(message.created_at)}</span>
          </div>
        )}

        <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
          {isDeleted ? (
            <span className={styles.deletedText}>This message was deleted</span>
          ) : (
            <div className={styles.mdContent}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className={styles.mdP}>{children}</p>,
                  code: ({ inline, children }) => inline
                    ? <code className={styles.inlineCode}>{children}</code>
                    : <pre className={styles.codeBlock}><code>{children}</code></pre>,
                  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener" className={styles.link}>{children}</a>,
                }}
              >
                {renderMentions(message.content)}
              </ReactMarkdown>
            </div>
          )}

          {isOwn && !isDeleted && (
            <div className={styles.ownMeta}>
              {message.edited && <span className={styles.edited}>(edited)</span>}
              <span className={styles.ownTime}>{formatTime(message.created_at)}</span>
              {readByOthers && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" title="Read">
                  <path d="M1 7l3 3 9-6M5 10l2 2" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          )}
        </div>

        {!isOwn && !isDeleted && isSameAuthor && (
          <span className={styles.groupedTime}>{formatTime(message.created_at)}</span>
        )}
      </div>

      {/* Actions */}
      {!isDeleted && showActions && canEdit && (
        <div className={`${styles.actions} ${isOwn ? styles.actionsLeft : styles.actionsRight}`}>
          <button className={styles.actionBtn} onClick={onEdit} title="Edit">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 12L4.5 8.5M8.5 1l3 3-7 7H1.5v-3l7-7Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className={`${styles.actionBtn} ${confirmDelete ? styles.actionDanger : ''}`}
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 3h9M5 3V1.5h3V3M4 3l.5 8h4L9 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}