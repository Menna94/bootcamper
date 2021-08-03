const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

//@desc     Register User
//@route    POST /api/v1/auth/register
//@access   public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });
  //Create Token
  const token = user.getSignedJwtToken();

  if (!user) {
    return next(new ErrorResponse("Error In Registering the User!", 400));
  }

  res.status(201).send({
    success: true,
    msg: "User Registered SUCCESSFULLY~",
    token,
    data: user,
  });
});

//@desc     Login User
//@route    POST /api/v1/auth/login
//@access   public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an EMail & Password!", 400));
  }

  //Check if the user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new ErrorResponse(
        "Invalid Credentials, Please provide the Right Email & Password!",
        401
      )
    );
  }

  //Check if the password matches the one in the DB
  const matchedPass = await user.matchPass(password);
  if (!matchedPass) {
    return next(
      new ErrorResponse(
        "Invalid Credentials, the Provided Password Doesn't Match the One you've registered with!",
        401
      )
    );
  }

  sendTokenResponse(user, 200, res);
});

//@desc     Get Current Loggedin User
//@route    GET /api/v1/auth/user
//@access   private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).send({
    success: true,
    data: user,
  });
});

//@desc     Logout / clear cookie
//@route    GET /api/v1/auth/logout
//@access   private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).send({
    success: true,
    msg: "User LoggedOut",
    data: {},
  });
});

//@desc     Forgot Password
//@route    POST /api/v1/auth/forgotpassword
//@access   public
exports.forgotPass = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There's No User with That email!", 404));
  }

  //Get Reset Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //Create reset Url
  const resetUrl = `
  ${req.protocol}://
  ${req.get("host")}/
  api/v1/resetpassword/${resetToken}`;

  const message = `You are getting this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Token",
      message,
    });
    res.status(200).send({
      success: true,
      data: "Email Was Sent",
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email Cannot Be Sent!", 500));
  }

  res.status(200).send({
    success: true,
    data: user,
  });
});

//Function to send a cookie with the token in it
/*
    1- Get token from model 
    2- create cookie 
    3- send response
*/
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //to be accessible from the client-side only
  };

  //set the secure option to true only when the app is in the production environment
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .send({ success: true, token });
};
