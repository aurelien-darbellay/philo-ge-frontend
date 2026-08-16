import { Link } from "react-router-dom";
import { FeaturedEncounter } from "../../components/landing/FeaturedEncounter/FeaturedEncounter";
import { LandingFooter } from "../../components/landing/LandingFooter/LandingFooter";
import { ManifestoSection } from "../../components/landing/ManifestoSection/ManifestoSection";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { landingPageDefaultText as text } from "./LandingPage.text";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main">{text.skipToContent}</a>
      <header className={styles.header}>
        <Link className={styles.brand} to="/" aria-label={text.brand}><BrandMark compact /></Link>
        <nav className={styles.navigation} aria-label={text.navigationLabel}>
          <a href="#programme">{text.program}</a>
          <a href="#association">{text.about}</a>
          <a href="#archives">{text.archives}</a>
        </nav>
        <Link className={styles.memberLink} to="/login">{text.memberSpace}</Link>
      </header>

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
            <a className={styles.discoverLink} href="#programme">{text.discover}<span aria-hidden="true">↘</span></a>
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
      <LandingFooter />
    </div>
  );
}
