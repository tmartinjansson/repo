const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const Employee = require("../models/Employee");

// Get all companies
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get company by ID
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a company
router.post("/", async (req, res) => {
  try {
    const company = new Company(req.body);
    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a company
router.put("/:id", async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a company
router.delete("/:id", async (req, res) => {
  try {
    // Check if company has employees
    const employeeCount = await Employee.countDocuments({ company: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete company with existing employees. Please reassign or delete employees first." 
      });
    }
    
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;