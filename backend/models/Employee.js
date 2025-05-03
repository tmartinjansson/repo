const mongoose = require("mongoose");

const EmployeeSchema = mongoose.Schema(
  {
    surname: {
      type: String,
      required: [true, "Surname is required"],
      trim: true
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Employee must be assigned to a company"]
    },
    contractLength: {
      type: Number,
      default: 0 // default contract length in months
    },
    contractLengthYears: {
      type: Number,
      default: 0
    },
    contractLengthMonths: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Employee", EmployeeSchema);