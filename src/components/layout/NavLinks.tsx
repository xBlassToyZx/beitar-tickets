"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const LINKS = [
  { href: "/", label: "משחקים", match: (p: string) => p === "/" || p.startsWith("/matches") },
  { href: "/season", label: "מנויים", match: (p: string) => p.startsWith("/season") },
  { href: "/wallet", label: "הכרטיסים שלי", match: (p: string) => p.startsWith("/wallet") },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="ניווט ראשי" className={styles.nav}>
      {LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={styles.navLink}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
