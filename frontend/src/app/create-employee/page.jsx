"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createEmployee, getCompanies } from "../utils/api";
import styles from "./page.module.css";

export default function CreateEmployee() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        setCompanies(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      await createEmployee(data);
      router.push("/");
    } catch (err) {
      console.error("Error creating employee:", err);
      setError(err.response?.data?.message || "Failed to create employee. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading companies...</div>;
  }

  if (companies.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className="page-title">Create New Employee</h1>
        <div className={styles.notice}>
          <p>You need to create at least one company before adding employees.</p>
          <button 
            onClick={() => router.push("/create-company")}
            className="form-button"
          >
            Create Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className="page-title">Create New Employee</h1>
      
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
              <option value="">Select a company</option>
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
              {isSubmitting ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}