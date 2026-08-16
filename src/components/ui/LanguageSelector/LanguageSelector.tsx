import { useLanguage } from "../../../i18n/LanguageContext";
import { languageSelectorText } from "./LanguageSelector.text";
import styles from "./LanguageSelector.module.css";

export function LanguageSelector() {
  const { language, cycleLanguage } = useLanguage();
  const text = languageSelectorText[language];

  return (
    <button className={styles.selector} type="button" aria-label={text.actionLabel} title={text.actionLabel} onClick={cycleLanguage}>
      {text.shortLabel}
    </button>
  );
}
