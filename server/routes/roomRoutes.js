const router = require("express").Router();

const {
  createRoom,
  getRooms,
} = require("../controllers/roomController");

router.post("/create", createRoom);
router.get("/all", getRooms);

module.exports = router;