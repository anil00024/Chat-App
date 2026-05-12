import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'

function RoutesComponent() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/chat"
          element={<ChatPage />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default RoutesComponent