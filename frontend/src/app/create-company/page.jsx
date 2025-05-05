"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createCompany } from "../utils/api";
import styles from "./page.module.css";

export default function CreateCompany() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false); //fix server-client mismatch

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

  //fix server-client mismatch
  useEffect(() => {
    setIsMounted(true);
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


  // Handle changes to contract length
  const handleYearsChange = (e) => {
    // Parse the number directly from the input value
    const inputValue = e.target.value;

    // Handle empty input case (user is clearing the field)
    if (inputValue === "") {
      setContractYears(0);
      return;
    }

    // Convert to number for state
    const numValue = parseInt(inputValue, 10);

    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setContractYears(numValue >= 0 ? numValue : 0);
    }
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

      // Create company data with total contract length
      const companyData = {
        ...data,
        contractLength: totalContractLength,
        contractLengthYears: Number(data.contractLengthYears) || 0,
        contractLengthMonths: Number(data.contractLengthMonths) || 0
      };

      await createCompany(companyData);
      setIsSuccess(true);
      setResponseMessage("Company created successfully!");

      // Reset form and state
      reset();
      setContractYears(0);
      setContractMonths(0);

      setIsSubmitting(false);

    } catch (err) {
      console.error("Error creating company:", err);
      setError(err.response?.data?.message || "Failed to create company. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className="page-title">Create New Company</h1>

      {isMounted && isSuccess && responseMessage && (
        <div className="successMessage">
          <p>{responseMessage}</p>
        </div>
      )}

      {isMounted && error && <div className="errorMessage">{error}</div>}

      {isMounted && (
        <div className="form-container">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Company Name</label>
              <input
                id="name"
                className="form-input"
                type="text"
                placeholder="Company name is required"
                {...register("name", {
                  required: "Company name is required"
                })}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">Location</label>
              <input
                id="location"
                className="form-input"
                type="text"
                placeholder="Location is required"
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

            <div className={styles.formActions}>
              <button
                type="button"
                className="cancelButton"
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
      )}

      {!isMounted && (
        <div className="loading-container">
          <p>Loading form...</p>
        </div>
      )}
    </div>
  );
}