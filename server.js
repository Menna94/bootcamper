const express = require("express"),
  dotenv = require("dotenv"),
  morgan = require("morgan"),
  colors = require("colors"),
  errHandler = require("./middleware/errorHandler");

//configs
dotenv.config({ path: "./config/config.env" });
const app = express();

//body parser
app.use(express.json());

//routers
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

//db
const connectDB = require("./config/db");
connectDB();

//dev logging middleware //only during development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

//error handler
app.use(errHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server Running in ${process.env.NODE_ENV} mode, on Port ${PORT}`.underline
      .bgMagenta
  )
);

//Handeling the unhandled promise rejections globally
process.on("unhandledRejection", (err, promise) => {
  console.log(`ERROR: ${err.message}`.red.bold);
  //close server & exit process
  server.close(() => process.exit(1));
});
