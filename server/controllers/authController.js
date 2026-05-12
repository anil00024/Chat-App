const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const User = require('../models/User')

// ================= TOKEN =================

const generateToken = (id) => {

  return jwt.sign(

    { id },

    process.env.JWT_SECRET,

    {
      expiresIn: '7d',
    }
  )
}

// ================= REGISTER =================

const register = async (req, res) => {

  try {

    const {
      username,
      email,
      password,
    } = req.body

    // VALIDATION

    if (
      !username ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        message:
          'All fields required',
      })
    }

    // CHECK EMAIL

    const existingEmail =
      await User.findOne({
        where: { email },
      })

    if (existingEmail) {

      return res.status(400).json({
        message:
          'Email already exists',
      })
    }

    // CHECK USERNAME

    const existingUsername =
      await User.findOne({
        where: { username },
      })

    if (existingUsername) {

      return res.status(400).json({
        message:
          'Username already exists',
      })
    }

    // HASH PASSWORD

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      )

    // CREATE USER

    const user =
      await User.create({
        username,
        email,
        password:
          hashedPassword,
      })

    // RESPONSE

    res.status(201).json({

      success: true,

      message:
        'Registration successful',

      token: generateToken(
        user.id
      ),

      user: {
        id: user.id,
        username:
          user.username,
        email: user.email,
      },
    })

  } catch (error) {

    console.log(
      'REGISTER ERROR:',
      error
    )

    res.status(500).json({

      success: false,

      message:
        'Registration failed',
    })
  }
}

// ================= LOGIN =================

const login = async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body

    // FIND USER

    const user =
      await User.findOne({
        where: { email },
      })

    if (!user) {

      return res.status(400).json({
        message:
          'Invalid credentials',
      })
    }

    // CHECK PASSWORD

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!isMatch) {

      return res.status(400).json({
        message:
          'Invalid credentials',
      })
    }

    // RESPONSE

    res.status(200).json({

      success: true,

      message:
        'Login successful',

      token: generateToken(
        user.id
      ),

      user: {
        id: user.id,
        username:
          user.username,
        email: user.email,
      },
    })

  } catch (error) {

    console.log(
      'LOGIN ERROR:',
      error
    )

    res.status(500).json({

      success: false,

      message:
        'Login failed',
    })
  }
}

module.exports = {
  register,
  login,
}