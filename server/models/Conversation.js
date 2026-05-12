const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Conversation = sequelize.define("Conversation", {
  type: {
    type: DataTypes.STRING,
    defaultValue: "room",
  },

  name: {
    type: DataTypes.STRING,
  },
});

module.exports = Conversation;