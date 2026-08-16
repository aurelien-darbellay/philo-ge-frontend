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
import type { AdminCycle, ContentStatus } from "../../types";
import { normalizeSearchValue } from "../../utils/normalizeSearchValue";
import { adminCyclesPageText } from "./AdminCyclesPage.text";
import styles from "./AdminCyclesPage.module.css";

const dateValue = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = new Date();
const oneYearFromToday = new Date(today);
oneYearFromToday.setFullYear(oneYearFromToday.getFullYear() + 1);

export function AdminCyclesPage() {
  const text = useText(adminCyclesPageText);
  const { language } = useLanguage();
  const { csrfToken } = useAuth();
  const [from, setFrom] = useState(dateValue(today));
  const [to, setTo] = useState(dateValue(oneYearFromToday));
  const [query, setQuery] = useState("");
  const [highlightedOnly, setHighlightedOnly] = useState(false);
  const [cycles, setCycles] = useState<AdminCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    if (to < from) { setCycles([]); setError(text.invalidDates); setLoading(false); return () => { active = false; }; }
    setLoading(true); setError("");
    api.adminCycles(from, to).then(({ cycles: value }) => { if (active) setCycles(value); }).catch(() => { if (active) setError(text.loadError); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [from, to, text.invalidDates, text.loadError]);

  const normalizedQuery = normalizeSearchValue(query.trim());
  const filtered = useMemo(() => cycles.filter((cycle) => (!highlightedOnly || cycle.is_highlighted) && (!normalizedQuery || normalizeSearchValue(cycle.title).includes(normalizedQuery))), [cycles, highlightedOnly, normalizedQuery]);
  const updateCycle = (updated: AdminCycle, clearHighlight = false) => setCycles((current) => current.map((cycle) => cycle.id === updated.id ? updated : clearHighlight ? { ...cycle, is_highlighted: false } : cycle));

  const changeStatus = async (cycle: AdminCycle, status: ContentStatus) => { if (!csrfToken) return; setPendingId(cycle.id); setError(""); try { updateCycle((await api.setCycleStatus(cycle.id, status, csrfToken)).cycle); } catch { setError(text.statusError); } finally { setPendingId(null); } };
  const toggleHighlight = async (cycle: AdminCycle) => { if (!csrfToken) return; setPendingId(cycle.id); setError(""); try { const highlighted = !cycle.is_highlighted; updateCycle((await api.setCycleHighlighted(cycle.id, highlighted, csrfToken)).cycle, highlighted); } catch { setError(text.highlightError); } finally { setPendingId(null); } };
  const deleteCycle = async (cycle: AdminCycle) => { if (!csrfToken || !window.confirm(text.deleteConfirm.replace("{title}", cycle.title))) return; setPendingId(cycle.id); setError(""); try { await api.deleteCycle(cycle.id, csrfToken); setCycles((current) => current.filter((item) => item.id !== cycle.id)); } catch { setError(text.deleteError); } finally { setPendingId(null); } };

  const labels = { draft: text.draft, published: text.published, cancelled: text.cancelled };
  const actions: Array<{ status: ContentStatus; label: string }> = [{ status: "draft", label: text.draftAction }, { status: "published", label: text.publishAction }, { status: "cancelled", label: text.cancelAction }];
  const formatter = new Intl.DateTimeFormat(languageLocales[language]);
  const dates = (cycle: AdminCycle) => cycle.starts_on || cycle.ends_on ? [cycle.starts_on, cycle.ends_on].filter(Boolean).map((date) => formatter.format(new Date(`${date}T00:00:00`))).join(" – ") : text.undated;

  return <AppShell><main className={styles.page}><div className={styles.heading}><PageHeader eyebrow={text.eyebrow} title={text.title} /><ButtonLink to="/admin/cycles/new">{text.add}</ButtonLink></div><div className={styles.filters}><TextField label={text.from} type="date" value={from} onChange={(event) => setFrom(event.target.value)} required /><TextField label={text.to} type="date" value={to} onChange={(event) => setTo(event.target.value)} required /><div className={styles.search}><label htmlFor="admin-cycle-search">{text.search}</label><div className={styles.searchFilter}><input id="admin-cycle-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} /><HighlightFilter active={highlightedOnly} label={highlightedOnly ? text.showAll : text.showHighlighted} onToggle={() => setHighlightedOnly((value) => !value)} /></div></div></div>{error && <Alert>{error}</Alert>}{loading ? <p className={styles.state}>{text.loading}</p> : filtered.length === 0 ? <p className={styles.state}>{normalizedQuery || highlightedOnly ? text.noResults : text.empty}</p> : <div className={styles.list}>{filtered.map((cycle) => <article className={styles.row} key={cycle.id}>{cycle.image_path ? <img className={styles.thumbnail} src={apiAssetUrl(cycle.image_path)} alt="" /> : <div className={styles.fallback} aria-hidden="true"><span /><span /><span /></div>}<div className={styles.info}><h2>{cycle.title}</h2><p>{dates(cycle)} · {labels[cycle.status]}</p></div><div className={styles.actions}><Button className={`${styles.star} ${cycle.is_highlighted ? styles.starActive : ""}`} variant="ghost" aria-label={cycle.is_highlighted ? text.unhighlight : text.highlight} aria-pressed={cycle.is_highlighted} disabled={pendingId === cycle.id} onClick={() => toggleHighlight(cycle)}>{cycle.is_highlighted ? "★" : "☆"}</Button>{actions.map((action) => <Button className={styles.statusButton} variant="secondary" disabled={pendingId === cycle.id || cycle.status === action.status} onClick={() => changeStatus(cycle, action.status)} key={action.status}>{action.label}</Button>)}<ButtonLink to={`/admin/cycles/${cycle.id}/edit`} variant="secondary">{text.update}</ButtonLink><Button variant="danger" disabled={pendingId === cycle.id} onClick={() => deleteCycle(cycle)}>{text.delete}</Button></div></article>)}</div>}</main></AppShell>;
}
