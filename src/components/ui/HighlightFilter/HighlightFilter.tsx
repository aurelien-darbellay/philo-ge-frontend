import { Button } from "../Button/Button";
import styles from "./HighlightFilter.module.css";

type Props = {
  active: boolean;
  label: string;
  onToggle: () => void;
};

export function HighlightFilter({ active, label, onToggle }: Props) {
  return <Button className={`${styles.button} ${active ? styles.active : ""}`} type="button" variant="ghost" aria-label={label} aria-pressed={active} title={label} onClick={onToggle}>{active ? "★" : "☆"}</Button>;
}
