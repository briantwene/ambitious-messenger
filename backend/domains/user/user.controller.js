//import userService
const userService = require('./user.service');

//handle the GET from ID
const getUserProfile = (req, res) => {
  const userId = req.params.id;
  const userProfile = userService.getUserProfile(userId);

  if (userProfile) {
    res.json(userProfile);
  } else {
    res.status(404).json({ error: "User profile not found!" });
  }
};

module.exports={
    getUserProfile
};
