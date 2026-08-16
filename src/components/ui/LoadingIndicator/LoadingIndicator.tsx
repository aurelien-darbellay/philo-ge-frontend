import { loadingIndicatorDefaultText as text } from "./LoadingIndicator.text";
import styles from "./LoadingIndicator.module.css";
export function LoadingIndicator() { return <main className={styles.screen}><div className={styles.loader} role="status" aria-label={text.label} /></main>; }
