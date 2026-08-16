import { brandMarkDefaultText as text } from "./BrandMark.text";
import compactBrandMark from "../../../assets/brand/compactbrandmark.png";
import styles from "./BrandMark.module.css";
export function BrandMark({ compact = false }: { compact?: boolean; showName?: boolean }) { return <span className={`${styles.brand} ${compact ? styles.compact : ""}`}><img className={styles.mark} src={compactBrandMark} alt={text.name} /></span>; }
