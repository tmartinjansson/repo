"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { getCompany, updateCompany } from "../../utils/api";
import styles from "./page.module.css";

export default function EditCompany() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm();

  useEffect(() => {
    if (!id) {
      router.push("/manage-company");
      return;
    }
    
    const fetchCompany = async () => {
      try {
        const data = await getCompany(id);
        // Pre-fill the form with existing data
        reset(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company details. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id, reset, router]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      await updateCompany(id, data);
      router.push("/manage-company");
    } catch (err) {
      console.error("Error updating company:", err);
      setError(err.response?.data?.message || "Failed to update company. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!id) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading company details...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className="page-title">Edit Company</h1>
      
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
              {isSubmitting ? "Updating..." : "Update Company"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}