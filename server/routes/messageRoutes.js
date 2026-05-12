const router = require("express").Router();

const {
  getMessages,
} = require("../controllers/messageController");

router.get("/:room", getMessages);

module.exports = router;