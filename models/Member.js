const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  family_id: String, // reference
  name: String,
  age: Number,
  occupation: String,
  mobile_no: String,
}, { timestamps: true });

module.exports = mongoose.model("Member", memberSchema);