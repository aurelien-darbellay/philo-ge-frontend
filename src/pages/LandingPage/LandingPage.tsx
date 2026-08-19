import { Link } from "react-router-dom";
import { FeaturedEncounter } from "../../components/landing/FeaturedEncounter/FeaturedEncounter";
import { ManifestoSection } from "../../components/landing/ManifestoSection/ManifestoSection";
import { PublicHeader } from "../../components/public/PublicHeader/PublicHeader";
import { useText } from "../../i18n/useText";
import { landingPageText } from "./LandingPage.text";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  const text = useText(landingPageText);

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main">{text.skipToContent}</a>
      <PublicHeader />

      <main id="main">
        <div className={styles.main}>
          <section className={styles.hero}>
          <p className={styles.eyebrow}>{text.eyebrow}</p>
          <h1 className={styles.title}>
            <span>{text.titleLineOne}</span>
            <span className={styles.titleOffset}>{text.titleLineTwo}</span>
          </h1>
          <div className={styles.heroFooter}>
            <p className={styles.introduction}>{text.introduction}</p>
            <Link className={styles.discoverLink} to="/programme">{text.discover}<span aria-hidden="true">↘</span></Link>
          </div>
          <div className={styles.artwork} aria-hidden="true">
            <span className={styles.redBlock} />
            <span className={styles.blueLine} />
            <span className={styles.greyLine} />
          </div>
          </section>

        </div>
        <FeaturedEncounter />
        <ManifestoSection />
      </main>
    </div>
  );
}
