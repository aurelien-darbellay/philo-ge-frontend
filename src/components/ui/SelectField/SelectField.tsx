import { useId, type SelectHTMLAttributes } from "react";
import styles from "./SelectField.module.css";

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label: string };

export function SelectField({ label, id, children, ...props }: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return <label className={styles.field} htmlFor={inputId}>{label}<select className={styles.input} id={inputId} {...props}>{children}</select></label>;
}
