import { io } from 'socket.io-client'

const socket = io(
  'https://chat-app-3gt3.onrender.com'
)

export default socket