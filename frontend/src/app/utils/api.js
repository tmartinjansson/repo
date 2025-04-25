import axios from "axios";

// Define the base URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Company API calls
export const getCompanies = async () => {
  console.log("Attempting to fetch companies from:", API_URL + "/companies");
  try {
    const response = await api.get("/companies");
    console.log("Response received:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

export const getCompany = async (id) => {
  try {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error);
    throw error;
  }
};

export const createCompany = async (companyData) => {
  try {
    const response = await api.post("/companies", companyData);
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error);
    throw error;
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating company ${id}:`, error);
    throw error;
  }
};

export const deleteCompany = async (id) => {
  try {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting company ${id}:`, error);
    throw error;
  }
};

// Employee API calls
export const getEmployees = async () => {
  try {
    const response = await api.get("/employees");
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const getEmployee = async (id) => {
  try {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    throw error;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await api.post("/employees", employeeData);
    return response.data;
  } catch (error) {
    console.error("Error creating employee:", error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    throw error;
  }
};

export const getEmployeesByCompany = async (companyId) => {
  try {
    const response = await api.get(`/employees/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employees for company ${companyId}:`, error);
    throw error;
  }
};