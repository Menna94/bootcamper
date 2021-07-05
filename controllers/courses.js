const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

//@desc     Fetch all courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   public
exports.getCourses = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.bootcampId;

  if (bootcampId) {
    const courses = await Course.find({ bootcamp: bootcampId });
    if (courses) {
      return res.status(200).send({
        success: true,
        count: courses.length,
        data: courses,
      });
    }
    res.status(404).send({
      success: false,
      messgae: "Couldn't Fetch Courses!",
      data: null,
    });
  } else {
    return res.status(200).send(res.advancedFiltering);
  }
});

//@desc     Fetch single course
//@route    GET /api/v1/courses/:id
//@access   public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const course = await Course.findById(id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`No Course With the Provided ID: ${id}`, 404)
    );
  }
  return res.status(200).send({
    success: true,
    messgae: "Course Fetched Successfully",
    data: course,
  });
});

//@desc     Create course
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   private
exports.addCourse = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.bootcampId;
  //assign the ID in the params to the bootcamp field in the body
  req.body.bootcamp = bootcampId;

  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`There is No Bootcamp With the Provided ID: ${id}`, 404)
    );
  }

  const course = await Course.create(req.body);

  return res.status(200).send({
    success: true,
    messgae: "Course Created Successfully",
    data: course,
  });
});

//@desc     Update course
//@route    PUT /api/v1/courses/:id
//@access   private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const course = await Course.findById(id);

  if (!course) {
    return next(
      new ErrorResponse(`There is No Course With the Provided ID: ${id}`, 404)
    );
  }

  const updatedCourse = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).send({
    success: true,
    messgae: "Course Updated Successfully",
    data: updatedCourse,
  });
});

//@desc     Delete course
//@route    DELETE /api/v1/courses/:id
//@access   private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const course = await Course.findById(id);

  if (!course) {
    return next(
      new ErrorResponse(`There is No Course With the Provided ID: ${id}`, 404)
    );
  }

  await course.remove();

  return res.status(200).send({
    success: true,
    messgae: "Course Deleted Successfully",
    data: await Course.find(),
  });
});
