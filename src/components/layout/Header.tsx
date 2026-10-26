import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { NavLinks } from "./NavLinks";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <BrandMark />
          <span>בית&quot;ר ירושלים | כרטיסים למשחקים</span>
        </Link>
        <NavLinks />
      </div>
    </header>
  );
}
