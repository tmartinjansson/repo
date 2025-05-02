"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import styles from "./page.module.css";
import { formatDate, formatContractLength, calculateContractEndDate, calculateContractReviewDate } from "../../utils/dateUtils";


export default function EditEmployee() {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  
  // State for contract length
  const [contractYears, setContractYears] = useState(0);
  const [contractMonths, setContractMonths] = useState(0);
  
  // State for contract review date
  const [calculatedReviewDate, setCalculatedReviewDate] = useState(null);
  const [overrideReviewDate, setOverrideReviewDate] = useState(false);
  const [customReviewDate, setCustomReviewDate] = useState("");
  const [startDate, setStartDate] = useState("");
  
  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      contractLengthYears: 0,
      contractLengthMonths: 0,
      reviewDate: ""
    }
  });

  // Watch for changes in start date and contract length
  const watchStartDate = watch("startDate");
  const watchContractLengthYears = watch("contractLengthYears");
  const watchContractLengthMonths = watch("contractLengthMonths");

  //fix server-client mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Get the employee ID from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    
    if (id) {
      fetchEmployee(id);
    } else {
      setError("No employee ID provided");
    }
  }, []);

  // Calculate review date whenever start date or contract length changes
  useEffect(() => {
    if (watchStartDate && (watchContractLengthYears > 0 || watchContractLengthMonths > 0)) {
      const start = new Date(watchStartDate);
      const totalMonths = (Number(watchContractLengthYears) || 0) * 12 + (Number(watchContractLengthMonths) || 0);
      
      // Calculate contract end date
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + totalMonths);
      
      // Calculate review date (3 months before end date)
      const reviewDate = new Date(endDate);
      reviewDate.setMonth(reviewDate.getMonth() - 3);
      
      setCalculatedReviewDate(reviewDate);
      
      // Only update the review date field if not in override mode
      if (!overrideReviewDate) {
        const formattedDate = reviewDate.toISOString().split("T")[0];
        setValue("reviewDate", formattedDate);
        setCustomReviewDate(formattedDate);
      }
    }
  }, [watchStartDate, watchContractLengthYears, watchContractLengthMonths, setValue, overrideReviewDate]);

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
        setResponseMessage("");
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess]);

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

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
        setResponseMessage("");
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess]);


  const fetchEmployee = async (id) => {
    try {
      const data = await getEmployee(id);
      setEmployee(data);
      
      // Store start date for validation
      if (data.startDate) {
        setStartDate(new Date(data.startDate).toISOString().split("T")[0]);
      }
      
      // Populate form with employee data
      reset({
        name: data.name,
        surname: data.surname,
        position: data.position,
        company: data.company?._id,
        startDate: data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : "",
        contractLengthYears: Math.floor(data.contractLength / 12) || 0,
        contractLengthMonths: data.contractLength % 12 || 0,
        reviewDate: data.reviewDate ? new Date(data.reviewDate).toISOString().split("T")[0] : ""
      });
      
      // Set contract length state
      setContractYears(Math.floor(data.contractLength / 12) || 0);
      setContractMonths(data.contractLength % 12 || 0);
      
      // If employee has a custom review date, enable override
      if (data.reviewDate) {
        setCustomReviewDate(new Date(data.reviewDate).toISOString().split("T")[0]);
        setOverrideReviewDate(true);
      }
    } catch (err) {
      console.error("Error fetching employee:", err);
      setError("Failed to load employee. Please try again later.");
    }
  };

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

  // Handle changes to review date override
  const handleReviewDateChange = (e) => {
    setCustomReviewDate(e.target.value);
  };

  const toggleOverrideReviewDate = () => {
    setOverrideReviewDate(!overrideReviewDate);
    
    // Reset to calculated date if turning off override
    if (overrideReviewDate && calculatedReviewDate) {
      const formattedDate = calculatedReviewDate.toISOString().split("T")[0];
      setValue("reviewDate", formattedDate);
      setCustomReviewDate(formattedDate);
    }
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
    if (!employee) return;
    
    setIsSubmitting(true);
    setError("");
    setIsSuccess(false);
    setResponseMessage("");
    
    try {
      console.log("Contract Length Data:", {
        years: data.contractLengthYears,
        months: data.contractLengthMonths
      });
      
      // Calculate total contract length in months
      const totalContractLength = 
        (Number(data.contractLengthYears) || 0) * 12 + (Number(data.contractLengthMonths) || 0);
      
      console.log("Calculated total months:", totalContractLength);

      // Update employee data with total contract length and review date
      const employeeData = {
        ...data,
        contractLength: totalContractLength,
        reviewDate: overrideReviewDate ? data.reviewDate : null
      };

      await updateEmployee(employee._id, employeeData);
      setIsSuccess(true);
      setResponseMessage("Employee updated successfully!");
      setIsSubmitting(false);
    
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(err.response?.data?.message || "Failed to update employee. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading && !employee) {
    return <div className={styles.loading}>Loading...</div>;
  }


// Check if there are no companies
if (companies.length === 0 && !isLoading) {
  return (
    <div className={styles.container}>
      <h1 className="page-title">Edit Employee</h1>
      <div className={styles.notice}>
        <p>You need to create at least one company before editing employees.</p>
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
      <h1 className="page-title">Edit Employee</h1>
      
      {isMounted && isSuccess && responseMessage && (
        <div className="successMessage">
          <p>{responseMessage}</p>
        </div>
      )}

      {isMounted && error && <div className="errorMessage">{error}</div>}
      
      {isMounted && employee ? (
        <div className="form-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">First Name</label>
              <input
                id="name"
                className="form-input"
                type="text"
                placeholder="First name is required"
                {...register("name", { 
                  required: "First name is required" 
                })}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="surname">Last Name</label>
              <input
                id="surname"
                className="form-input"
                type="text"
                placeholder="Last name is required"
                {...register("surname", { 
                  required: "Last name is required" 
                })}
              />
              {errors.surname && (
                <p className="form-error">{errors.surname.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="position">Position</label>
              <input
                id="position"
                className="form-input"
                type="text"
                placeholder="Position is not required"
                {...register("position")}
              />
              {errors.position && (
                <p className="form-error">{errors.position.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="company">Company</label>
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
                {company.name}
            </option>
            ))}
            </select>
              {errors.company && (
                <p className="form-error">{errors.company.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                className="form-input"
                type="date"
                {...register("startDate", {
                  onChange: (e) => setStartDate(e.target.value)
                })}
              />
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
            </div>

{/* Contract Review Date section */}
<div className="form-group">
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <label className="form-label" htmlFor="reviewDate">Date of Contract Review</label>
    <div style={{ display: "flex", alignItems: "center" }}>
      <label htmlFor="overrideReviewDate">Set date manually</label>
      <input
        type="checkbox"
        id="overrideReviewDate"
        checked={overrideReviewDate}
        onChange={toggleOverrideReviewDate}
        style={{ marginLeft: "8px" }}
      />
    </div>
  </div>
  
  {calculatedReviewDate && (
  <div className="calculated-date-info" style={{ marginBottom: "10px", fontSize: "0.9em", color: "#666" }}>
    {!overrideReviewDate 
      ? `Default: 3 months before contract end (${formatDate(calculatedReviewDate)})`
      : `Final date of contract: ${
          formatDate(calculateContractEndDate(
            watchStartDate, 
            (Number(watchContractLengthYears) * 12) + Number(watchContractLengthMonths)
          ))
        }`
    }
  </div>
)}
  
  <input
    id="reviewDate"
    className="form-input"
    type="date"
    disabled={!overrideReviewDate}
    min={startDate || ""}
    max={calculateContractEndDate(
      watchStartDate, 
      (Number(watchContractLengthYears) * 12) + Number(watchContractLengthMonths)
    )?.toISOString().split("T")[0]}
    value={customReviewDate}
    onChange={handleReviewDateChange}
    {...register("reviewDate", {
      validate: {
        afterStartDate: value => {
          if (!overrideReviewDate) return true;
          if (!value) return "Review date is required when manual setting is enabled";
          if (!startDate) return true;
          
          const reviewDate = new Date(value);
          const start = new Date(startDate);
          
          // Check if after start date
          if (reviewDate < start) {
            return "Review date must be after start date";
          }
          
          // Check if before or on end date
          const totalMonths = (Number(watchContractLengthYears) || 0) * 12 + (Number(watchContractLengthMonths) || 0);
          const endDate = calculateContractEndDate(startDate, totalMonths);
          
          if (reviewDate > endDate) {
            return "Review date cannot be after the end of contract";
          }
          
          return true;
        }
      }
    })}
  />
  {errors.reviewDate && (
    <p className="form-error">{errors.reviewDate.message}</p>
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
                {isSubmitting ? "Updating..." : "Update Employee"}
              </button>
            </div>
          </form>
        </div>
      ) : !error && (
        <div className="loading-container">
          <p>Loading employee data...</p>
        </div>
      )}
    </div>
  );
}