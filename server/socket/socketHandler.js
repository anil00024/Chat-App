const {
  saveMessage,
} = require('../controllers/messageController')

// ================= ONLINE USERS =================

let onlineUsers = []

// ================= SOCKET FUNCTION =================

const initSocket = (io) => {

  io.on('connection', (socket) => {

    console.log(
      `🟢 User Connected: ${socket.id}`
    )

    // ================= USER ONLINE =================

    socket.on(
      'user_online',
      (username) => {

        if (
          !onlineUsers.includes(username)
        ) {
          onlineUsers.push(username)
        }

        io.emit(
          'online_users',
          onlineUsers
        )
      }
    )

    // ================= JOIN ROOM =================

    socket.on(
      'join_room',
      (room) => {

        socket.join(room)

        console.log(
          `📦 Joined Room: ${room}`
        )
      }
    )

    // ================= SEND MESSAGE =================

    socket.on(
      'send_message',

      async (data) => {

        try {

          // Save message in DB
          await saveMessage(data)

          // Send message to room
          io.to(data.room).emit(
            'receive_message',
            data
          )

        } catch (error) {

          console.log(error)
        }
      }
    )

    // ================= TYPING =================

    socket.on(
      'typing',
      (data) => {

        socket.to(data.room).emit(
          'show_typing',
          data.username
        )
      }
    )

    // ================= STOP TYPING =================

    socket.on(
      'stop_typing',
      (room) => {

        socket.to(room).emit(
          'hide_typing'
        )
      }
    )

    // ================= DISCONNECT =================

    socket.on(
      'disconnect',
      () => {

        console.log(
          `🔴 User Disconnected: ${socket.id}`
        )

      }
    )
  })
}

// ================= EXPORT =================

module.exports = {
  initSocket,
}