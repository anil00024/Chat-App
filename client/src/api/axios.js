import axios from 'axios'

const API = axios.create({
  baseURL:
    'https://chat-app-3gt3.onrender.com',
})

export default API