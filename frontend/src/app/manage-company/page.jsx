"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCompanies, deleteCompany } from "../utils/api";
import { formatDate } from "../utils/dateUtils";
import styles from "./page.module.css";

export default function ManageCompany() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Failed to load companies. Please try again later.");
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteCompany(id);
      // Update the local state
      setCompanies(companies.filter(company => company._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting company:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete company. Please try again.");
    }
  };
  
  const handleDeleteClick = (company) => {
    if (company.employeeCount > 0) {
      // Set error message when trying to delete a company with employees
      setDeleteError(`Cannot delete "${company.name}" because it has ${company.employeeCount} employees.`);
      // Auto-clear the error after 5 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 5000);
    } else {
      // Clear any previous error and show confirmation
      setDeleteError(null);
      setDeleteConfirm(company._id);
    }
  };
  
  if (loading) {
    return <div className={styles.loading}>Loading companies...</div>;
  }
  
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchCompanies} className="button button-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="page-title">Manage Companies</h1>
        <Link href="/create-company" className="button button-primary">
          Add New Company
        </Link>
      </div>
      
      {deleteError && (
        <div className="errorMessage">
          <p>{deleteError}</p>
        </div>
      )}
      
      {companies.length === 0 ? (
        <div className={styles.empty}>
          <p>No companies found. Create your first company!</p>
          <Link href="/create-company" className="button button-primary">
            Create Company
          </Link>
        </div>
      ) : (
        <div className={styles.companyList}>
          {companies.map((company) => (
            <div key={company._id} className="card">
              <div className="card-header">
                <h2>{company.name}</h2>
                <div className="card-actions">
                  <Link 
                    href={`/manage-company/edit?id=${company._id}`}
                    className="button button-primary"
                  >
                    Edit
                  </Link>
                  <button 
                    className="button button-danger"
                    onClick={() => handleDeleteClick(company)}
                  >
                    Delete
                  </button>
                  <div className="card-dates">
                    <p>Last updated: {formatDate(company.updatedAt)}</p>
                    <p>Created: {formatDate(company.createdAt)}</p>
                  </div>  
                </div>
              </div>
              
              <div className={styles.companyDetails}>
                <p><strong>Location:</strong> {company.location}</p>
                <p><strong>Employees:</strong> {company.employeeCount}</p>
                {company.description && (
                  <p><strong>Description:</strong> {company.description}</p>
                )}
                {company.contractLength && (
                  <p><strong>Contract Length:</strong> {company.contractLength} months</p>
                )}
              </div>
              
              {deleteConfirm === company._id && (
                <div className={styles.confirmDelete}>
                  <p>Are you sure you want to delete this company?</p>
                  <div className={styles.confirmButtons}>
                    <button 
                      onClick={() => handleDelete(company._id)}
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