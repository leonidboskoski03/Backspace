const mongoose = require("mongoose");

const supporterSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, unique: true, lowercase: true },
    password:  { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supporter", supporterSchema);

