const mongoose = require("mongoose");

const CompanySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    contractLength: {
      type: Number,
      default: 12 // default contract length in months
    },
    employeeCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Company", CompanySchema);