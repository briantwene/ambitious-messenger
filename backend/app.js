const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./logger");
const cors = require("cors");

const { isOperationalError } = require("./lib/error/errorHandler");

const auth = require("./domains/auth/auth.api");
const messageRouter = require('./domains/message/message.api');
const userProfileRouter = require('./domains/user/user.api');

const port = 4202;

const app = express();

// TODO - this is temporary, just so the frontend can make requests to the server
app.use(cors({ origin: "http://localhost:5173" }));
app.use(bodyParser.json());
app.use("/auth", auth);
app.use("/messages",messageRouter);
app.use("/users",userProfileRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the backend of Ambitious Messenger 😎");
});


// if fatal error allow backend to exit gracefully
// process.on("uncaughtException", (error) => {
//   logger.fatal(error);

//   if (!isOperationalError(error)) {
//     process.exit(1);
//   }
// });

app.listen(port, (err) => {
  if (err) {
    console.error(error);
  }
  console.log(`server is running 🏃💨 @ port ${port}`);
});
