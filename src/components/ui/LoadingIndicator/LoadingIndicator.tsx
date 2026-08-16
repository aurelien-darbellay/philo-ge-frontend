import { useText } from "../../../i18n/useText";
import { loadingIndicatorText } from "./LoadingIndicator.text";
import styles from "./LoadingIndicator.module.css";
export function LoadingIndicator() { const text = useText(loadingIndicatorText); return <main className={styles.screen}><div className={styles.loader} role="status" aria-label={text.label} /></main>; }
