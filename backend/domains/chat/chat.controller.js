const { logError } = require("../../lib/error/errorHandler");
const chatService = require("./chat.service");

const createChat = async (req, res, next) => {
  try {
    // TODO will decide weather to create private or group chats based on
    // TODO add make this a protected route to get the user requesting this
    const { members } = req.body;
    const { user } = req;

    //run the room creation service function

    const chat = await chatService.createChat(members, user.username);

    res.status(200).send(chat);
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { chatId, username } = req.body;

    const member = await chatService.addMember(chatId, username);
  } catch (error) {
    next(error);
  }
};

const getUserChats = async (req, res, next) => {
  try {
    const { username } = req.user;


    const chats = await chatService.getChats(username);


    res.status(200).send(chats);
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  let { memberId } = req.params;

  try {
    memberId = parseInt(memberId, 10);

    const deletedMember = await chatService.deleteMember(memberId);

    if (!deletedMember) {
      res.status(400).send({ error: "error - member not deleted" });
    }

    res.status(200).send({ message: "member deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChat,
  addMember,
  getUserChats,
  removeMember,
};
