const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

//@desc     Register User
//@route    POST /api/v1/auth/register
//@access   public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });
  //Create Token
  const token = user.getSignedJwtToken();

  if (user) {
    return res.status(201).send({
      success: true,
      msg: "User Registered SUCCESSFULLY~",
      token,
      data: user,
    });
  }
  res.status(404).send({
    success: false,
    msg: "Error In Registering the User!",
    data: null,
  });
});
