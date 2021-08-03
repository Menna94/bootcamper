const mongoose = require("mongoose");

const ReviewsSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please Add a Title"],
    trim: true,
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please Add some Text"],
  },
  rating: {
    type: Number,
    required: [true, "Please Add a Rating between 1 & 10"],
    min: 1,
    max: 10,
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
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

//Prevent user from submitting more than one review per bootcamp
ReviewsSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//Static method to get average rating and save
ReviewsSchema.statics.getAvgRagting = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      avgRating: obj[0].avgRating,
    });
  } catch (error) {
    console.log(error);
  }
};

//call getAvgRagting after save
ReviewsSchema.post("save", function () {
  this.constructor.getAvgRagting(this.bootcamp);
});

//call getAvgRagting before remove
ReviewsSchema.pre("remove", function () {
  this.constructor.getAvgRagting(this.bootcamp);
});

const Review = new mongoose.model("Review", ReviewsSchema);
module.exports = Review;
