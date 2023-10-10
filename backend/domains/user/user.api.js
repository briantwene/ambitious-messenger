const express = require('express');
const router = express.Router();
//import user_controller
const userController = require('./user.controller');

//define Router for getting userProfile with ID
router.get('/id', userController.getUserProfile);

module.exports = router;
