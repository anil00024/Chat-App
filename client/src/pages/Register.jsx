import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import API from '../api/axios'

function Register() {

  const navigate = useNavigate()

  const [username, setUsername] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const registerUser = async () => {

    try {

      await API.post(
        '/auth/register',
        {
          username,
          email,
          password,
        }
      )

      alert('Registered Successfully')

      navigate('/')

    } catch (error) {

      alert(
        error.response?.data?.message ||
        'Registration failed'
      )
    }
  }

  return (

    <div className="auth-page">

      <div className="auth-box">

        <h1>Register</h1>

        <input
          type="text"
          placeholder="Username"
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />

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
          onClick={registerUser}
        >
          Register
        </button>

        <Link to="/">
          Already have account?
        </Link>

      </div>
    </div>
  )
}

export default Register