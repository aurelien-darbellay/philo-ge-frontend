import { featuredEncounterDefaultText as text } from "./FeaturedEncounter.text";
import styles from "./FeaturedEncounter.module.css";

export function FeaturedEncounter() {
  return (
    <section className={styles.section} id="programme" aria-labelledby="featured-title">
      <div className={styles.inner}>
        <p className={styles.sectionLabel}>{text.sectionLabel}</p>
        <div className={styles.poster} aria-hidden="true">
          <span className={styles.posterNumber}>24</span>
          <span className={styles.posterLine} />
          <span className={styles.posterDot} />
        </div>
        <article className={styles.content}>
          <div className={styles.meta}><span>{text.format}</span><time dateTime="2026-09-24T19:00">{text.date}</time></div>
          <h2 id="featured-title">{text.title}</h2>
          <p className={styles.description}>{text.description}</p>
          <dl className={styles.details}>
            <div><dt>{text.participants}</dt></div>
            <div><dt>{text.location}</dt></div>
          </dl>
          <a className={styles.action} href="#programme-detail">{text.action}<span aria-hidden="true">→</span></a>
        </article>
      </div>
    </section>
  );
}
