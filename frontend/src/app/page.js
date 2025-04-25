"use client";

import { useState, useEffect } from "react";
import { getCompanies, getEmployees } from "./utils/api";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesData, employeesData] = await Promise.all([
          getCompanies(),
          getEmployees()
        ]);
        setCompanies(companiesData);
        setEmployees(employeesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Debug information */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', color: 'black' }}>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
      </div>
      
      <h1 className="page-title">Bizniz Manager Dashboard</h1>
      
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Companies ({companies.length})</h2>
          <Link href="/create-company" className="button button-primary">
            Add New Company
          </Link>
        </div>

        <div style={{ marginTop: '20px' }}>
  <button 
    style={{ 
      padding: '10px 15px', 
      backgroundColor: '#0070f3', 
      color: 'white', 
      border: 'none', 
      borderRadius: '4px',
      cursor: 'pointer'
    }}
    onClick={async () => {
      try {
        console.log('Testing direct API call to:', 'https://basicbend-h5zb4euj.b4a.run/api/companies');
        const response = await fetch('https://basicbend-h5zb4euj.b4a.run/api/companies');
        const data = await response.json();
        console.log('Direct API call result:', data);
        alert('API call successful! Check console for details.');
      } catch (error) {
        console.error('Direct API call error:', error);
        alert('API call failed! Check console for details.');
      }
    }}
  >
    Test Direct API Call
  </button>
</div>

        {companies.length === 0 ? (
          <p>No companies found. Create your first company!</p>
        ) : (
          <div className="grid">
            {companies.map((company) => (
              <div key={company._id} className="card">
                <h3>{company.name}</h3>
                <p>Location: {company.location}</p>
                <p>Employees: {company.employeeCount}</p>
                <div className={styles.cardActions}>
                  <Link 
                    href={`/manage-company/edit?id=${company._id}`}
                    className="button button-primary"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Employees ({employees.length})</h2>
          <Link 
            href="/create-employee" 
            className={`button button-primary ${companies.length === 0 ? styles.disabled : ""}`}
            aria-disabled={companies.length === 0}
            onClick={(e) => companies.length === 0 && e.preventDefault()}
          >
            Add New Employee
          </Link>
        </div>
        
        {companies.length === 0 ? (
          <p>Please create a company before adding employees.</p>
        ) : employees.length === 0 ? (
          <p>No employees found. Add your first employee!</p>
        ) : (
          <div className="grid">
            {employees.map((employee) => (
              <div key={employee._id} className="card">
                <h3>{employee.firstName} {employee.lastName}</h3>
                <p>Position: {employee.position}</p>
                <p>Company: {employee.company?.name || "Unknown"}</p>
                <div className={styles.cardActions}>
                  <Link 
                    href={`/manage-employee/edit?id=${employee._id}`}
                    className="button button-primary"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}