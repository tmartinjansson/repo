// frontend/src/app/utils/api.js

import axios from "axios";

// Debug logs for API configuration
console.log("Environment API URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("Fallback URL:", "http://localhost:5000/api");

// Define the base URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
console.log("Final API URL being used:", API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Company API calls
export const getCompanies = async () => {
  const fullUrl = `${API_URL}/companies`;
  console.log("Attempting to fetch companies from:", fullUrl);
  try {
    const response = await api.get("/companies");
    console.log("Companies response received:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const getCompany = async (id) => {
  const fullUrl = `${API_URL}/companies/${id}`;
  console.log("Attempting to fetch company from:", fullUrl);
  try {
    const response = await api.get(`/companies/${id}`);
    console.log("Company response received:", response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const createCompany = async (companyData) => {
  const fullUrl = `${API_URL}/companies`;
  console.log("Attempting to create company at:", fullUrl);
  console.log("Company data:", companyData);
  try {
    const response = await api.post("/companies", companyData);
    console.log("Create company response:", response);
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const updateCompany = async (id, companyData) => {
  const fullUrl = `${API_URL}/companies/${id}`;
  console.log("Attempting to update company at:", fullUrl);
  console.log("Company data:", companyData);
  try {
    const response = await api.put(`/companies/${id}`, companyData);
    console.log("Update company response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error updating company ${id}:`, error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const deleteCompany = async (id) => {
  const fullUrl = `${API_URL}/companies/${id}`;
  console.log("Attempting to delete company at:", fullUrl);
  try {
    const response = await api.delete(`/companies/${id}`);
    console.log("Delete company response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting company ${id}:`, error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

// Employee API calls
export const getEmployees = async () => {
  const fullUrl = `${API_URL}/employees`;
  console.log("Attempting to fetch employees from:", fullUrl);
  try {
    const response = await api.get("/employees");
    console.log("Employees response received:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const getEmployee = async (id) => {
  const fullUrl = `${API_URL}/employees/${id}`;
  console.log("Attempting to fetch employee from:", fullUrl);
  try {
    const response = await api.get(`/employees/${id}`);
    console.log("Employee response received:", response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  const fullUrl = `${API_URL}/employees`;
  console.log("Attempting to create employee at:", fullUrl);
  console.log("Employee data:", employeeData);
  try {
    const response = await api.post("/employees", employeeData);
    console.log("Create employee response:", response);
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  const fullUrl = `${API_URL}/employees/${id}`;
  console.log("Attempting to update employee at:", fullUrl);
  console.log("Employee data:", employeeData);
  try {
    const response = await api.put(`/employees/${id}`, employeeData);
    console.log("Update employee response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  const fullUrl = `${API_URL}/employees/${id}`;
  console.log("Attempting to delete employee at:", fullUrl);
  try {
    const response = await api.delete(`/employees/${id}`);
    console.log("Delete employee response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const getEmployeesByCompany = async (companyId) => {
  const fullUrl = `${API_URL}/employees/company/${companyId}`;
  console.log("Attempting to fetch employees by company from:", fullUrl);
  try {
    const response = await api.get(`/employees/company/${companyId}`);
    console.log("Employees by company response:", response);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employees for company ${companyId}:`, error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
};