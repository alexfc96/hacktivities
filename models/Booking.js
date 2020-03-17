const mongoose = require('mongoose');

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    hacktivityId: { type: Schema.Types.ObjectId, ref: 'Hacktivity' },
    // nose que mas poner la verdad
    //comentar la actividad e incluso valorarla con estrellas(object)
  },
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
