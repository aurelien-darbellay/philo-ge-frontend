import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import defaultArtwork from "../../assets/brand/GGPh_Avatar_Insta_FB copie.jpg";
import { api, apiAssetUrl } from "../../api";
import { useAuth } from "../../AuthContext";
import { PodcastPlayer } from "../../components/podcasts/PodcastPlayer/PodcastPlayer";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button, ButtonLink } from "../../components/ui/Button/Button";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { Podcast, PodcastPagination } from "../../types";
import { adminPodcastsPageText } from "./AdminPodcastsPage.text";
import styles from "./AdminPodcastsPage.module.css";

const emptyPagination: PodcastPagination = { page: 1, limit: 20, total: 0, pages: 0 };

export function AdminPodcastsPage() {
  const text = useText(adminPodcastsPageText);
  const { language } = useLanguage();
  const { csrfToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedPage = searchParams.get("page") ?? "1";
  const page = /^[1-9][0-9]*$/.test(requestedPage) ? Number(requestedPage) : 1;
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [pagination, setPagination] = useState<PodcastPagination>(emptyPagination);
  const [activePodcastId, setActivePodcastId] = useState<number | null>(null);
  const [pendingPodcastId, setPendingPodcastId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api.podcasts(page, 20)
      .then((result) => { if (active) { setPodcasts(result.podcasts); setPagination(result.pagination); } })
      .catch(() => { if (active) setError(text.loadError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, text.loadError]);

  const deletePodcast = async (podcast: Podcast) => {
    if (!csrfToken || !window.confirm(text.deleteConfirm.replace("{title}", podcast.title))) return;
    setPendingPodcastId(podcast.id);
    setError("");
    try {
      await api.deletePodcast(podcast.id, csrfToken);
      if (podcasts.length === 1 && page > 1) navigate(`/admin/podcasts?page=${page - 1}`);
      else {
        setPodcasts((current) => current.filter((item) => item.id !== podcast.id));
        setPagination((current) => ({ ...current, total: Math.max(0, current.total - 1) }));
      }
    } catch {
      setError(text.deleteError);
    } finally {
      setPendingPodcastId(null);
    }
  };

  const dateFormatter = new Intl.DateTimeFormat(languageLocales[language], { dateStyle: "medium" });
  const sizeFormatter = new Intl.NumberFormat(languageLocales[language], { maximumFractionDigits: 1 });
  const pageLabel = text.page.replace("{page}", String(pagination.page)).replace("{pages}", String(pagination.pages));

  return <AppShell><main className={styles.page}>
    <div className={styles.heading}><PageHeader eyebrow={text.eyebrow} title={text.title} /><ButtonLink to="/admin/podcasts/new">{text.add}</ButtonLink></div>
    {error && <Alert>{error}</Alert>}
    {loading ? <p className={styles.state}>{text.loading}</p> : podcasts.length === 0 ? <p className={styles.state}>{text.empty}</p> : <div className={styles.list}>{podcasts.map((podcast) => <article className={styles.row} key={podcast.id}>
      <img className={styles.cover} src={podcast.image_path ? apiAssetUrl(podcast.image_path) : defaultArtwork} alt="" />
      <div className={styles.info}><h2>{podcast.title}</h2><p>{text.published} {dateFormatter.format(new Date(podcast.published_at))} · {sizeFormatter.format(podcast.file_size / 1_000_000)} {text.megabytes}</p></div>
      <div className={styles.player}><PodcastPlayer podcast={podcast} active={activePodcastId === podcast.id} onActivate={setActivePodcastId} compact /></div>
      <div className={styles.actions}><Button variant="danger" disabled={pendingPodcastId === podcast.id} onClick={() => deletePodcast(podcast)}>{text.delete}</Button></div>
    </article>)}</div>}
    {!loading && pagination.pages > 1 && <nav className={styles.pagination} aria-label={text.title}>
      <span>{pagination.page > 1 && <Link to={`/admin/podcasts?page=${pagination.page - 1}`}>← {text.previous}</Link>}</span>
      <span className={styles.pageNumber}>{pageLabel}</span>
      <span>{pagination.page < pagination.pages && <Link to={`/admin/podcasts?page=${pagination.page + 1}`}>{text.next} →</Link>}</span>
    </nav>}
  </main></AppShell>;
}
