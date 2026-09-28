import { Link } from "react-router-dom";
import { apiAssetUrl } from "../../../api";
import { useLanguage } from "../../../i18n/LanguageContext";
import { languageLocales } from "../../../i18n/textMap";
import { useText } from "../../../i18n/useText";
import type { ArchiveResult, PublicCycle, PublicEvent } from "../../../types";
import { archiveResultListText } from "./ArchiveResultList.text";
import styles from "./ArchiveResultList.module.css";

function cycleYears(cycle: PublicCycle): string {
  const start = cycle.starts_on?.slice(0, 4);
  const end = cycle.ends_on?.slice(0, 4);
  if (start && end) return start === end ? start : `${start}–${end}`;
  return start ?? end ?? "";
}

function EventRow({ event }: { event: PublicEvent }) {
  const text = useText(archiveResultListText);
  const { language } = useLanguage();
  const startsAt = new Date(event.starts_at);
  const date = new Intl.DateTimeFormat(languageLocales[language], { day: "numeric", month: "long", year: "numeric", timeZone: event.timezone }).format(startsAt);
  const time = new Intl.DateTimeFormat(languageLocales[language], { hour: "2-digit", minute: "2-digit", timeZone: event.timezone }).format(startsAt);
  const venue = [event.venue.name, event.venue.address].filter(Boolean).join(" · ") || (event.venue.online_url ? text.online : "");

  return <article className={styles.row}>
    <div className={styles.dateBlock}><span className={styles.kind}>{text.event}</span><time className={styles.date} dateTime={event.starts_at}>{date}</time><span className={styles.time}>{time}</span></div>
    <div className={styles.content}>
      {event.speakers.length > 0 && <p className={styles.speakers}>{event.speakers.map((speaker) => speaker.name).join(", ")}</p>}
      <h2 className={styles.title}><Link to={`/evenements/${event.id}`}>{event.title}</Link></h2>
      {event.cycle && <span className={styles.cycleName}>{event.cycle.title}</span>}
      {venue && <p className={styles.venue}>{venue}</p>}
      {event.status === "cancelled" && <span className={styles.cancelled}>{text.cancelled}</span>}
      <Link className={styles.details} to={`/evenements/${event.id}`}>{text.details}<span aria-hidden="true"> →</span></Link>
    </div>
    <div className={styles.visual}>{event.image_path ? <img src={apiAssetUrl(event.image_path)} alt="" /> : <div className={styles.fallback} aria-hidden="true" />}</div>
  </article>;
}

function CycleRow({ cycle }: { cycle: PublicCycle }) {
  const text = useText(archiveResultListText);

  return <article className={styles.row}>
    <div className={styles.dateBlock}><span className={styles.kind}>{text.cycle}</span><span className={styles.date}>{cycleYears(cycle)}</span></div>
    <div className={styles.content}>
      <h2 className={styles.title}><Link to={`/cycles/${cycle.id}`}>{cycle.title}</Link></h2>
      {cycle.description && <p className={styles.description}>{cycle.description}</p>}
      {cycle.status === "cancelled" && <span className={styles.cancelled}>{text.cancelled}</span>}
      <Link className={styles.details} to={`/cycles/${cycle.id}`}>{text.details}<span aria-hidden="true"> →</span></Link>
    </div>
    <div className={styles.visual}>{cycle.image_path ? <img src={apiAssetUrl(cycle.image_path)} alt="" /> : <div className={`${styles.fallback} ${styles.cycleFallback}`} aria-hidden="true" />}</div>
  </article>;
}

export function ArchiveResultList({ results }: { results: ArchiveResult[] }) {
  return <ol className={styles.list}>
    {results.map((result) => <li key={`${result.type}-${result.type === "event" ? result.event.id : result.cycle.id}`}>
      {result.type === "event" ? <EventRow event={result.event} /> : <CycleRow cycle={result.cycle} />}
    </li>)}
  </ol>;
}
