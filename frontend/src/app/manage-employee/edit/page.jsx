"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { getEmployee, updateEmployee, getCompanies } from "../../utils/api";
import { formatDate, formatContractLength, calculateContractEndDate, calculateContractReviewDate } from "../../utils/dateUtils";
import styles from "./page.module.css";

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
  const [startDate, setStartDate] = useState("");
  
  // New state for manual date setting
  const [useManualReviewDate, setUseManualReviewDate] = useState(false);
  const [manualReviewDate, setManualReviewDate] = useState("");
  const [minReviewDate, setMinReviewDate] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      // Set today's date as the default only if we don't have an employee's start date
      startDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      contractLengthYears: 0,
      contractLengthMonths: 0,
      reviewDate: "",
      useManualReviewDate: false
    }
  });

  // Watch for changes in start date and contract length
  const watchStartDate = watch("startDate");
  const watchContractLengthYears = watch("contractLengthYears");
  const watchContractLengthMonths = watch("contractLengthMonths");
  const watchManualReviewDate = watch("reviewDate");
  const watchUseManualReviewDate = watch("useManualReviewDate");

  // Add to your useEffect that runs on component mount
  useEffect(() => {
    setIsMounted(true);
    // Set default start date to today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setMinReviewDate(today); // Set minimum review date to today
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
      const totalMonths = (Number(watchContractLengthYears) || 0) * 12 + (Number(watchContractLengthMonths) || 0);

      // Calculate review date (3 months before end date)
      const reviewDate = calculateContractReviewDate(watchStartDate, totalMonths);

      setCalculatedReviewDate(reviewDate);

      // Only set the form value if not using manual date
      if (reviewDate && !watchUseManualReviewDate) {
        const formattedDate = reviewDate.toISOString().split("T")[0];
        setValue("reviewDate", formattedDate);
      }
    }
  }, [watchStartDate, watchContractLengthYears, watchContractLengthMonths, setValue, watchUseManualReviewDate]);

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

  const fetchEmployee = async (id) => {
    try {
      const data = await getEmployee(id);
      setEmployee(data);

      // Store start date for validation
      if (data.startDate) {
        setStartDate(new Date(data.startDate).toISOString().split("T")[0]);
      }

      // Check if employee has a custom review date
      const hasCustomReviewDate = data.reviewDate && data.reviewDate !== null;
      setUseManualReviewDate(hasCustomReviewDate);
      
      // Set today as the minimum review date
      const today = new Date().toISOString().split('T')[0];
      setMinReviewDate(today);
      
      if (hasCustomReviewDate) {
        const reviewDate = new Date(data.reviewDate).toISOString().split("T")[0];
        setManualReviewDate(reviewDate);
        
        // If the stored review date is in the past, update it to today
        if (reviewDate < today) {
          setManualReviewDate(today);
        }
      }

      // Populate form with employee data
      reset({
        name: data.name,
        surname: data.surname,
        company: data.company?._id,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split('T')[0], // Use today if no date
        contractLengthYears: Math.floor(data.contractLength / 12) || 0,
        contractLengthMonths: data.contractLength % 12 || 0,
        reviewDate: hasCustomReviewDate 
          ? (new Date(data.reviewDate) < new Date(today) 
              ? today 
              : new Date(data.reviewDate).toISOString().split("T")[0])
          : "",
        useManualReviewDate: hasCustomReviewDate
      });

      // Set contract length state
      setContractYears(Math.floor(data.contractLength / 12) || 0);
      setContractMonths(data.contractLength % 12 || 0);
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
    // Parse the number directly from the input value
    const inputValue = e.target.value;

    // Handle empty input case (user is clearing the field)
    if (inputValue === "") {
      setContractMonths(0);
      return;
    }

    // Convert to number for state
    let numValue = parseInt(inputValue, 10);

    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      // Handle values outside of 0-11 range
      if (numValue > 11) {
        // Roll over to years
        const additionalYears = Math.floor(numValue / 12);
        const remainingMonths = numValue % 12;

        const newYears = contractYears + additionalYears;
        setContractYears(newYears);
        setValue("contractLengthYears", newYears);

        numValue = remainingMonths;
      } else if (numValue < 0) {
        // Only allow negative rollover if we have years to deduct from
        if (contractYears > 0) {
          const newYears = contractYears - 1;
          setContractYears(newYears);
          setValue("contractLengthYears", newYears);
          numValue = 12 + numValue; // value is negative, so this is 12 - |value|
        } else {
          // Can't go below 0 years and 0 months
          numValue = 0;
        }
      }

      setContractMonths(numValue);
    }
  };

  // Handle manual review date checkbox
  const handleUseManualDateChange = (e) => {
    const checked = e.target.checked;
    setUseManualReviewDate(checked);
    setValue("useManualReviewDate", checked);
    
    // If unchecking, reset to the calculated date
    if (!checked && calculatedReviewDate) {
      const formattedDate = calculatedReviewDate.toISOString().split("T")[0];
      setValue("reviewDate", formattedDate);
    } else if (checked) {
      // If checking and there's no date set, default to today or calculated date if it exists
      if (!watchManualReviewDate || watchManualReviewDate === "") {
        const today = new Date().toISOString().split('T')[0];
        const dateToUse = calculatedReviewDate 
          ? calculatedReviewDate.toISOString().split("T")[0] 
          : today;
        
        // Use the date that's furthest in the future
        setValue("reviewDate", dateToUse > today ? dateToUse : today);
      }
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
  
      // Create the employee data object
      const employeeData = {
        ...data,
        contractLength: totalContractLength,
      };
  
      // Set the review date based on the checkbox
      if (data.useManualReviewDate && data.reviewDate) {
        employeeData.reviewDate = data.reviewDate;
        console.log("Using manual review date:", data.reviewDate);
      } else {
        employeeData.reviewDate = null; // Explicitly set to null if not using manual date
        console.log("Using default review date calculation");
      }
  
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

              <div className="contract-length-container">
                <div className="contract-length-years">
                  <label htmlFor="contractLengthYears" className="contract-length-label">Years:</label>
                  <div className="contract-length-input-group">
                    <button
                      type="button"
                      onClick={decrementYears}
                      className="contract-btn"
                      disabled={contractYears === 0}
                    >
                      -
                    </button>
                    <input
                      id="contractLengthYears"
                      className="form-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("contractLengthYears", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Years cannot be negative"
                        },
                        onChange: (e) => handleYearsChange(e)
                      })}
                    />
                    <button
                      type="button"
                      onClick={incrementYears}
                      className="contract-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="contract-length-months">
                  <label htmlFor="contractLengthMonths" className="contract-length-label">Months:</label>
                  <div className="contract-length-input-group">
                    <button
                      type="button"
                      onClick={decrementMonths}
                      className="contract-btn"
                      disabled={contractYears === 0 && contractMonths === 0}
                    >
                      -
                    </button>
                    <input
                      id="contractLengthMonths"
                      className="form-input"
                      type="number"
                      min="0"
                      max="11"
                      placeholder="0"
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
                        },
                        onChange: (e) => handleMonthsChange(e)
                      })}
                    />
                    <button
                      type="button"
                      onClick={incrementMonths}
                      className="contract-btn"
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

            {/* Contract Review Date section - updated with manual date option */}
            <div className="form-group">
              <label className="form-label">Date of Contract Review</label>

              {calculatedReviewDate && (
                <div className="calculated-date-info">
                  Default: 3 months before contract end ({formatDate(calculatedReviewDate)})
                </div>
              )}

              {/* Added manual date checkbox - THIS IS THE EXCEPTION WHERE INLINE STYLING IS ALLOWED */}
              <div style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                <input
                  id="useManualReviewDate"
                  type="checkbox"
                  style={{ marginRight: "8px" }}
                  {...register("useManualReviewDate", {
                    onChange: (e) => handleUseManualDateChange(e)
                  })}
                />
                <label htmlFor="useManualReviewDate">Set date manually</label>
              </div>

              {/* Conditional display based on checkbox */}
              {watchUseManualReviewDate ? (
                <div>
                  <input
                    id="reviewDate"
                    className="form-input"
                    type="date"
                    min={minReviewDate} // Set minimum date to today
                    {...register("reviewDate", {
                      required: watchUseManualReviewDate ? "Review date is required when manually set" : false,
                      validate: {
                        futureDate: (value) => {
                          const today = new Date().toISOString().split('T')[0];
                          return value >= today || "Review date cannot be in the past";
                        }
                      }
                    })}
                  />
                  {errors.reviewDate && (
                    <p className="form-error">{errors.reviewDate.message}</p>
                  )}
                </div>
              ) : (
                <div className="default-review-date">
                  {calculatedReviewDate ? formatDate(calculatedReviewDate) : "Will be calculated when contract details are set"}
                </div>
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