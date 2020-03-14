const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    Reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String },
    created: { type: Date, default: Date.now },
  },
);

const Review = mongoose.model('Comments', reviewSchema);

module.exports = Review;
