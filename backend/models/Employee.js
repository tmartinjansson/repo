const mongoose = require("mongoose");

const EmployeeSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Employee must be assigned to a company"]
    },
    contractLength: {
      type: Number,
      default: 12 // default contract length in months
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