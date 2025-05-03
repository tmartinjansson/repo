"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { getCompany, updateCompany } from "../../utils/api";
import styles from "./page.module.css";

// Create a client component that uses useSearchParams
function EditCompanyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  // State for contract length
  const [contractYears, setContractYears] = useState(0);
  const [contractMonths, setContractMonths] = useState(0);
  
  const { 
    register, 
    handleSubmit,
    setValue,
    formState: { errors },
    reset 
  } = useForm({
    defaultValues: {
      contractLengthYears: 0,
      contractLengthMonths: 0
    }
  });

  // Fix server-client mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!id) {
      router.push("/manage-company");
      return;
    }
    
    const fetchCompany = async () => {
      try {
        const data = await getCompany(id);
        
        // Calculate years and months from total contract length
        const years = Math.floor(data.contractLength / 12) || 0;
        const months = data.contractLength % 12 || 0;
        
        // Set the state
        setContractYears(years);
        setContractMonths(months);
        
        // Pre-fill the form with existing data
        reset({
          ...data,
          contractLengthYears: years,
          contractLengthMonths: months
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company details. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id, reset, router]);

  // Handle changes to contract length
  const handleYearsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setContractYears(value >= 0 ? value : 0);
    setValue("contractLengthYears", value >= 0 ? value : 0);
  };

  const handleMonthsChange = (e) => {
    let value = parseInt(e.target.value) || 0;
    
    // Handle values outside of 0-11 range
    if (value > 11) {
      // Roll over to years
      const additionalYears = Math.floor(value / 12);
      const remainingMonths = value % 12;
      
      const newYears = contractYears + additionalYears;
      setContractYears(newYears);
      setValue("contractLengthYears", newYears);
      
      value = remainingMonths;
    } else if (value < 0) {
      // Only allow negative rollover if we have years to deduct from
      if (contractYears > 0) {
        const newYears = contractYears - 1;
        setContractYears(newYears);
        setValue("contractLengthYears", newYears);
        value = 12 + value; // value is negative, so this is 12 - |value|
      } else {
        // Can't go below 0 years and 0 months
        value = 0;
      }
    }
    
    setContractMonths(value);
    setValue("contractLengthMonths", value);
  };

  // Increment/decrement buttons handlers
  const incrementMonths = () => {
    const newValue = contractMonths + 1;
    if (newValue > 11) {
      setContractYears(contractYears + 1);
      setContractMonths(0);
      setValue("contractLengthYears", contractYears + 1);
      setValue("contractLengthMonths", 0);
    } else {
      setContractMonths(newValue);
      setValue("contractLengthMonths", newValue);
    }
  };

  const decrementMonths = () => {
    if (contractMonths > 0) {
      setContractMonths(contractMonths - 1);
      setValue("contractLengthMonths", contractMonths - 1);
    } else if (contractYears > 0) {
      setContractYears(contractYears - 1);
      setContractMonths(11);
      setValue("contractLengthYears", contractYears - 1);
      setValue("contractLengthMonths", 11);
    }
  };

  const incrementYears = () => {
    setContractYears(contractYears + 1);
    setValue("contractLengthYears", contractYears + 1);
  };

  const decrementYears = () => {
    if (contractYears > 0) {
      setContractYears(contractYears - 1);
      setValue("contractLengthYears", contractYears - 1);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    
    try {
      // Calculate total contract length in months
      const totalContractLength = 
        (Number(data.contractLengthYears) || 0) * 12 + (Number(data.contractLengthMonths) || 0);
      
      // Update company data with total contract length
      const companyData = {
        ...data,
        contractLength: totalContractLength
      };
      
      await updateCompany(id, companyData);
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
            <label className="form-label">Contract Length</label>
            
            <div className="contract-length-container" style={{ display: "flex", marginBottom: "10px" }}>
              <div style={{ marginRight: "20px" }}>
                <label htmlFor="contractLengthYears" style={{ marginRight: "10px" }}>Years:</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button 
                    type="button" 
                    onClick={decrementYears}
                    className="contract-btn"
                    disabled={contractYears === 0}
                    style={{ padding: "0 10px", marginRight: "5px" }}
                  >
                    -
                  </button>
                  <input
                    id="contractLengthYears"
                    className="form-input"
                    type="number"
                    value={contractYears}
                    min="0"
                    placeholder="Years"
                    onChange={handleYearsChange}
                    style={{ width: "70px", textAlign: "center" }}
                    {...register("contractLengthYears", { 
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Years cannot be negative"
                      }
                    })}
                  />
                  <button 
                    type="button" 
                    onClick={incrementYears}
                    className="contract-btn"
                    style={{ padding: "0 10px", marginLeft: "5px" }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="contractLengthMonths" style={{ marginRight: "10px" }}>Months:</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button 
                    type="button" 
                    onClick={decrementMonths}
                    className="contract-btn"
                    disabled={contractYears === 0 && contractMonths === 0}
                    style={{ padding: "0 10px", marginRight: "5px" }}
                  >
                    -
                  </button>
                  <input
                    id="contractLengthMonths"
                    className="form-input"
                    type="number"
                    value={contractMonths}
                    min="0"
                    max="11"
                    placeholder="Months"
                    onChange={handleMonthsChange}
                    style={{ width: "70px", textAlign: "center" }}
                    {...register("contractLengthMonths", { 
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Months cannot be negative"
                      },
                      max: {
                        value: 11,
                        message: "Use years field for 12+ months"
                      },
                      validate: {
                        atLeastOneMonth: (value, formValues) => 
                          (Number(formValues.contractLengthYears) > 0 || Number(value) > 0) || 
                          "Total contract length must be at least 1 month"
                      }
                    })}
                  />
                  <button 
                    type="button" 
                    onClick={incrementMonths}
                    className="contract-btn"
                    style={{ padding: "0 10px", marginLeft: "5px" }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {(errors.contractLengthYears || errors.contractLengthMonths) && (
              <p className="form-error">
                {errors.contractLengthYears?.message || errors.contractLengthMonths?.message}
              </p>
            )}
            
            <p className="contract-total">
              Total: {contractYears > 0 ? `${contractYears} year${contractYears !== 1 ? 's' : ''}` : ''}
              {contractYears > 0 && contractMonths > 0 ? ' and ' : ''}
              {contractMonths > 0 ? `${contractMonths} month${contractMonths !== 1 ? 's' : ''}` : ''}
              {contractYears === 0 && contractMonths === 0 ? '0 months' : ''}
            </p>
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

// Wrap with Suspense
export default function EditCompany() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <EditCompanyForm />
    </Suspense>
  );
}