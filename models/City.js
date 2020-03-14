const mongoose = require('mongoose');

const { Schema } = mongoose;

const citySchema = new Schema(
  {
    name: {type: String, required: true, unique: true },
    country: {type: String, required: true},
    image: {type: String}
  }
);

const City = mongoose.model('City', citySchema);

module.exports = City;