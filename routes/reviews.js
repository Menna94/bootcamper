const express = require("express"),
  router = express.Router({ mergeParams: true });
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  delReview,
} = require("../controllers/reviews");
const Review = require("../models/Review");

const advancedFiltering = require("../middleware/advancedFiltering");
const { protect, authRoles } = require("../middleware/auth");

router
  .route("/")
  //Fetch Reviews
  //GET /api/v1/reviews
  .get(
    advancedFiltering(Review, { path: "bootcamp", select: "name description" }),
    getReviews
  );

router
  .route("/:id")
  //Fetch Single Review
  //GET /api/v1/reviews/:id
  .get(getReview)
  //Update Review
  //PUT /api/v1/reviews/:id
  .put(protect, authRoles("user", "admin"), updateReview)
  //Delete Review
  //DELETE /api/v1/reviews/:id
  .delete(protect, authRoles("user", "admin"), delReview);

module.exports = router;
