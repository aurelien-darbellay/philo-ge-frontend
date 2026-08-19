import { useState } from "react";
import { Link } from "react-router-dom";
import { FeaturedEncounter } from "../../components/landing/FeaturedEncounter/FeaturedEncounter";
import { ManifestoSection } from "../../components/landing/ManifestoSection/ManifestoSection";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { LanguageSelector } from "../../components/ui/LanguageSelector/LanguageSelector";
import { useText } from "../../i18n/useText";
import { landingPageText } from "./LandingPage.text";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  const text = useText(landingPageText);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main">{text.skipToContent}</a>
      <header className={styles.header}>
        <Link className={styles.brand} to="/" aria-label={text.brand}><BrandMark compact /></Link>
        <nav id="landing-navigation" className={`${styles.navigation} ${menuOpen ? styles.navigationOpen : ""}`} aria-label={text.navigationLabel}>
          <Link to="/programme" onClick={closeMenu}>{text.program}</Link>
          <Link to="/podcasts" onClick={closeMenu}>{text.podcasts}</Link>
          <a href="#association" onClick={closeMenu}>{text.about}</a>
          <Link to="/archives" onClick={closeMenu}>{text.archives}</Link>
          <Link className={styles.memberLink} to="/login" onClick={closeMenu}>{text.memberSpace}</Link>
        </nav>
        <div className={styles.languageControl}><LanguageSelector /></div>
        <button
          className={`${styles.menuButton} ${menuOpen ? styles.menuButtonOpen : ""}`}
          type="button"
          aria-controls="landing-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? text.closeMenu : text.openMenu}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
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
