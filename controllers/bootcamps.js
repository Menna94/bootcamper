const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");

//@desc     Fetch all bootcamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getAllBootcamps = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };

  //Fields to execlude
  const removedFields = ["select", "sort", "page", "limit"];

  //Loop over removedFields and delete them from req.query
  removedFields.forEach((param) => delete reqQuery[param]);

  //Create query string
  let queryStr = JSON.stringify(reqQuery);

  //Create $gt $gte $lt $lte $in ..
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //Finding resource
  let query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //Executing query
  const bootcamps = await query;

  //Pagination Result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  if (bootcamps) {
    return res.status(201).send({
      success: true,
      count: bootcamps.length,
      msg: "All Bootcamps Fetched SUCCESSFULLY~",
      pagination,
      data: bootcamps,
    });
  }
  return res.status(404).send({
    success: false,
    msg: "Couldn't Fetch Bootcamps Fetched!",
    data: null,
  });
});

//@desc     Fetch single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (bootcamp) {
    return res.status(201).send({
      success: true,
      msg: "Bootcamp is Fetched SUCCESSFULLY~",
      data: bootcamp,
    });
  }
  return next(
    new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  );
});

//@desc     Create a new bootcamp
//@route    POST /api/v1/bootcamps/
//@access   private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  if (bootcamp) {
    return res.status(201).send({
      success: true,
      msg: "Create a new Bootcamp!",
      data: bootcamp,
    });
  }
  return res.status(400).send({
    success: false,
    msg: "Can't Create a new Bootcamp!",
    data: null,
  });
});

//@desc     Update a bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const updatedBootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    req.body,
    { runValidators: true }
  );
  if (updatedBootcamp) {
    return res.status(200).send({
      success: true,
      msg: "This Bootcamp Updated SUCCESSFULLY~",
      data: updatedBootcamp,
    });
  }
  return next(
    new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  );
});

//@desc     Delete a bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  const deletedBootcamp = bootcamp.remove();
  if (deletedBootcamp) {
    return res.status(200).send({
      success: true,
      msg: "This Bootcamp was Deleted SUCCESSFULLY~",
      data: await Bootcamp.find(),
    });
  }
  return next(
    new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
  );
});

//@desc     Get bootcamps within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //Get lat, lon from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calc radius using radians
  /*
      Divide Distance/Radius of earth
      earth radius = 3936 mi / 6378 km
  */
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  if (bootcamps) {
    return res.status(200).send({
      success: true,
      message: "Fetched All Near Bootcamps",
      count: bootcamps.length,
      data: bootcamps,
    });
  }
  return res.status(200).send({
    success: false,
    message: "Couldn't Fetched Near Bootcamps",
    count: bootcamps.length,
    data: null,
  });
});
