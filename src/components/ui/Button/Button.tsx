import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) { return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props} />; }
export function ButtonLink({ to, children, variant = "primary" }: { to: string; children: ReactNode; variant?: Variant }) { return <Link className={`${styles.button} ${styles[variant]}`} to={to}>{children}</Link>; }
