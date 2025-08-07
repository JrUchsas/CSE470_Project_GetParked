const mongoose = require('mongoose');

const slotSchema = mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Occupied', 'Reserved'],
      default: 'Available',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Slot = mongoose.model('Slot', slotSchema);
module.exports = Slot;