import { useId, type TextareaHTMLAttributes } from "react";
import styles from "./TextArea.module.css";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string };

export function TextArea({ label, hint, id, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <label className={styles.field} htmlFor={inputId}>{label}<textarea className={styles.input} id={inputId} {...props} />{hint && <small className={styles.hint}>{hint}</small>}</label>;
}
