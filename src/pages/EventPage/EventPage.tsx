import { Link, useNavigate, useParams } from "react-router-dom";
import { apiAssetUrl } from "../../api";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { LanguageSelector } from "../../components/ui/LanguageSelector/LanguageSelector";
import { MarkdownContent } from "../../components/ui/MarkdownContent/MarkdownContent";
import { usePublicEvent } from "../../hooks/usePublicEvent";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import { eventPageText } from "./EventPage.text";
import styles from "./EventPage.module.css";

function eventId(value: string | undefined): number | null {
  return value && /^[1-9][0-9]*$/.test(value) ? Number(value) : null;
}

export function EventPage() {
  const text = useText(eventPageText);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const params = useParams();
  const { event, loading, failed } = usePublicEvent(eventId(params.eventId));

  if (loading) return <main className={styles.state} aria-live="polite">{text.loading}</main>;

  if (failed || !event) {
    return <main className={styles.state}><h1>{text.notFoundTitle}</h1><p>{text.notFoundBody}</p><Link to="/">{text.home}</Link></main>;
  }

  const locale = languageLocales[language];
  const startsAt = new Date(event.starts_at);
  const formattedDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: event.timezone,
  }).format(startsAt);
  const participants = event.speakers
    .map((speaker) => speaker.role_label ? `${speaker.name} (${speaker.role_label})` : speaker.name)
    .join(", ");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" aria-label={text.brand}><BrandMark compact /></Link>
        <div className={styles.headerActions}><button type="button" onClick={() => navigate(-1)}>{text.back}</button><LanguageSelector /></div>
      </header>
      <main>
        <section className={styles.hero}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>{event.cycle ? `${text.cycle} · ${event.cycle.title}` : text.event}</p>
            <h1>{event.title}</h1>
            {event.status === "cancelled" && <p className={styles.cancelled}>{text.cancelled}</p>}
            {event.summary && <p className={styles.summary}>{event.summary}</p>}
            {participants && <p className={styles.heroParticipants}><span>{text.participants}:</span> {participants}</p>}
          </div>
          {event.image_path ? <img className={styles.image} src={apiAssetUrl(event.image_path)} alt="" /> : <div className={styles.artwork} aria-hidden="true"><span /><span /><span /></div>}
        </section>
        <section className={styles.body}>
          <article className={styles.description}><MarkdownContent value={event.description ?? ""} /></article>
          <aside className={styles.practical}>
            <dl>
              <div><dt>{text.date}</dt><dd><time dateTime={event.starts_at}>{formattedDate}</time></dd></div>
              {event.venue.name && <div><dt>{text.location}</dt><dd>{event.venue.name}</dd></div>}
              {event.venue.address && <div><dt>{text.address}</dt><dd>{event.venue.address}</dd></div>}
              {event.venue.online_url && <div><dt>{text.online}</dt><dd><a href={event.venue.online_url}>{event.venue.online_url}</a></dd></div>}
            </dl>
          </aside>
        </section>
      </main>
    </div>
  );
}
