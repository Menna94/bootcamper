const express = require("express"),
  dotenv = require("dotenv"),
  morgan = require("morgan"),
  colors = require("colors"),
  errHandler = require("./middleware/errorHandler"),
  path = require("path"),
  fileupload = require("express-fileupload"),
  cookieParser = require("cookie-parser"),
  mongoSanitize = require("express-mongo-sanitize"),
  helmet = require("helmet"),
  xss = require("xss-clean"),
  rateLimit = require("express-rate-limit"),
  hpp = require("hpp"),
  cors = require("cors");

//configs
dotenv.config({ path: "./config/config.env" });
const app = express();

//routers
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

//Set statc folder
app.use(express.static(path.join(__dirname, "assests")));

//body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//file uploading
app.use(fileupload());

//sanitize data -> prevent NoSQL injection
app.use(mongoSanitize());

//set security headers
app.use(helmet());

//prevent cross-site scripting attacks
app.use(xss());

//http request rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10mins
  max: 100, //num of requests
});

app.use(limiter);

//prevent http param pollution
app.use(hpp());

//enable CORS
app.use(cors());

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
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
