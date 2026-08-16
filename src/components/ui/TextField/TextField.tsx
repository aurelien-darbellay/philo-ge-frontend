import { useId, type InputHTMLAttributes } from "react";
import styles from "./TextField.module.css";
type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string };
export function TextField({ label, hint, id, ...props }: Props) { const generatedId = useId(); const inputId = id ?? generatedId; return <label className={styles.field} htmlFor={inputId}>{label}<input className={styles.input} id={inputId} {...props} />{hint && <small className={styles.hint}>{hint}</small>}</label>; }
