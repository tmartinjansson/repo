"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createCompany } from "../utils/api";
import styles from "./page.module.css";

export default function CreateCompany() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      await createCompany(data);
      router.push("/");
    } catch (err) {
      console.error("Error creating company:", err);
      setError(err.response?.data?.message || "Failed to create company. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="page-title">Create New Company</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div className="form-container">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Company Name *</label>
            <input
              id="name"
              className="form-input"
              type="text"
              placeholder="Enter company name"
              {...register("name", { 
                required: "Company name is required" 
              })}
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="location">Location *</label>
            <input
              id="location"
              className="form-input"
              type="text"
              placeholder="Enter company location"
              {...register("location", { 
                required: "Location is required" 
              })}
            />
            {errors.location && (
              <p className="form-error">{errors.location.message}</p>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-input"
              rows="3"
              placeholder="Enter company description"
              {...register("description")}
            />
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
              {isSubmitting ? "Creating..." : "Create Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}