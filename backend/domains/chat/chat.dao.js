const { PrismaClient } = require("@prisma/client");
const { logError } = require("../../lib/error/errorHandler");
const prisma = new PrismaClient();

// TODO check if user should add a name when creating the room on frontend
const create = async (isPrivate, members) => {
  try {
    const chat = await prisma.chat.create({
      data: {
        is_private: isPrivate,
      },
    });

    return chat;
  } catch (error) {
    logError(error);
  }
};

const add = async (members, chatId) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          in: members,
        },
      },
    });

    await prisma.member.createMany({
      data: users.map(({ username, user_id }) => ({
        username: username,
        chat_id: chatId,
        user_id: user_id,
        joined_date: new Date(),
      })),
    });

    const createdMembers = await prisma.member.findMany({
      where: { chat_id: chatId },
    });

    return createdMembers;
  } catch (error) {
    logError(error);
  }
};

const get = async (username) => {
  try {
    // Retrieve the user's data, including their user_id
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        member: {
          select: {
            chat_id: true, // Select the chat_id to use for retrieving chats
          },
        },
      },
    });

    // Retrieve all chats that the user is a member of
    const chats = await prisma.chat.findMany({
      where: {
        chat_id: {
          in: user.member.map((m) => m.chat_id),
        },
      },
      include: {
        member: true,
        message: {
          take: 1,
          orderBy: {
            sent: "desc",
          },
        }, // Include the member details for each chat
      },
    });



    return chats;
  } catch (error) {
    logError(error);
  }
};

const getExistingPrivate = async (members) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        is_private: true,
        member: {
          every: {
            username: {
              in: members,
            },
          },
        },
      },
    });

    return chats;
  } catch (error) {
    logError(error);
  }
};

const getMember = async (chat_id, username) => {
  try {
    const member = await prisma.member.findFirst({
      where: {
        chat_id,
        username,
      },
    });

    return member;
  } catch (error) {
    logError(error);
  }
};

const getSingle = async (chat_id) => {
  try {
    const chat = prisma.chat.findUnique({
      where: {
        chat_id,
      },
    });

    return chat;
  } catch (error) {
    logError(error);
  }
};

const remove = async (member_id) => {
  try {
    const deletedMember = await prisma.member.delete({
      where: {
        id: member_id,
      },
    });

    return deletedMember;
  } catch (error) {
    logError(error);
  }
};

const findExistingMember = (chat_id, username) => {
  try {
    const member = prisma.member.findFirst({
      where: {
        chat_id,
        username,
      },
    });

    return member;
  } catch (error) {
    logError(error);
  }
};

module.exports = { create, add, get, getSingle, remove, getExistingPrivate, findExistingMember };
