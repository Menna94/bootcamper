const User = require("../models/User");
const express = require("express");
const router = express.Router();
const { register } = require("../controllers/auth");

//Register User
//POST /api/v1/auth/register
router.post("/register", register);

module.exports = router;
