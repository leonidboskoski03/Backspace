const mongoose = require("mongoose");

const residentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    flatNumber: { type: String, required: true, trim: true },
    paymentDate: { type: Date, required: true },
    isDueSoon: { type: Boolean, default: false }, // true when 3 days till payment
  },
  { timestamps: true }
);

// Unique resident per flat
residentSchema.index({ flatNumber: 1 }, { unique: true });

module.exports = mongoose.model("Resident", residentSchema);

