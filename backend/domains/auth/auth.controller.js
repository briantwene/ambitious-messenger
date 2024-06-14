const { logError } = require("../../lib/error/errorHandler");
const { registerUser, loginUser } = require("./auth.service");
const { generateToken } = require("./jwt");
const bcrypt = require("bcryptjs");

const login = async (req, res, next) => {
  let { email, password } = req.body;

  try {
    //check if the password is the same
    const user = await loginUser(email, password);

    //then generateToken
    const { token, expires } = generateToken(user);

    // include cookie in response
    // TODO: should we add a maxAge on the cookie, the same as the token expiration? A: No actually had a look into it and we can just clear the cookie of the JWT is expired, but we should still think about how long the JWT itself should last
    res
      .type("json")
      .cookie("token", token, {
        httpOnly: true,
        signed: true,
        // sameSite: "None" // this doesnt work in brave browser unless server is https
      }) // NOTE: in production, set secure: true and sameSite: "None"
      .send({
        user: {
          username: user.username,
          user_id: user.user_id,
        },
        expires,
        isAuthSuccessful: true,
      });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    let { email, username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);
    //check somethings then add the user
    const registeredUser = await registerUser(email, hashedPassword, username);

    // could add a verification step here for later
    const { token, expires } = generateToken(registeredUser);

    res
      .type("json")
      .cookie("token", token, { httpOnly: true, signed: true }) // NOTE: in production, set secure: true
      .send({
        user: {
          username: registeredUser.username,
          user_id: registeredUser.user_id,
        },
        expires,
        isAuthSuccessful: true,
      });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  res.clearCookie("token");

  res.status(200).send();
};

//change Password method
const changePassword = async (req, res, next) => {};

module.exports = { login, logout, register, changePassword };
