const { Sequelize } = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',

  storage: './database.sqlite',

  logging: false,
})

const initDb = async () => {

  try {

    await sequelize.authenticate()

    console.log(
      '✅ SQLite Connected Successfully'
    )

    // CREATE TABLES
    await sequelize.sync({
      alter: true,
    })

    console.log(
      '✅ Database Synced'
    )

  } catch (error) {

    console.log(
      '❌ Database Error'
    )

    console.log(error)
  }
}

module.exports = {
  sequelize,
  initDb,
}