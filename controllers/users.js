const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

//@desc     Fetch All Users
//@route    GET /api/v1/users
//@access   private/@admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    res.status(200).send(res.advancedFiltering());
  } catch (error) {
    return next(new ErrorResponse("Error In Fetching Users!", 500));
  }
});

//@desc     Fetch Single User
//@route    GET /api/v1/users/:id
//@access   private/@admin
exports.getUser = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorResponse("Error In Fetching User!", 400));
    }
    res.status(200).send({
      success: true,
      message: "User Fetched Successfully!",
      data: user,
    });
  } catch (error) {
    return next(new ErrorResponse("Error In Fetching User!", 500));
  }
});

//@desc     Create User
//@route    POST /api/v1/users/
//@access   private/@admin
exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    const { name, email, role, password } = req.body;

    const user = await User.create({ name, email, role, password });

    if (!user) {
      return next(new ErrorResponse("Error In Creating User!", 400));
    }
    res.status(201).send({
      success: true,
      message: "User Created Successfully!",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse("Error In Creating User!", 500));
  }
});

//@desc     Update User
//@route    PUT /api/v1/users/:id
//@access   private/@admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new ErrorResponse("Error In Updating User!", 400));
    }
    res.status(200).send({
      success: true,
      message: "User Updated Successfully!",
      data: user,
    });
  } catch (error) {
    return next(new ErrorResponse("Error In Updating User!", 500));
  }
});

//@desc     Delete User
//@route    DELETE /api/v1/users/:id
//@access   private/@admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new ErrorResponse("Ooops! Error In Deleting User!", 400));
    }

    res.status(200).send({
      success: true,
      message: "User Deleted Successfully!",
      count: await User.countDocuments(),
      data: await User.find(),
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse("Error In Deleting User!", 500));
  }
});
