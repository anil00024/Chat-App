import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import API from '../api/axios'

function Login() {

  const navigate = useNavigate()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const loginUser = async () => {

    try {

      const res = await API.post(
        '/auth/login',
        {
          email,
          password,
        }
      )

      localStorage.setItem(
        'token',
        res.data.token
      )

      localStorage.setItem(
        'username',
        res.data.user.username
      )

      navigate('/dashboard')

    } catch (error) {

      alert(
        error.response?.data?.message ||
        'Login failed'
      )
    }
  }

  return (

    <div className="auth-page">

      <div className="auth-box">

        <h1>Login</h1>

        <input
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={loginUser}
        >
          Login
        </button>

        <Link to="/register">
          Create account
        </Link>

      </div>
    </div>
  )
}

export default Login