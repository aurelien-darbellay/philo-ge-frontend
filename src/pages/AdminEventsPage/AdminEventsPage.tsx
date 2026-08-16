import { useEffect, useMemo, useState } from "react";
import { api, apiAssetUrl } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button, ButtonLink } from "../../components/ui/Button/Button";
import { HighlightFilter } from "../../components/ui/HighlightFilter/HighlightFilter";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextField } from "../../components/ui/TextField/TextField";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { ContentStatus, PublicEvent } from "../../types";
import { normalizeSearchValue } from "../../utils/normalizeSearchValue";
import { adminEventsPageText } from "./AdminEventsPage.text";
import styles from "./AdminEventsPage.module.css";

const dateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = new Date();
const oneYearFromToday = new Date(today);
oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() + 1);

export function AdminEventsPage() {
  const text = useText(adminEventsPageText);
  const { language } = useLanguage();
  const { csrfToken } = useAuth();
  const [from, setFrom] = useState(dateValue(today));
  const [to, setTo] = useState(dateValue(oneYearFromToday));
  const [query, setQuery] = useState("");
  const [highlightedOnly, setHighlightedOnly] = useState(false);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingEventId, setPendingEventId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    if (to < from) {
      setEvents([]);
      setError(text.invalidDates);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError("");
    api.adminEvents(from, to)
      .then(({ events: value }) => { if (active) setEvents(value); })
      .catch(() => { if (active) setError(text.loadError); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [from, to, text.invalidDates, text.loadError]);

  const normalizedQuery = normalizeSearchValue(query.trim());
  const filteredEvents = useMemo(() => events.filter((event) => {
    if (highlightedOnly && !event.is_highlighted) return false;
    if (normalizedQuery.length === 0) return true;
    return [event.title, ...event.speakers.map((speaker) => speaker.name)]
      .some((value) => normalizeSearchValue(value).includes(normalizedQuery));
  }), [events, highlightedOnly, normalizedQuery]);

  const changeStatus = async (eventId: number, status: ContentStatus) => {
    if (!csrfToken) return;
    setPendingEventId(eventId);
    setError("");

    try {
      const { event } = await api.setEventStatus(eventId, status, csrfToken);
      setEvents((current) => current.map((item) => item.id === event.id ? event : item));
    } catch {
      setError(text.statusError);
    } finally {
      setPendingEventId(null);
    }
  };

  const deleteEvent = async (event: PublicEvent) => {
    if (!csrfToken || !window.confirm(text.deleteConfirm.replace("{title}", event.title))) return;
    setPendingEventId(event.id);
    setError("");

    try {
      await api.deleteEvent(event.id, csrfToken);
      setEvents((current) => current.filter((item) => item.id !== event.id));
    } catch {
      setError(text.deleteError);
    } finally {
      setPendingEventId(null);
    }
  };

  const toggleHighlighted = async (event: PublicEvent) => {
    if (!csrfToken) return;
    setPendingEventId(event.id);
    setError("");

    try {
      const isHighlighted = !event.is_highlighted;
      const { event: updated } = await api.setEventHighlighted(event.id, isHighlighted, csrfToken);
      setEvents((current) => current.map((item) => item.id === updated.id ? updated : isHighlighted ? { ...item, is_highlighted: false } : item));
    } catch {
      setError(text.highlightError);
    } finally {
      setPendingEventId(null);
    }
  };

  const statusLabel = (status: ContentStatus) => ({
    draft: text.draft,
    published: text.published,
    cancelled: text.cancelled,
  })[status];

  const actions: Array<{ status: ContentStatus; label: string }> = [
    { status: "draft", label: text.draftAction },
    { status: "published", label: text.publishAction },
    { status: "cancelled", label: text.cancelAction },
  ];

  return <AppShell><main className={styles.page}>
    <div className={styles.heading}>
      <PageHeader eyebrow={text.eyebrow} title={text.title} />
      <ButtonLink to="/admin/events/new">{text.add}</ButtonLink>
    </div>
    <div className={styles.filters}>
      <TextField label={text.from} type="date" value={from} onChange={(event) => setFrom(event.target.value)} required />
      <TextField label={text.to} type="date" value={to} onChange={(event) => setTo(event.target.value)} required />
      <div className={styles.search}><label htmlFor="admin-event-search">{text.searchLabel}</label><div className={styles.searchFilter}><input id="admin-event-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} /><HighlightFilter active={highlightedOnly} label={highlightedOnly ? text.showAll : text.showHighlighted} onToggle={() => setHighlightedOnly((value) => !value)} /></div></div>
    </div>
    {error && <Alert>{error}</Alert>}
    {loading ? <p className={styles.state}>{text.loading}</p> : filteredEvents.length === 0 ? <p className={styles.state}>{normalizedQuery || highlightedOnly ? text.noResults : text.empty}</p> : <div className={styles.list}>
      {filteredEvents.map((event) => <article className={styles.row} key={event.id}>
        {event.image_path
          ? <img className={styles.thumbnail} src={apiAssetUrl(event.image_path)} alt="" />
          : <div className={styles.fallback} aria-hidden="true"><span /><span /><span /></div>}
        <div className={styles.eventInfo}>
          <h2>{event.title}</h2>
          <p>{new Date(event.starts_at).toLocaleDateString(languageLocales[language])} · {statusLabel(event.status)}</p>
        </div>
        <div className={styles.actions}>
          <Button className={`${styles.star} ${event.is_highlighted ? styles.starActive : ""}`} variant="ghost" aria-label={event.is_highlighted ? text.unhighlight : text.highlight} aria-pressed={event.is_highlighted} disabled={pendingEventId === event.id} onClick={() => toggleHighlighted(event)}>{event.is_highlighted ? "★" : "☆"}</Button>
          {actions.map((action) => <Button className={styles.statusButton} variant="secondary" disabled={pendingEventId === event.id || event.status === action.status} onClick={() => changeStatus(event.id, action.status)} key={action.status}>{action.label}</Button>)}
          <ButtonLink to={`/admin/events/${event.id}/edit`} variant="secondary">{text.update}</ButtonLink>
          <Button variant="danger" disabled={pendingEventId === event.id} onClick={() => deleteEvent(event)}>{text.delete}</Button>
        </div>
      </article>)}
    </div>}
  </main></AppShell>;
}
