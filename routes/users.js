const express = require("express"),
  router = express.Router({ mergeParams: true });
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const User = require("../models/User");

//middlewares
const advancedFiltering = require("../middleware/advancedFiltering");
const { protect, authRoles } = require("../middleware/auth");

router.use(protect);
router.use(authRoles("admin"));

router
  .route("/")

  //Fetch all users
  //GET /api/v1/users
  .get(advancedFiltering(User), getUsers)

  //Create user
  //POST /api/v1/users
  .post(createUser);

router
  .route("/:id")

  //Fetch single user
  //GET /api/v1/users/:id
  .get(getUser)

  //Update a user
  //PUT /api/v1/users/:id
  .put(updateUser)

  //Delete a user
  //DELETE /api/v1/users/:id
  .delete(deleteUser);

module.exports = router;
