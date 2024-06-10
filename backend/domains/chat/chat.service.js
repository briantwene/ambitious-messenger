const { HTTP404Error, HTTP400Error } = require("../../lib/error/customErrors");
const { getUser } = require("../user/user.service");
const {
  create,
  add,
  get,
  getSingle,
  remove,
  findMemberId,
  getExistingPrivate,
  findExistingMember,
} = require("./chat.dao");

const createChat = async (members, user) => {
  try {
    //will first check if room its private
    // TODO implement your own personal chat room for you only

    // since this is a new chat, would want the user to be added as a member in both cases
    const userWithMembers = [user, ...members];

    const isPrivate = userWithMembers.length === 2;

    // check if the members exist
    if (isPrivate) {
      const existingChat = await getExistingPrivate(userWithMembers);
      console.log("existingChat", existingChat);

      if (existingChat.length > 0) {
        throw new HTTP400Error("Chat already exists");
      }
    }

    //then create the chat, get the id
    const newChat = await create(isPrivate);

    // add the members
    const newMembers = await addMember(userWithMembers, newChat.chat_id);

    // modify the chat name based on if...
    let chat_name;

    // the chat is private..
    if (isPrivate) {
      // just get the name of the user other than the user that requested
      chat_name = newMembers.find((member) => member.username != user).username;
    } else {
      // for group chats if there is a name already use that
      if (newChat.chat_name?.trim()) {
        chat_name = newChat.chat_name;
      } else {
        // or make the name a list of the users
        // TODO make sure to format the string if there is more 4 or more members other than user
        chat_name = newMembers.map((member) => member.username).join(",");
      }
    }

    return {
      ...newChat,
      chat_name: chat_name,
      members: newMembers.map((member) => member.username),
    };
  } catch (error) {
    throw error;
  }
};

// TODO will need to make sure that duplicates arent created or could be handled on the frontend
const addMember = async (members, chatId) => {
  try {
    // take the members and add it to a chat
    const newMembers = await add(members, chatId);

    return newMembers;
  } catch (error) {
    throw error;
  }
};

const deleteMember = async (memberId) => {
  // TODO: Add role-level access control for group chats if necessary
  // TODO: Implement handling for 1:1 chats
  // TODO: Decide whether to update the leave time or completely delete the member

  try {
    // Remove the member directly using the provided memberId
    const deletedMember = await remove(memberId);

    if (!deletedMember) {
      throw new HTTP404Error("Member not found or unable to remove.");
    }
    return deletedMember;
  } catch (error) {
    throw error;
  }


};

//get all chats based off username
const getChats = async (username) => {
  try {
    const chats = await get(username);
    if (!chats) throw new HTTP404Error("No chats were found");

    // process the chatroom data that returns
    const formattedChats = chats.map((chat) => {
      // just get the usernames of the people in the room
      const formattedMembers = chat.member.map((member) => member.username);
      const [last_message] = chat.message;
      let chat_name;

      // modify the name based on if...

      // the chat is private..
      if (chat.is_private) {
        // just get the name of the user other than the user that requested
        chat_name = formattedMembers.find((member) => member != username);

        // for group chats if there is a name already use that
      } else if (chat.chat_name?.trim()) {
        chat_name = chat.chat_name;

        // or make the name a list of the users

        // TODO make sure to format the string if there is more 4 or more members other than user
      } else {
        chat_name = formattedMembers.filter((member) => member != username).join(",");
      }

      // return processed data
      return {
        chat_id: chat.chat_id,
        chat_name: chat_name,
        is_private: chat.is_private,
        members: formattedMembers,
        last_message: last_message,
      };
    });
    return formattedChats;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createChat,
  addMember,
  getChats,
  deleteMember,
};
