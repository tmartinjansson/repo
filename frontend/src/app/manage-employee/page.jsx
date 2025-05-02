"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEmployees, deleteEmployee } from "../utils/api";
import { formatDate, formatContractLength, calculateContractEndDate, calculateContractReviewDate } from "../utils/dateUtils";
import Link from "next/link";
import styles from "./page.module.css";

export default function ManageEmployee() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees. Please try again later.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      // Update the local state
      setEmployees(employees.filter(employee => employee._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError(err.response?.data?.message || "Failed to delete employee. Please try again.");
    }
  };

  // Calculate contract end date
  const calculateEndDate = (startDate, contractLength) => {
    if (!startDate || contractLength === undefined) return null;

    const start = new Date(startDate);
    // Add contract length in months to start date
    const endDate = new Date(start);
    endDate.setMonth(endDate.getMonth() + contractLength);

    return endDate;
  };

  // Calculate contract review date (3 months before contract end)
  const calculateReviewDate = (startDate, contractLength) => {
    if (!startDate || contractLength === undefined) return null;

    const endDate = calculateEndDate(startDate, contractLength);
    if (!endDate) return null;

    // Subtract 3 months for review date
    const reviewDate = new Date(endDate);
    reviewDate.setMonth(reviewDate.getMonth() - 3);

    return reviewDate;
  };

  if (loading) {
    return <div className={styles.loading}>Loading employees...</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchEmployees} className="button button-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="page-title">Manage Employees</h1>
        <Link href="/create-employee" className="button button-primary">
          Add New Employee
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className={styles.empty}>
          <p>No employees found. Add your first employee!</p>
          <Link href="/create-employee" className="button button-primary">
            Create Employee
          </Link>
        </div>
      ) : (
        <div className={styles.employeeList}>
          {employees.map((employee) => (
            <div key={employee._id} className="card">
              <div className="card-header">
                <h2>{employee.name} {employee.surname}</h2>
                <div className="card-actions">
                  <Link
                    href={`/manage-employee/edit?id=${employee._id}`}
                    className="button button-primary"
                  >
                    Edit
                  </Link>
                  <button
                    className="button button-danger"
                    onClick={() => setDeleteConfirm(employee._id)}
                  >
                    Delete
                  </button>
                  <div className="card-dates">
                    <p>Last updated: {formatDate(employee.updatedAt)}</p>
                    <p>Created: {formatDate(employee.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className={styles.employeeDetails}>
                <p><strong>Position:</strong> {employee.position}</p>
                <p><strong>Company:</strong> {employee.company?.name || "Unknown"}</p>
                {employee.startDate && (
                  <p><strong>Start Date:</strong> {formatDate(new Date(employee.startDate))}</p>
                )}
                {employee.contractLength !== undefined && (
                  <p><strong>Contract Length:</strong> {formatContractLength(employee.contractLength)}</p>
                )}
                {/* Add Final Date of Contract */}
                {employee.startDate && employee.contractLength !== undefined && (
                  <p><strong>Final Date of Contract:</strong> {
                    formatDate(calculateContractEndDate(employee.startDate, employee.contractLength))
                  }</p>
                )}

                {/* Add Contract Review Date */}
                {employee.startDate && employee.contractLength !== undefined && (
                  <p><strong>Date of Contract Review:</strong> {
                    (employee.reviewDate
                      ? formatDate(new Date(employee.reviewDate))
                      : formatDate(calculateContractReviewDate(employee.startDate, employee.contractLength)))
                  }</p>
                )}
              </div>

              {deleteConfirm === employee._id && (
                <div className={styles.confirmDelete}>
                  <p>Are you sure you want to delete this employee?</p>
                  <div className={styles.confirmButtons}>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="button button-danger"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}