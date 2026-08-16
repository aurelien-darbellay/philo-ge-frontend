import compactBrandMark from "../../../assets/brand/compactbrandmark.png";
import { useText } from "../../../i18n/useText";
import { brandMarkText } from "./BrandMark.text";
import styles from "./BrandMark.module.css";
export function BrandMark({ compact = false }: { compact?: boolean; showName?: boolean }) { const text = useText(brandMarkText); return <span className={`${styles.brand} ${compact ? styles.compact : ""}`}><img className={styles.mark} src={compactBrandMark} alt={text.name} /></span>; }
