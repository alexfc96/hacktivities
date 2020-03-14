const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    hacktivityId: { type: Schema.Types.ObjectId, ref: 'Hacktivity' },
    //nose que mas poner la verdad
  });

const Booking = mongoose.model('City', bookingSchema);

module.exports = Booking;