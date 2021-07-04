const fs = require("fs"),
  mongoose = require("mongoose"),
  colors = require("colors"),
  dotenv = require("dotenv");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Load models
const Bootcamp = require("./models/Bootcamp");
const Course = require("./models/Course");

//Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

//Read json files
//bootcamps.json
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
//courses.json
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

//Import into DB
const importData = async () => {
  try {
    //bootcamps
    await Bootcamp.create(bootcamps);

    //courses
    await Course.create(courses);

    console.log("Data Imported....".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Delete Data
const destroyData = async () => {
  try {
    //bootcamps
    await Bootcamp.deleteMany();

    //courses
    await Course.deleteMany();

    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
