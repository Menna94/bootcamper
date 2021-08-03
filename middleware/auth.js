const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

//Protect Routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //Set token from Bearer token from header
    token = req.headers.authorization.split(" ")[1];
  }
  // else if (req.cookies.token) { //Set token from cookie
  //   token = req.cookies.token;
  // }

  //check if the token exists
  if (!token) {
    return next(
      new ErrorResponse(
        "SORRY, But You Are Not Authorized to Access this Route!",
        401
      )
    );
  }

  //TOKEN==> {id:xxx, iat:xxx, expiration:xxx}
  try {
    //extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(
      new ErrorResponse(
        "SORRY, But You Are Not Authorized to Access this Route!",
        401
      )
    );
  }
});

//Roles Authorization
exports.authRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is Not Authorized to Complete This Action!`,
          403 //Forbidden Error
        )
      );
    }
    next();
  };
};
