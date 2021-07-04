const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  console.log(err.name);
  let error = { ...err };
  error.message = err.message;

  //handling invalid mongoose ObjectId
  if (err.name === "CastError") {
    const message = `Resource is not found with the provided ID: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongoose Duplicate Key
  if (err.code === 11000) {
    const message = "Duplicate field value";
    error = new ErrorResponse(message, 400);
  }

  //Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.messgae);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).send({
    success: false,
    data: error.message,
  });
};

module.exports = errorHandler;
