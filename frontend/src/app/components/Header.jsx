import Link from "next/link";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.logo}>
          <Link href="/">Bizniz Manager</Link>
        </div>
      </div>
      <div className={styles.bottomBar}>
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
      </div>
    </header>
  );
};

export default Header;