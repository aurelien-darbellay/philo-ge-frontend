import { Link } from "react-router-dom";
import { apiAssetUrl } from "../../../api";
import { useLanguage } from "../../../i18n/LanguageContext";
import { languageLocales } from "../../../i18n/textMap";
import { useText } from "../../../i18n/useText";
import type { PublicEvent } from "../../../types";
import { programmeEventListText } from "./ProgrammeEventList.text";
import styles from "./ProgrammeEventList.module.css";

const artworkVariants = [styles.artworkRed, styles.artworkBlue, styles.artworkGrey, styles.artworkLight] as const;

export function ProgrammeEventList({ events }: { events: PublicEvent[] }) {
  const text = useText(programmeEventListText);
  const { language } = useLanguage();
  const locale = languageLocales[language];
  const dayFormatter = new Intl.DateTimeFormat(locale, { day: "numeric" });
  const monthFormatter = new Intl.DateTimeFormat(locale, { month: "short" });
  const yearFormatter = new Intl.DateTimeFormat(locale, { year: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });

  return <section className={styles.section}>
    {events.length === 0
      ? <p className={styles.empty}>{text.empty}</p>
      : <div className={styles.events}>{events.map((event) => {
        const startsAt = new Date(event.starts_at);
        const speakers = event.speakers.map((speaker) => speaker.name).join(", ");
        const venue = [event.venue.name, event.venue.address].filter(Boolean).join(" · ") || (event.venue.online_url ? text.online : "");

        return <article className={styles.event} key={event.id}>
          <time className={styles.date} dateTime={event.starts_at}>
            <strong>{dayFormatter.format(startsAt)}</strong>
            <span>{monthFormatter.format(startsAt)}</span>
            <span>{yearFormatter.format(startsAt)}</span>
            <span className={styles.time}>{timeFormatter.format(startsAt)}</span>
          </time>
          <div className={styles.visual}>
            {event.image_path
              ? <img src={apiAssetUrl(event.image_path)} alt="" />
              : <span className={`${styles.artwork} ${artworkVariants[event.id % artworkVariants.length]}`}><i /><i /></span>}
          </div>
          <div className={styles.content}>
            <div className={styles.badges}>
              <span className={styles.badge}>{event.cycle?.title ?? text.outOfCycle}</span>
              {event.status === "cancelled" && <span className={styles.cancelled}>{text.cancelled}</span>}
            </div>
            {speakers && <p className={styles.speakers}>{speakers}</p>}
            <h3><Link to={`/evenements/${event.id}`}>{event.title}</Link></h3>
            {venue && <p className={styles.venue}>{venue}</p>}
          </div>
        </article>;
      })}</div>}
  </section>;
}
