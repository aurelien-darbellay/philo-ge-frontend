import type { ReactNode } from "react";
import styles from "./Badge.module.css";
export function Badge({ children, tone = "guest" }: { children: ReactNode; tone?: "admin" | "guest" }) { return <span className={`${styles.badge} ${tone === "admin" ? styles.admin : ""}`}>{children}</span>; }
