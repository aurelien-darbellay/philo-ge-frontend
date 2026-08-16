import { apiAssetUrl } from "../../../api";
import { Link } from "react-router-dom";
import { useFeaturedContent } from "../../../hooks/useFeaturedContent";
import { useLanguage } from "../../../i18n/LanguageContext";
import { languageLocales } from "../../../i18n/textMap";
import { useText } from "../../../i18n/useText";
import { featuredEncounterText } from "./FeaturedEncounter.text";
import styles from "./FeaturedEncounter.module.css";

function formatDate(value: string, locale: string, includeTime = false): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function formatPosterDate(value: string): string {
  const date = new Date(value);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  return `${day}.${month}.${date.getUTCFullYear()}`;
}

export function FeaturedEncounter() {
  const text = useText(featuredEncounterText);
  const { language } = useLanguage();
  const featured = useFeaturedContent();

  if (!featured) return null;

  const locale = languageLocales[language];
  const content = featured.value;
  const imagePath = content.image_path;
  const detailPath = featured.kind === "cycle"
    ? `/cycles/${featured.value.id}`
    : `/evenements/${featured.value.id}`;
  let description: string | null;
  let date: string;
  let details: string[];
  let kindLabel: string;
  let posterDates: string[];

  if (featured.kind === "cycle") {
    const cycle = featured.value;
    description = cycle.description;
    date = [cycle.starts_on, cycle.ends_on]
      .filter((value): value is string => value !== null)
      .map((value) => formatDate(value, locale))
      .join(" – ");
    const speakers = [...new Set(cycle.events.flatMap((event) => event.speakers.map((speaker) => speaker.name)))];
    details = speakers.length > 0 ? [speakers.join(", ")] : [`${cycle.events.length} ${text.events}`];
    kindLabel = text.cycle;
    posterDates = [cycle.starts_on ?? cycle.created_at, cycle.ends_on]
      .filter((value): value is string => value !== null)
      .map(formatPosterDate);
  } else {
    const event = featured.value;
    description = event.summary || event.description;
    date = formatDate(event.starts_at, locale, true);
    details = [
      event.speakers.map((speaker) => speaker.name).join(", "),
      event.venue.name || (event.venue.online_url ? text.online : ""),
    ].filter(Boolean);
    kindLabel = text.event;
    posterDates = [formatPosterDate(event.starts_at)];
  }

  return (
    <section className={styles.section} id="programme" aria-labelledby="featured-title">
      <div className={styles.inner}>
        <p className={styles.sectionLabel}>{text.sectionLabel}</p>
        {imagePath ? (
          <div className={`${styles.poster} ${styles.posterImage}`}>
            <img src={apiAssetUrl(imagePath)} alt="" />
          </div>
        ) : (
          <div className={styles.poster} aria-hidden="true">
            <span className={styles.posterDates}>
              <span>{posterDates[0]}</span>
              {posterDates.length > 1 && <span className={styles.posterDateSeparator}>-</span>}
              {posterDates.length > 1 && <span>{posterDates[1]}</span>}
            </span>
            <span className={styles.posterLine} />
            <span className={styles.posterDot} />
          </div>
        )}
        <article className={styles.content}>
          <div className={styles.meta}><span>{kindLabel}</span><time>{date}</time></div>
          <h2 id="featured-title">{content.title}</h2>
          {description && <p className={styles.description}>{description}</p>}
          {details.length > 0 && <dl className={styles.details}>{details.map((detail) => <div key={detail}><dt>{detail}</dt></div>)}</dl>}
          <Link className={styles.action} to={detailPath}>{text.action}<span aria-hidden="true">→</span></Link>
        </article>
      </div>
    </section>
  );
}
