const express = require("express"),
  router = express.Router();
const {
  getAllBootcamps,
  getBootcamp,
  createBootcamp,
  deleteBootcamp,
  updateBootcamp,
  getBootcampsInRadius,
} = require("../controllers/bootcamps");
const { getCourses, addCourse } = require("../controllers/courses");

//Re-route into other resource routers
router.get("/:bootcampId/courses", getCourses);
router.post("/:bootcampId/courses", addCourse);

router
  //Get bootcamps by distance
  //GET /api/v1/bootcamps
  .route("/radius/:zipcode/:distance")
  .get(getBootcampsInRadius);

router
  .route("/")
  //Get all bootcamps
  //GET /api/v1/bootcamps
  .get(getAllBootcamps)
  //Create a new bootcamp
  //POST /api/v1/bootcamps/
  .post(createBootcamp);

router
  .route("/:id")
  //Get single bootcamp
  //GET /api/v1/bootcamps/:id
  .get(getBootcamp)
  //Update a bootcamp
  //PUT /api/v1/bootcamps/:id
  .put(updateBootcamp)
  //Delete a bootcamp
  //DELETE /api/v1/bootcamps/:id
  .delete(deleteBootcamp);

module.exports = router;
