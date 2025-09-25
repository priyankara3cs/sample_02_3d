"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const Item = ({ href, label }) => (
    <Link href={href} className={pathname === href ? "active" : ""}>
      {label}
    </Link>
  );

  return (
    <nav className="nav">
      <div style={{ fontWeight: 800, letterSpacing: 1 }}>MySite</div>
      <div>
        <Item href="/" label="Home" />
        <Item href="/about" label="About" />
        <Item href="/contact" label="Contact" />
      </div>
    </nav>
  );
}
