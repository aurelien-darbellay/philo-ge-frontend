import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CycleShelf } from "../../components/archives/CycleShelf/CycleShelf";
import { EventShelf } from "../../components/programme/EventShelf/EventShelf";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { LanguageSelector } from "../../components/ui/LanguageSelector/LanguageSelector";
import { useArchives } from "../../hooks/useArchives";
import { useText } from "../../i18n/useText";
import type { PublicEvent } from "../../types";
import { normalizeSearchValue } from "../../utils/normalizeSearchValue";
import { archivesPageText } from "./ArchivesPage.text";
import styles from "./ArchivesPage.module.css";

function initialRange(): { from: string; to: string } {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);
  return { from: oneYearAgo.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
}

export function ArchivesPage() {
  const text = useText(archivesPageText);
  const [range, setRange] = useState(initialRange);
  const [query, setQuery] = useState("");
  const invalidRange = range.from > range.to;
  const { cycles, standaloneEvents, loading, failed } = useArchives(range.from, range.to);
  const normalizedQuery = normalizeSearchValue(query.trim());
  const eventMatches = (event: PublicEvent) => [event.title, ...event.speakers.map((speaker) => speaker.name)]
    .some((value) => normalizeSearchValue(value).includes(normalizedQuery));
  const filteredCycles = useMemo(() => cycles.filter((cycle) => normalizedQuery.length === 0 || [
    cycle.title,
    ...cycle.events.flatMap((event) => [event.title, ...event.speakers.map((speaker) => speaker.name)]),
  ].some((value) => normalizeSearchValue(value).includes(normalizedQuery))), [cycles, normalizedQuery]);
  const filteredStandaloneEvents = useMemo(
    () => normalizedQuery.length === 0 ? standaloneEvents : standaloneEvents.filter(eventMatches),
    [standaloneEvents, normalizedQuery],
  );
  const hasArchive = cycles.length > 0 || standaloneEvents.length > 0;
  const hasResults = filteredCycles.length > 0 || filteredStandaloneEvents.length > 0;
  const empty = !loading && !failed && !invalidRange && !hasArchive;

  return <div className={styles.page}>
    <header className={styles.header}><Link to="/" aria-label={text.brand}><BrandMark compact /></Link><div className={styles.headerActions}><Link to="/">{text.back}</Link><Link to="/programme">{text.programme}</Link><LanguageSelector /></div></header>
    <main className={styles.main}>
      <div className={styles.heading}>
        <div><h1>{text.title}</h1><p>{text.introduction}</p></div>
        <div className={styles.filters}>
          <div className={styles.range}>
            <label><span>{text.from}</span><input type="date" value={range.from} max={range.to} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))} /></label>
            <label><span>{text.to}</span><input type="date" value={range.to} min={range.from} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))} /></label>
          </div>
          <label className={styles.search}><span>{text.searchLabel}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} /></label>
        </div>
      </div>
      {invalidRange && <p className={styles.state}>{text.invalidRange}</p>}
      {loading && !invalidRange && <p className={styles.state} aria-live="polite">{text.loading}</p>}
      {failed && !invalidRange && <div className={styles.state}><h2>{text.errorTitle}</h2><p>{text.errorBody}</p></div>}
      {empty && <p className={styles.state}>{text.empty}</p>}
      {!loading && !failed && !invalidRange && hasArchive && !hasResults && <p className={styles.state}>{text.noResults}</p>}
      {!loading && !failed && !invalidRange && filteredCycles.length > 0 && <CycleShelf title={text.cycles} cycles={filteredCycles} />}
      {!loading && !failed && !invalidRange && filteredStandaloneEvents.length > 0 && <EventShelf title={text.standalone} events={filteredStandaloneEvents} />}
    </main>
  </div>;
}
