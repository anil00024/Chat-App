const Message = require("../models/Message");

exports.saveMessage = async (data) => {

  try {

    await Message.create({
      content: data.message,
      sender: data.sender,
      room: data.room,
    });

  } catch (error) {
    console.log(error.message);
  }
};

exports.getMessages = async (req, res) => {

  try {

    const { room } = req.params;

    const messages = await Message.findAll({
      where: { room },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};