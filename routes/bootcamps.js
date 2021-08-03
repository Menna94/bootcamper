const express = require("express"),
  router = express.Router();
const {
  getAllBootcamps,
  getBootcamp,
  createBootcamp,
  deleteBootcamp,
  updateBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");
const { getCourses, addCourse } = require("../controllers/courses");
const advancedFiltering = require("../middleware/advancedFiltering");
const Bootcamp = require("../models/Bootcamp");
const { protect, authRoles } = require("../middleware/auth");
//include other resource router
const { getReviews, addReview, getReview } = require("../controllers/reviews");

//Re-route into other resource routers
router.get("/:bootcampId/courses", getCourses);

//
router.post(
  "/:bootcampId/courses",
  protect,
  authRoles("publisher", "admin"),
  addCourse
);

router
  //Get bootcamps by distance
  //GET /api/v1/bootcamps
  .route("/radius/:zipcode/:distance")
  .get(getBootcampsInRadius);

router
  .route("/")
  //Get all bootcamps
  //GET /api/v1/bootcamps
  .get(advancedFiltering(Bootcamp, "courses"), getAllBootcamps)
  //Create a new bootcamp
  //POST /api/v1/bootcamps/
  .post(protect, authRoles("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  //Get single bootcamp
  //GET /api/v1/bootcamps/:id
  .get(getBootcamp)
  //Update a bootcamp
  //PUT /api/v1/bootcamps/:id
  .put(protect, authRoles("publisher", "admin"), updateBootcamp)
  //Delete a bootcamp
  //DELETE /api/v1/bootcamps/:id
  .delete(protect, authRoles("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/photo")
  //Upload photo for a bootcamp
  //PUT /api/v1/bootcamps/:id/photo
  .put(protect, authRoles("publisher", "admin"), bootcampPhotoUpload);

//Reviews Per Bootcamp Api
router
  .route("/:bootcampId/reviews")
  //Fetch Reviews
  //GET /api/v1/bootcamps/:bootcampId/reviews
  .get(getReviews)
  //Add Review
  //POST /api/v1/bootcamps/:bootcampId/reviews
  .post(protect, authRoles("user", "admin"), addReview);

module.exports = router;
