import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import socket from '../services/socket'

import './ChatPage.css'

function ChatPage() {

  const navigate = useNavigate()

  const [message, setMessage] =
    useState('')

  const [messages, setMessages] =
    useState([])

  const [typing, setTyping] =
    useState('')

  const [onlineUsers, setOnlineUsers] =
    useState([])

  const messagesEndRef =
    useRef(null)

  const username =
    localStorage.getItem(
      'username'
    ) || 'Guest'

  const room = 'general'

  // ================= AUTO SCROLL =================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })

  }, [messages])

  // ================= PROTECTED ROUTE =================

  useEffect(() => {

    const token =
      localStorage.getItem(
        'token'
      )

    if (!token) {

      navigate('/')
    }

  }, [navigate])

  // ================= SOCKET EVENTS =================

  useEffect(() => {

    // USER ONLINE

    socket.emit(
      'user_online',
      username
    )

    // JOIN ROOM

    socket.emit(
      'join_room',
      room
    )

    // RECEIVE MESSAGE

    socket.on(
      'receive_message',
      (data) => {

        setMessages((prev) => [
          ...prev,
          data,
        ])
      }
    )

    // SHOW TYPING

    socket.on(
      'show_typing',
      (name) => {

        if (name !== username) {

          setTyping(
            `${name} is typing...`
          )
        }
      }
    )

    // HIDE TYPING

    socket.on(
      'hide_typing',
      () => {

        setTyping('')
      }
    )

    // ONLINE USERS

    socket.on(
      'online_users',
      (users) => {

        setOnlineUsers(users)
      }
    )

    return () => {

      socket.off(
        'receive_message'
      )

      socket.off(
        'show_typing'
      )

      socket.off(
        'hide_typing'
      )

      socket.off(
        'online_users'
      )
    }

  }, [username])

  // ================= SEND MESSAGE =================

  const sendMessage = () => {

    if (!message.trim()) return

    const data = {

      room,

      message,

      sender: username,

      time:
        new Date().toLocaleTimeString(),
    }

    socket.emit(
      'send_message',
      data
    )

    setMessage('')

    socket.emit(
      'stop_typing',
      room
    )
  }

  // ================= ENTER KEY =================

  const handleKeyDown = (e) => {

    if (e.key === 'Enter') {

      sendMessage()
    }
  }

  // ================= LOGOUT =================

  const handleLogout = () => {

    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'username'
    )

    navigate('/')
  }

  return (

    <div className="chat-layout">

      {/* SIDEBAR */}

      <div className="sidebar">

        <div>

          <h2>Rooms</h2>

          <div className="room active-room">
            # General
          </div>

          <div className="online-section">

            <h3>
              Online Users
            </h3>

            {onlineUsers.map(
              (
                user,
                index
              ) => (

                <div
                  className="online-user"
                  key={index}
                >
                  🟢 {user}
                </div>
              )
            )}
          </div>
        </div>

        {/* LOGOUT */}

        <button
          className="logout-btn"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>

      </div>

      {/* CHAT WINDOW */}

      <div className="chat-window">

        {/* HEADER */}

        <div className="chat-header">

          <div>
            General Chat
          </div>

          <div className="user-badge">
            {username}
          </div>

        </div>

        {/* MESSAGES */}

        <div className="messages">

          {messages.length ===
          0 ? (

            <div className="empty-chat">
              Start chatting 🚀
            </div>

          ) : (

            messages.map(
              (
                msg,
                index
              ) => (

                <div
                  key={index}
                  className={
                    msg.sender ===
                    username
                      ? 'my-message'
                      : 'other-message'
                  }
                >

                  <strong>
                    {
                      msg.sender
                    }
                  </strong>

                  <p>
                    {
                      msg.message
                    }
                  </p>

                  <span className="message-time">
                    {
                      msg.time
                    }
                  </span>

                </div>
              )
            )
          )}

          <div
            ref={
              messagesEndRef
            }
          ></div>

        </div>

        {/* TYPING */}

        <div className="typing">
          {typing}
        </div>

        {/* INPUT */}

        <div className="message-input">

          <input
            type="text"
            placeholder="Type message..."
            value={message}
            onChange={(e) => {

              setMessage(
                e.target.value
              )

              socket.emit(
                'typing',
                {
                  room,
                  username,
                }
              )
            }}
            onKeyDown={
              handleKeyDown
            }
          />

          <button
            onClick={
              sendMessage
            }
          >
            Send
          </button>

        </div>
      </div>
    </div>
  )
}

export default ChatPage