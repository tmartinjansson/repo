"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { getEmployee, updateEmployee, getCompanies } from "../../utils/api";
import styles from "./page.module.css";

export default function EditEmployee() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm();

  useEffect(() => {
    if (!id) {
      router.push("/manage-employee");
      return;
    }
    
    const fetchData = async () => {
      try {
        // Fetch companies and employee data in parallel
        const [employeeData, companiesData] = await Promise.all([
          getEmployee(id),
          getCompanies()
        ]);
        
        // Convert date string to yyyy-MM-dd format for input[type="date"]
        if (employeeData.startDate) {
          const date = new Date(employeeData.startDate);
          employeeData.startDate = date.toISOString().split('T')[0];
        }
        
        // Pre-fill the form with existing data
        reset(employeeData);
        setCompanies(companiesData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load employee details. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, reset, router]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      await updateEmployee(id, data);
      router.push("/manage-employee");
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(err.response?.data?.message || "Failed to update employee. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading employee details...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className="page-title">Edit Employee</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div className="form-container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              className="form-input"
              type="text"
              placeholder="Enter first name"
              {...register("firstName", { 
                required: "First name is required" 
              })}
            />
            {errors.firstName && (
              <p className="form-error">{errors.firstName.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              className="form-input"
              type="text"
              placeholder="Enter last name"
              {...register("lastName", { 
                required: "Last name is required" 
              })}
            />
            {errors.lastName && (
              <p className="form-error">{errors.lastName.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="position">Position *</label>
            <input
              id="position"
              className="form-input"
              type="text"
              placeholder="Enter position"
              {...register("position", { 
                required: "Position is required" 
              })}
            />
            {errors.position && (
              <p className="form-error">{errors.position.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="company">Company *</label>
            <select
              id="company"
              className="form-input"
              {...register("company", { 
                required: "Company is required" 
              })}
            >
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name} - {company.location}
                </option>
              ))}
            </select>
            {errors.company && (
              <p className="form-error">{errors.company.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="contractLength">
              Contract Length (months)
            </label>
            <input
              id="contractLength"
              className="form-input"
              type="number"
              placeholder="Enter contract length in months"
              {...register("contractLength", { 
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: "Contract length must be at least 1 month"
                }
              })}
            />
            {errors.contractLength && (
              <p className="form-error">{errors.contractLength.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              className="form-input"
              type="date"
              {...register("startDate")}
            />
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="form-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}