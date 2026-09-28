import { useEffect, useState, type FormEvent } from "react";
import { ArchiveResultList } from "../../components/archives/ArchiveResultList/ArchiveResultList";
import { PublicHeader } from "../../components/public/PublicHeader/PublicHeader";
import { Button } from "../../components/ui/Button/Button";
import { useArchives } from "../../hooks/useArchives";
import { useText } from "../../i18n/useText";
import type { ArchiveSearchQuery } from "../../types";
import { archivesPageText } from "./ArchivesPage.text";
import styles from "./ArchivesPage.module.css";

type ArchiveDraft = { from: string; to: string; title: string; speaker: string; cyclesOnly: boolean };

function initialQuery(): ArchiveDraft {
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - 365);
  return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10), title: "", speaker: "", cyclesOnly: false };
}

export function ArchivesPage() {
  const text = useText(archivesPageText);
  const [query, setQuery] = useState<ArchiveSearchQuery>(initialQuery);
  const [draft, setDraft] = useState<ArchiveDraft>(initialQuery);
  const invalidRange = draft.from > draft.to;
  const { results, range, total, page, pages, loading, failed } = useArchives(query);
  const visibleResults = draft.cyclesOnly ? results.filter((result) => result.type === "cycle") : results;
  const visibleTotal = draft.cyclesOnly ? visibleResults.length : total;
  const hasFilters = Boolean(query.title || query.speaker || draft.cyclesOnly);

  useEffect(() => {
    if (range) setDraft((current) => ({ ...current, from: range.from, to: range.to }));
  }, [range]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (invalidRange) return;
    setQuery({ from: draft.from, to: draft.to, title: draft.title.trim(), speaker: draft.speaker.trim(), page: 1 });
  };

  const loadPage = (nextPage: number) => setQuery((current) => ({ ...current, page: nextPage }));
  const canLoadOlder = page < pages;
  const canLoadNewer = page > 1;

  return <div className={styles.page}>
    <PublicHeader />
    <main className={styles.main}>
      <div className={styles.heading}>
        <div><h1>{text.title}</h1><p>{text.introduction}</p></div>
        <form className={styles.filters} onSubmit={submit}>
          <div className={styles.textFilters}>
            <label><span>{text.titleLabel}</span><input type="search" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder={text.titlePlaceholder} /></label>
            <label><span>{text.speakerLabel}</span><input type="search" value={draft.speaker} onChange={(event) => setDraft((current) => ({ ...current, speaker: event.target.value }))} placeholder={text.speakerPlaceholder} /></label>
          </div>
          <div className={styles.range}>
            <label><span>{text.from}</span><input type="date" value={draft.from} max={draft.to} required onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))} /></label>
            <label><span>{text.to}</span><input type="date" value={draft.to} min={draft.from} required onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))} /></label>
          </div>
          <div className={styles.searchActions}><Button className={draft.cyclesOnly ? styles.cycleToggleActive : styles.cycleToggle} type="button" variant="secondary" aria-pressed={draft.cyclesOnly} onClick={() => setDraft((current) => ({ ...current, cyclesOnly: !current.cyclesOnly }))}>{text.cyclesOnly}</Button><Button disabled={invalidRange || loading}>{loading ? text.searching : text.search}</Button></div>
        </form>
      </div>
      {invalidRange && <p className={styles.state}>{text.invalidRange}</p>}
      {loading && !invalidRange && <p className={styles.state} aria-live="polite">{text.loading}</p>}
      {failed && !invalidRange && <div className={styles.state}><h2>{text.errorTitle}</h2><p>{text.errorBody}</p></div>}
      {!loading && !failed && !invalidRange && visibleResults.length === 0 && <p className={styles.state}>{hasFilters ? text.noResults : text.empty}</p>}
      {!loading && !failed && !invalidRange && visibleResults.length > 0 && <>
        <div className={styles.resultsHeading}><p>{text.resultCount.replace("{count}", String(visibleTotal))}</p><p>{text.page.replace("{page}", String(page)).replace("{pages}", String(pages))}</p></div>
        <ArchiveResultList results={visibleResults} />
      </>}
      {!loading && !failed && !invalidRange && <>
        <nav className={styles.navigation} aria-label={text.navigation}>
          <Button type="button" variant="secondary" disabled={!canLoadOlder} onClick={() => loadPage(page + 1)}>← {text.older}</Button>
          <Button type="button" variant="secondary" disabled={!canLoadNewer} onClick={() => loadPage(page - 1)}>{text.newer} →</Button>
        </nav>
      </>}
    </main>
  </div>;
}
