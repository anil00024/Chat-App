const sequelize = require("../config/db");

const User = require("./User");
const Room = require("./Room");
const Message = require("./Message");
const Conversation = require("./Conversation");

sequelize.sync({ alter: true })
.then(() => {
  console.log("All models synced");
});

module.exports = {
  User,
  Room,
  Message,
  Conversation,
};