const mongoose = require('mongoose');

const { Schema } = mongoose;

const hacktivitySchema = new Schema(
  {
    hostId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, min: '2020-01-01', max: '2025-01-01' },
    starthour: { type: String },
    location: { type: Schema.Types.ObjectId, ref: 'City' },
    duration: { type: Number, min: 0 },
    created: { type: Date, default: Date.now },
  },
);

const Hacktivity = mongoose.model('Hacktivity', hacktivitySchema);

module.exports = Hacktivity;
