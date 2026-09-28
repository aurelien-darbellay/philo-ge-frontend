import { apiAssetUrl } from "../../../api";
import { useText } from "../../../i18n/useText";
import type { CyclePartner } from "../../../types";
import { cyclePartnersText } from "./CyclePartners.text";
import styles from "./CyclePartners.module.css";

export function CyclePartners({ partners }: { partners: CyclePartner[] }) {
  const text = useText(cyclePartnersText);

  if (partners.length === 0) return null;

  return <section className={styles.section} aria-label={text.label}>
    <p className={styles.heading}>{text.heading}</p>
    <ul className={styles.partners}>
      {partners.map((partner) => <li className={styles.partner} key={partner.id}>
        {partner.website_url
          ? <a className={styles.link} href={partner.website_url} target="_blank" rel="noopener noreferrer"><img className={styles.logo} src={apiAssetUrl(partner.logo_path)} alt={partner.name} /></a>
          : <img className={styles.logo} src={apiAssetUrl(partner.logo_path)} alt={partner.name} />}
      </li>)}
    </ul>
  </section>;
}
