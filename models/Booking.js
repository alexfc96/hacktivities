const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    hacktivityId: { type: Schema.Types.ObjectId, ref: 'Hacktivity' },
    hostId: { type: Schema.Types.ObjectId, ref: 'User' },
    atendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    review: { type: Schema.Types.ObjectId, ref: 'Review' },
    reservationDate: { type: Date, default: Date.now },
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
