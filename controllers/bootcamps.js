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
