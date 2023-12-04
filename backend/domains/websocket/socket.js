const cookie = require("cookie");

const socketIO = require("socket.io");
const { createMessage, updateMessage } = require("../message/message.service");
const { deleteMessage } = require("../message/message.service");

const initializeSocket = (server) => {
  const onlineUsers = {};
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // --- Connection Events ---
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    // --- Authentication Events ---

    // TODO find a way to use middle ware to do proper authentication ASAP
    socket.on("auth", (data) => {
      onlineUsers[data.username] = socket.id;
      console.log("Online users:", onlineUsers);
    });

    // --- Message Events ---
    socket.on("message-send", async (message) => {
      const { from, message_text, sent, chat_id, to } = message;
      console.log("Received message:", message);
      const date = new Date().toISOString();
      const saveMessage = await createMessage(from, message_text, date, chat_id);
      console.log("Message saved:", saveMessage);
      //send users in the to variable an array
      for (const user of to) {
        const toSocketId = onlineUsers[user];
        if (!toSocketId) {
          console.log("User is not online:", user);
          continue;
        }
        socket.to(toSocketId).emit("message-received", saveMessage);
      }
      socket.emit("message-received", saveMessage);
    });

    socket.on("message-delete", async (message) => {
      console.log("Delete message with ID:", message);
      const { id } = message;

      const deletedMessage = await deleteMessage(id);
      for (const user of to) {
        const toSocketId = onlineUsers[user];
        if (!toSocketId) {
          console.log("User is not online:", user);
          continue;
        }
        socket.to(toSocketId).emit("message-deleted", saveMessage);
      }

      socket.emit("message-deleted", deletedMessage);
    });

    socket.on("message-update", async (newMessage) => {
      // Example: Implement logic to update the message
      console.log("Update message:", newMessage);
      const { id, updated_text } = newMessage;
      // Implement your logic to update the message in the database
      const updatedMessage = await updateMessage(id, updated_text);
      for (const user of to) {
        const toSocketId = onlineUsers[user];
        if (!toSocketId) {
          console.log("User is not online:", user);
          continue;
        }
        socket.to(toSocketId).emit("message-updated", updatedMessage);
      }
      socket.emit("message-updated", updatedMessage);
    });

    // --- Friend Request Events ---
    socket.on("invitation", (invitation) => {
      // Example: Implement logic to handle friend invitation
      console.log("Received invitation:", invitation);
      // Implement your logic to process the friend invitation

      // Broadcast the invitation to all connected clients
      io.emit("invitation-received", invitation);
    });

    socket.on("accept", (invitation) => {
      // Example: Implement logic to accept friend request
      console.log("Accepted invitation:", invitation);
      // Implement your logic to accept the friend request

      // Broadcast the acceptance to all connected clients
      io.emit("invitation-accepted", invitation);
    });

    socket.on("decline", (invitation) => {
      // Example: Implement logic to decline friend request
      console.log("Declined invitation:", invitation);
      // Implement your logic to decline the friend request

      // Broadcast the decline to all connected clients
      io.emit("invitation-declined", invitation);
    });
  });

  return io;
};

module.exports = initializeSocket;