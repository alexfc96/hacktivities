const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    hacktivityId: { type: Schema.Types.ObjectId, ref: 'Hacktivity' },
    // nose que mas poner la verdad
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    review: { type: Schema.Types.ObjectId, ref: 'Review' },
    date: { type: Date },
    atendees: { type: Array },
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
