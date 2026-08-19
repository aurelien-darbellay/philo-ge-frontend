import type { ReactNode } from "react";
import { AdminHeader } from "../../components/admin/AdminHeader/AdminHeader";
import styles from "./AppShell.module.css";
export function AppShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) { return <div className={`${styles.shell} ${compact ? styles.compact : ""}`}><AdminHeader />{children}</div>; }
