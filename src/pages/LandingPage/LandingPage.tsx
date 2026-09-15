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
        <FeaturedEncounter />
        <ManifestoSection />
      </main>
    </div>
  );
}
