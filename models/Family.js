const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  head_name: String,
  address: String,
  mobile_no: { type: String, unique: true },
  total_members: Number,
}, { timestamps: true });

module.exports = mongoose.model("Family", familySchema);