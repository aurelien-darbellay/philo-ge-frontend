import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api";
import { useText } from "../../../i18n/useText";
import type { OrganizationProfile } from "../../../types";
import { BrandMark } from "../../ui/BrandMark/BrandMark";
import { landingFooterText } from "./LandingFooter.text";
import styles from "./LandingFooter.module.css";

export function LandingFooter() {
  const text = useText(landingFooterText);

  const [profile, setProfile] = useState<OrganizationProfile | null>(null);

  useEffect(() => {
    let active = true;

    void api.organizationProfile()
      .then(({ profile: nextProfile }) => {
        if (!active) return;
        setProfile(nextProfile);
      })
      .catch(() => {
        if (!active) return;
        setProfile(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const contactEmail = useMemo(() => profile?.email?.trim() ?? "", [profile]);
  const facebookUrl = useMemo(() => profile?.facebook?.trim() ?? "", [profile]);
  const instagramUrl = useMemo(() => profile?.instagram?.trim() ?? "", [profile]);

  return (
    <footer className={styles.footer} id="archives">
      <div className={styles.inner}>
        <div className={styles.links}>
          <BrandMark />
          <nav className={styles.inlineNav}>
            {contactEmail && <a href={`mailto:${contactEmail}`}>{text.contact}</a>}
            <Link to="/archives">{text.archiveLabel}</Link>
            <Link to="/podcasts">{text.podcasts}</Link>
            <Link to="/espace-membre">{text.memberSpace}</Link>
            <Link to="/nous-soutenir">{text.support}</Link>
            {facebookUrl && <a href={facebookUrl} target="_blank" rel="noreferrer">{text.facebook}</a>}
            {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer">{text.instagram}</a>}
          </nav>
        </div>
        <p className={styles.copyright}>{text.copyright}</p>
      </div>
    </footer>
  );
}
