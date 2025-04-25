import Link from "next/link";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">Bizniz Manager</Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/create-company">Add Company</Link>
          </li>
          <li>
            <Link href="/create-employee">Add Employee</Link>
          </li>
          <li>
            <Link href="/manage-company">Manage Companies</Link>
          </li>
          <li>
            <Link href="/manage-employee">Manage Employees</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;