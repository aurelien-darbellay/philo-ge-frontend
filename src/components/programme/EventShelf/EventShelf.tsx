import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { apiAssetUrl } from "../../../api";
import { useLanguage } from "../../../i18n/LanguageContext";
import { languageLocales } from "../../../i18n/textMap";
import { useText } from "../../../i18n/useText";
import type { PublicEvent } from "../../../types";
import { eventShelfText } from "./EventShelf.text";
import styles from "./EventShelf.module.css";

function numericDate(value: string): string {
  const date = new Date(value);
  return [date.getUTCDate(), date.getUTCMonth() + 1, date.getUTCFullYear()]
    .map((part, index) => index < 2 ? part.toString().padStart(2, "0") : part.toString())
    .join(".");
}

function titleSizeClass(title: string): string {
  if (title.length > 120) return styles.titleDense;
  if (title.length > 80) return styles.titleCompact;
  return "";
}

export function EventShelf({ title, titleTo, dates, events, lead, pageSize = 5, showTitle = true, notice }: { title: string; titleTo?: string; dates?: string; events: PublicEvent[]; lead?: ReactNode; pageSize?: number; showTitle?: boolean; notice?: string }) {
  const text = useText(eventShelfText);
  const { language } = useLanguage();
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(events.length / pageSize);
  const visibleEvents = events.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => setPage(0), [events]);

  const dateFormatter = new Intl.DateTimeFormat(languageLocales[language], { day: "numeric", month: "long", year: "numeric" });

  return (
    <section className={styles.shelf}>
      <header className={styles.heading}>
        <div>{showTitle && <h2>{titleTo ? <Link to={titleTo}>{title}</Link> : title}</h2>}{notice && <p className={styles.notice}>{notice}</p>}{dates && <p className={!showTitle ? styles.datesOnly : undefined}>{dates}</p>}</div>
        {pageCount > 1 && <nav className={styles.controls} aria-label={title}>
          <button type="button" aria-label={text.previous} disabled={page === 0} onClick={() => setPage((value) => value - 1)}>&lt;</button>
          <button type="button" aria-label={text.next} disabled={page >= pageCount - 1} onClick={() => setPage((value) => value + 1)}>&gt;</button>
        </nav>}
      </header>
      <div className={`${styles.shelfContent} ${lead ? styles.shelfContentWithLead : ""}`}>
        {lead}
        {visibleEvents.length === 0 ? <p className={styles.empty}>{text.empty}</p> : <div className={`${styles.events} ${lead ? styles.cycleEvents : ""}`}>
        {visibleEvents.map((event) => {
          const speakerNames = event.speakers.map((speaker) => speaker.name);
          return <Link className={styles.event} to={`/evenements/${event.id}`} key={event.id}>
          {event.image_path ? <div className={styles.image}><img src={apiAssetUrl(event.image_path)} alt="" /></div> : <div className={styles.artwork}>
            <span className={styles.artworkDate}>{numericDate(event.starts_at)}</span>
            <span className={`${styles.artworkTitle} ${titleSizeClass(event.title)}`}>{event.title}</span>
            <i /><i />
          </div>}
          <h3>{event.title}</h3>
          {speakerNames.length > 0 && <p className={styles.speakers}>{speakerNames.join(", ")}</p>}
          <time dateTime={event.starts_at}>{dateFormatter.format(new Date(event.starts_at))}</time>
        </Link>})}
        </div>}
      </div>
    </section>
  );
}
