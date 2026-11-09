import compactBrandMark from "../../../assets/brand/compactbrandmark.png";
import fullBrandMark from "../../../assets/brand/logo-transparent-txt-enlarged.png";
import { useText } from "../../../i18n/useText";
import { brandMarkText } from "./BrandMark.text";
import styles from "./BrandMark.module.css";

type BrandMarkProps = {
  variant?: "default" | "compact" | "full";
};

export function BrandMark({ variant = "default" }: BrandMarkProps) {
  const text = useText(brandMarkText);
  const source = variant === "full" ? fullBrandMark : compactBrandMark;

  return <span className={`${styles.brand} ${styles[variant]}`}>
    <img className={styles.mark} src={source} alt={text.name} />
  </span>;
}
