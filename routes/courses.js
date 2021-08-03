const express = require("express"),
  router = express.Router({ mergeParams: true });
const {
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");
const advancedFiltering = require("../middleware/advancedFiltering");
const Course = require("../models/Course");
const { protect, authRoles } = require("../middleware/auth");

router
  .route("/")
  //Fetch all courses
  //GET /api/v1/courses
  .get(
    advancedFiltering(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  );

router
  .route("/:id")
  //Fetch single course
  //GET /api/v1/courses/:id
  .get(getCourse)
  //Update a course
  //PUT /api/v1/courses/:id
  .put(protect, authRoles("publisher", "admin"), updateCourse)
  //Delete a course
  //DELETE /api/v1/courses/:id
  .delete(protect, authRoles("publisher", "admin"), deleteCourse);

module.exports = router;
