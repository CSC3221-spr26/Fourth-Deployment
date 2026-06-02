const mongoose = require('mongoose');

const computerSchema = new mongoose.Schema(
  {
    Brand: {
      type: String,
      required: true,
      trim: true
    },
    Model: {
      type: String,
      required: true,
      trim: true
    },
    Memory: {
      type: Number,
      required: true,
      min: 1
    },
    HardDrive: {
      type: Number,
      required: true,
      min: 1
    },
    type: {
      type: String,
      enum: ['laptop', 'desktop'],
      required: true
    },
    processor: {
      type: String,
      enum: ['Intel', 'AMD', 'Mx'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Computer', computerSchema);
