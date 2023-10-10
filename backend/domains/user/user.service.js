//import userData
const userDao = require('./user.dao');

//get userProfile by ID
const getUserProfileById = (userId) => {
  return userDao.getUserProfileById(userId);
};

module.exports = {
  getUserProfileById,
};
