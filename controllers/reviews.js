const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const Review = require("../models/Review");

//@desc     Fetch Reviews
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampId/reviews
//@access   public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).send({
      success: true,
      count: reviews.length,
      data: reviews,
      msg: "Fetched from bootcamp",
    });
  } else {
    return res.status(200).send(res.advancedFiltering);
  }
});

//@desc     Fetch Single Review
//@route    GET /api/v1/reviews/:id
//@access   public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with ID of ${req.params.id}`, 404)
    );
  }

  res.status(200).send({
    success: true,
    message: "review fetched successfully",
    data: review,
  });
});

//@desc     Add a Review
//@route    POST /api/v1/bootcamps/:bootcampId/reviews
//@access   private
exports.addReview = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.bootcampId;
  const user = req.user.id;
  req.body.bootcamp = bootcampId;
  req.body.user = user;

  const bootcamp = await Bootcamp.findById(bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No Bootcamp found with the given ID of ${bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).send({
    success: true,
    message: "review created successfully",
    data: review,
  });
});

//@desc     Update a Review
//@route    PUT /api/v1/reviews/:id
//@access   private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.id;
  let review = await Review.findById(reviewId);

  if (!review) {
    return next(
      new ErrorResponse(`No Review found with the given ID of ${reviewId}`, 404)
    );
  }

  //make sure review belongs to user or the user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not Authorized to Update Review`, 401));
  }

  review = await Review.findByIdAndUpdate(reviewId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new ErrorResponse(`Error in Updating Review`, 400));
  }

  res.status(200).send({
    success: true,
    message: "review updated successfully",
    data: review,
  });
});

//@desc     Delete a Review
//@route    DELETE /api/v1/reviews/:id
//@access   private
exports.delReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.id;
  let review = await Review.findById(reviewId);

  if (!review) {
    return next(
      new ErrorResponse(`No Review found with the given ID of ${reviewId}`, 404)
    );
  }

  //make sure review belongs to user or the user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not Authorized to Update Review`, 401));
  }

  review = await review.remove();

  if (!review) {
    return next(new ErrorResponse(`Error in Deleting Review`, 400));
  }

  res.status(200).send({
    success: true,
    message: "review deleted successfully",
    data: await Review.find(),
  });
});
