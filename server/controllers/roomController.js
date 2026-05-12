const Room = require("../models/Room");

exports.createRoom = async (req, res) => {

  try {

    const { name } = req.body;

    const room = await Room.create({
      name,
    });

    res.json(room);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getRooms = async (req, res) => {

  try {

    const rooms = await Room.findAll();

    res.json(rooms);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};