const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const Company = require("../models/Company");

// Get all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find({}).populate("company", "name location");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employee by ID
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("company", "name location");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an employee
router.post("/", async (req, res) => {
  try {
    // Check if company exists
    const company = await Company.findById(req.body.company);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Extract contract length components if provided
    const contractLengthYears = req.body.contractLengthYears || 0;
    const contractLengthMonths = req.body.contractLengthMonths || 0;
    
    // Calculate total months for compatibility
    const totalContractLength = (contractLengthYears * 12) + contractLengthMonths;
    
    // Create employee data with the combined values
    const employeeData = {
      ...req.body,
      contractLength: totalContractLength,
      contractLengthYears: contractLengthYears,
      contractLengthMonths: contractLengthMonths
    };

    const employee = new Employee(employeeData);
    const savedEmployee = await employee.save();
    
    // Update company's employee count
    await Company.findByIdAndUpdate(
      req.body.company,
      { $inc: { employeeCount: 1 } }
    );
    
    res.status(201).json(savedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an employee
router.put("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // If company is being changed, update both old and new company's employee counts
    if (req.body.company && employee.company.toString() !== req.body.company) {
      // Check if new company exists
      const newCompany = await Company.findById(req.body.company);
      if (!newCompany) {
        return res.status(404).json({ message: "New company not found" });
      }
      
      // Decrement old company's employee count
      await Company.findByIdAndUpdate(
        employee.company,
        { $inc: { employeeCount: -1 } }
      );
      
      // Increment new company's employee count
      await Company.findByIdAndUpdate(
        req.body.company,
        { $inc: { employeeCount: 1 } }
      );
    }
    
    // Process contract length updates if provided
    let updateData = { ...req.body };
    
    if (req.body.contractLengthYears !== undefined || req.body.contractLengthMonths !== undefined) {
      // Get current values to use as defaults
      const currentYears = req.body.contractLengthYears !== undefined 
        ? req.body.contractLengthYears 
        : (employee.contractLengthYears || 0);
        
      const currentMonths = req.body.contractLengthMonths !== undefined 
        ? req.body.contractLengthMonths 
        : (employee.contractLengthMonths || 0);
      
      // Calculate new total
      const totalContractLength = (currentYears * 12) + currentMonths;
      
      // Update data with calculated values
      updateData = {
        ...updateData,
        contractLength: totalContractLength,
        contractLengthYears: currentYears,
        contractLengthMonths: currentMonths
      };
    }
    
    // Update employee with processed data
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("company", "name location");
    
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Delete employee
    await Employee.findByIdAndDelete(req.params.id);
    
    // Update company's employee count
    await Company.findByIdAndUpdate(
      employee.company,
      { $inc: { employeeCount: -1 } }
    );
    
    res.json({ message: "Employee removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get employees by company ID
router.get("/company/:companyId", async (req, res) => {
  try {
    const employees = await Employee.find({ company: req.params.companyId }).populate("company", "name location");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;