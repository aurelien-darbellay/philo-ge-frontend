import { Link } from "react-router-dom";
import { useText } from "../../../i18n/useText";
import { BrandMark } from "../../ui/BrandMark/BrandMark";
import { landingFooterText } from "./LandingFooter.text";
import styles from "./LandingFooter.module.css";

export function LandingFooter() {
  const text = useText(landingFooterText);
  return (
    <footer className={styles.footer} id="archives">
      <div className={styles.inner}>
        <div className={styles.links}>
          <BrandMark />
          <nav>
            <a href="mailto:contact@philo-ge.ch">{text.contact}</a>
            <Link to="/archives">{text.archiveLabel}</Link>
            <Link to="/login">{text.memberSpace}</Link>
          </nav>
          <nav>
            <a href="#instagram">{text.instagram}</a>
            <a href="#legal">{text.legal}</a>
          </nav>
          <p>{text.city}</p>
        </div>
        <p className={styles.copyright}>{text.copyright}</p>
      </div>
    </footer>
  );
}
