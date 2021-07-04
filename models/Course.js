const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please Add a Course Title!"],
  },
  description: {
    type: String,
    required: [true, "Please Add a Course Description!"],
  },
  weeks: {
    type: Number,
    required: [true, "Please Add The Number of Weeks!"],
  },
  tuition: {
    type: Number,
    required: [true, "Please Add a Tuition Cost!"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please Add a Minimum Skill!"],
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

const Course = mongoose.model("Course", CourseSchema);
module.exports = Course;
