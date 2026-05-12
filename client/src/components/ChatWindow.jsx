import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'


export default function ChatWindow({
  chatInfo, otherUser, messages, loading, hasMore, onLoadMore,
  onEditMessage, onDeleteMessage, currentUser, typingList,
  inputValue, onInputChange, onKeyDown, onSend, sending,
  editingMessage, onCancelEdit, inputRef, messagesEndRef,
  type, onlineUsers
}) {
  const scrollRef = useRef(null)
  const isOtherOnline = otherUser && onlineUsers.includes(otherUser.id)

  const handleScroll = () => {
    if (scrollRef.current?.scrollTop === 0 && hasMore && !loading) {
      onLoadMore()
    }
  }

  const displayName = type === 'room'
    ? `#${chatInfo?.name || 'Loading…'}`
    : otherUser?.username || 'Loading…'

  return (
    <div className={styles.window}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {type === 'room' ? (
            <div className={styles.roomIcon}>#</div>
          ) : (
            <div className={styles.dmIcon}>
              {displayName[0]?.toUpperCase()}
              <span className={`${styles.statusDot} ${isOtherOnline ? styles.online : ''}`} />
            </div>
          )}
          <div>
            <div className={styles.chatName}>{displayName}</div>
            {type === 'room' && chatInfo?.description && (
              <div className={styles.chatDesc}>{chatInfo.description}</div>
            )}
            {type === 'dm' && (
              <div className={styles.chatDesc}>{isOtherOnline ? 'Online' : 'Offline'}</div>
            )}
          </div>
        </div>
        {type === 'room' && (
          <div className={styles.headerRight}>
            <span className={styles.memberCount}>{chatInfo?.member_count || 0} members</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={scrollRef} onScroll={handleScroll}>
        {hasMore && (
          <div className={styles.loadMore}>
            <button className={styles.loadMoreBtn} onClick={onLoadMore}>Load older messages</button>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingMsgs}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`${styles.msgSkeleton} ${i % 3 === 0 ? styles.msgSkeletonRight : ''}`} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              {type === 'room' ? (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M4 4h32v24H20l-8 8v-8H4V4Z" stroke="var(--border-strong)" strokeWidth="2" fill="none"/>
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="16" stroke="var(--border-strong)" strokeWidth="2"/>
                  <path d="M14 18h12M14 23h8" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUser.id || msg.user_id === currentUser.id}
                prevMessage={messages[idx - 1]}
                onEdit={() => onEditMessage(msg)}
                onDelete={() => onDeleteMessage(msg.id)}
                canEdit={msg.sender_id === currentUser.id || msg.user_id === currentUser.id}
                type={type}
              />
            ))}
          </>
        )}

        {typingList.length > 0 && <TypingIndicator users={typingList} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit banner */}
      {editingMessage && (
        <div className={styles.editBanner}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 13L5 9M9 1l4 4-8 8H1V9l8-8Z" stroke="var(--accent-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Editing message</span>
          <button onClick={onCancelEdit} className={styles.cancelEdit}>✕ Cancel</button>
        </div>
      )}

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Message ${displayName}…`}
            rows={1}
            style={{ height: 'auto' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
          />
          <button
            className={`${styles.sendBtn} ${inputValue.trim() ? styles.sendActive : ''}`}
            onClick={onSend}
            disabled={!inputValue.trim() || sending}
          >
            {sending ? (
              <span className={styles.spinner} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 8L2 2l3 6-3 6 12-6Z" fill="currentColor"/>
              </svg>
            )}
          </button>
        </div>
        <div className={styles.inputHint}>
          <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for newline · Use **bold**, *italic*, `code`
        </div>
      </div>
    </div>
  )
}