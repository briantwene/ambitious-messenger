const cookie = require("cookie");

const socketIO = require("socket.io");
const { createMessage, updateMessage } = require("../message/message.service");
const { deleteMessage } = require("../message/message.service");
const cookieParser = require("cookie-parser");
const config = require("../../config");
const socketWrapper = require("../../middleware/socketWrapper");
const { verifyToken } = require("../auth/jwt");

const initializeSocket = (server) => {
  const onlineUsers = {};
  const io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  //middleware for authentication
  io.use(socketWrapper(cookieParser(config.jwt.secret)));

  io.use(async (socket, next) => {
    try {
      const token = socket.request.signedCookies.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = await verifyToken(token);
      onlineUsers[decoded.payload.username] = socket.id;
      console.log("onlineUsers", onlineUsers);

      socket.user = decoded.payload.username;
      console.log("socket.user", socket.user);
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // --- Connection Events ---
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      delete onlineUsers[socket.id];
    });

    // --- Message Events ---
    socket.on("message-send", async (message) => {
      const { from, message_text, sent, chat_id, to } = message;
      console.log("Received message:", message);
      const date = new Date().toISOString();
      const saveMessage = await createMessage(from, message_text, date, chat_id);
      //send users in the to variable an array
      for (const user of to) {
        const toSocketId = onlineUsers[user];
        console.log("toSocketId", toSocketId);
        if (!toSocketId) {
          console.log("User is not online:", user);
        }
        io.to(toSocketId).emit("message-received", saveMessage);
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

    // --- Call Events ---
    socket.on("call-request-send", ({ to, offer }) => {
      console.log("call-request-send", offer);
      io.to(onlineUsers[to]).emit("call-request-recv", { from: socket.user, offer });
    });

    socket.on("call-request-accepted", ({ to, answer }) => {
      console.log("call-request-accepted", answer);
      io.to(onlineUsers[to]).emit("call-request-accepted", { from: socket.user, answer });
    });

    socket.on("call-negotiation-needed", ({ to, offer }) => {
      console.log("call-negotiation-needed", offer);
      io.to(onlineUsers[to]).emit("call-negotiation-needed", { from: socket.user, offer });
    });

    socket.on("call-negotiation-final", ({ to, ans }) => {
      console.log("call-negotiation-final", ans);
      io.to(onlineUsers[to]).emit("call-negotiation-done", { from: socket.user, ans });
    });

    socket.on("send-ice-candidate", ({ to, candidate }) => {
      console.log("send-ice-candidate", candidate);
      io.to(onlineUsers[to]).emit("new-ice-candidate", { from: socket.user, candidate });
    });
  });

  return io;
};

module.exports = initializeSocket;
