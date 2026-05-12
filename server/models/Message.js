const { DataTypes } = require('sequelize')

const {
  sequelize,
} = require('../config/db')

const Message = sequelize.define(
  'Message',
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    time: {
      type: DataTypes.STRING,
    },
  }
)

module.exports = Message