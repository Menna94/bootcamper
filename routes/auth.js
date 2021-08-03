const User = require("../models/User");
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUser,
  forgotPass,
  logout,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

//Register User
//POST /api/v1/auth/register
router.post("/register", register);

//Login User
//POST /api/v1/auth/login
router.post("/login", login);

//Logout User
//GET /api/v1/auth/logout
router.get("/logout", logout);

//Get Current Loggedin User
//GET /api/v1/auth/user
router.get("/user", protect, getUser);

//Forgot Password
//POST /api/v1/auth/forgotpassword
router.post("/forgotpassword", forgotPass);

module.exports = router;
