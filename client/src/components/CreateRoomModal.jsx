import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'


export default function CreateRoomModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', isPrivate: false })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Room name is required')
    if (form.name.length < 2) return toast.error('Name must be at least 2 characters')
    setLoading(true)
    try {
      const { data } = await api.post('/rooms', {
        name: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: form.description.trim(),
        is_private: form.isPrivate,
      })
      toast.success('Room created!')
      onCreate(data.room)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create a Room</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Room Name</label>
            <div className={styles.nameWrap}>
              <span className={styles.namePrefix}>#</span>
              <input
                ref={inputRef}
                className={styles.input}
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="my-awesome-room"
                maxLength={50}
              />
            </div>
            <span className={styles.hint}>Lowercase, hyphens only</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description <span className={styles.optional}>(optional)</span></label>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              name="description"
              value={form.description}
              onChange={handle}
              placeholder="What is this room about?"
              maxLength={200}
              rows={3}
            />
          </div>

          <label className={styles.checkRow}>
            <input type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handle} className={styles.checkbox} />
            <div>
              <div className={styles.checkLabel}>Private Room</div>
              <div className={styles.checkHint}>Only invited members can join</div>
            </div>
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}