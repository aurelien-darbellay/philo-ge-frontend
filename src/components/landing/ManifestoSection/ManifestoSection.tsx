import { useText } from "../../../i18n/useText";
import { manifestoSectionText } from "./ManifestoSection.text";
import styles from "./ManifestoSection.module.css";

export function ManifestoSection() {
  const text = useText(manifestoSectionText);
  return (
    <section className={styles.section} id="association" aria-labelledby="manifesto-title">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h2 id="manifesto-title">{text.title}</h2>
        <div className={styles.copy}>
          <p><strong>{text.organizationName}</strong>{text.bodyOne}</p>
          <p>{text.bodyTwo}</p>
          <p>{text.bodyThreeLead}<a href="https://www.sagw.ch/fr/philosophie/">{text.societyName}</a>{text.bodyThreeEnd}</p>
          <a className={styles.action} href="https://www.unige.ch/lettres/philo/varia/groupe-genevois-de-philosophie">{text.action}<span aria-hidden="true">→</span></a>
        </div>
        <div className={styles.mark} aria-hidden="true"><span /><span /><span /></div>
      </div>
    </section>
  );
}
