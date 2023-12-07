const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get user ID by username
const getUserIdByUsername = async (username) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { user_id: true },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user.user_id;
};

// Check if friendship limit is exceeded
const isFriendshipLimitExceeded = async (userId) => {
  const friendshipCount = await prisma.friendships.count({
    where: { OR: [{ user_id: userId }, { friend_id: userId }], status: 1 },
  });
  return friendshipCount >= 1000; // Assuming the limit is 1000
};

// Create a friend request
const createFriendRequest = async (senderId, receiverId) => {
  const requestLog = await prisma.friendRequests.create({
    data: { sender_id: senderId, receiver_id: receiverId },
  });
  return requestLog;
};

//getAllFriendRequests status:0 pending
const getAllPendingRequests = async (userId) => {
  const requests = await prisma.friendRequests.findMany({
    where: {
      receiver_id: userId,
      status: 0, // 0: Pending
    },
    select: {
      sender: {
        select: {
          username: true,
        },
      },
      id: true,
      sender_id: true,
      receiver_id: true,
      status: true,
      created_at: true,
    },
  });
  return requests;
};

// Get all friendships for a user
const getAllFriendships = async (userId) => {
  const friendships = await prisma.friendships.findMany({
    where: {
      OR: [{ user_id: userId }, { friend_id: userId }],
      status: 1,
    },
  });
  return friendships;
};

// Accept a friend request
const acceptFriendRequest = async (requestId, user_id, friend_id) => {
  const updatedFriendship = await prisma.friendships.create({
    // where: { id: requestId},?? do need write the 'requestId' to friendship
    data: { user_id: user_id, friend_id: friend_id, status: 1 }, //1: Accepted
  });
  await prisma.friendRequests.update({
    where: { id: requestId },
    data: { status: 1 }, //1: Accepted
  });
  return updatedFriendship;
};

// Decline a friend request
const declineFriendRequest = async (requestId) => {
  await prisma.friendRequests.update({
    where: { id: requestId },
    data: { status: 2 }, //2: Declined
  });
};

//remove/delete a friends
const removeFriendFromDao = async (currentUserId, friendIdToRemove) => {
  await prisma.friendships.deleteMany({
    where: {
      AND: [{ user_id: currentUserId }, { friend_id: friendIdToRemove }],
    },
  });
};

module.exports = {
  getUserIdByUsername,
  isFriendshipLimitExceeded,
  createFriendRequest,
  getAllPendingRequests,
  getAllFriendships,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriendFromDao,
};
