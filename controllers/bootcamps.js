const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const Bootcamp = require("../models/Bootcamp");
const path = require("path");

//@desc     Fetch all bootcamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getAllBootcamps = asyncHandler(async (req, res, next) => {
  return res.status(404).send(res.advancedFiltering());
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
  //Add user to req.body
  //userId given in the req.body = the loggedin user id
  req.body.user = req.user.id;

  //Check for published bootcamps
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  //if user != admin -> it can publish just one bootcamp .. else it can publish as many as it wishes
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `The User with ID ${req.user.id} has already published one bootcamp!`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  if (!bootcamp) {
    return next(new ErrorResponse(`Error While Creating a new Bootcmp!`, 400));
  }

  res.status(201).send({
    success: true,
    msg: "Create a new Bootcamp!",
    data: bootcamp,
  });
});

//@desc     Update a bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  //Check if the bootcamp exists
  let bootcamp = await Bootcamp.findById(id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
  }

  //Make sure the user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${id} is not Authorized to update this Bootcamp!`,
        401
      )
    );
  }

  //Update
  bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (bootcamp) {
    return res.status(200).send({
      success: true,
      msg: "This Bootcamp Updated SUCCESSFULLY~",
      data: bootcamp,
    });
  }
});

//@desc     Delete a bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  //Check if the bootcamp exists
  let bootcamp = await Bootcamp.findById(id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));
  }

  //Make sure the user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${id} is not Authorized to delete this Bootcamp!`,
        400
      )
    );
  }

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

//@desc     Upoad photo for a bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Make sure the user is the bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${id} is not Authorized to upload a photo for this Bootcamp!`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please Upload a Photo!", 400));
  }
  const file = req.files.file;

  //Image Validation
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please Upload an Image File!", 400));
  }
  //Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please Upload an Image Less Than ${process.env.MAX_FILE_UPLOAD} !`,
        400
      )
    );
  }

  //Create Custom Filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem while uploading the file!`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    return res.status(200).send({
      success: true,
      data: file.name,
    });
  });
});
