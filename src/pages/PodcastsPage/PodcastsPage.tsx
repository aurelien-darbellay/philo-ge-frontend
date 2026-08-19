import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import defaultArtwork from "../../assets/brand/GGPh_Avatar_Insta_FB copie.jpg";
import { api, apiAssetUrl } from "../../api";
import { usePodcastPlayback } from "../../components/podcasts/PodcastPlayer/PodcastPlaybackContext";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { Button } from "../../components/ui/Button/Button";
import { LanguageSelector } from "../../components/ui/LanguageSelector/LanguageSelector";
import { useText } from "../../i18n/useText";
import type { Podcast, PodcastPagination } from "../../types";
import { podcastsPageText } from "./PodcastsPage.text";
import styles from "./PodcastsPage.module.css";

const emptyPagination: PodcastPagination = { page: 1, limit: 20, total: 0, pages: 0 };

export function PodcastsPage() {
  const text = useText(podcastsPageText);
  const { openPodcast } = usePodcastPlayback();
  const [searchParams] = useSearchParams();
  const requestedPage = searchParams.get("page") ?? "1";
  const page = /^[1-9][0-9]*$/.test(requestedPage) ? Number(requestedPage) : 1;
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [pagination, setPagination] = useState<PodcastPagination>(emptyPagination);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    api.podcasts(page, 20)
      .then((result) => { if (active) { setPodcasts(result.podcasts); setPagination(result.pagination); } })
      .catch(() => { if (active) { setPodcasts([]); setFailed(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  const pageLabel = text.page.replace("{page}", String(pagination.page)).replace("{pages}", String(pagination.pages));

  return <div className={styles.page}>
    <header className={styles.header}><Link to="/" aria-label={text.brand}><BrandMark compact /></Link><div className={styles.headerActions}><Link to="/">{text.home}</Link><Link to="/programme">{text.programme}</Link><LanguageSelector /></div></header>
    <main className={styles.main}>
      <div className={styles.heading}><h1>{text.title}</h1><p>{text.introduction}</p></div>
      {loading && <p className={styles.state} aria-live="polite">{text.loading}</p>}
      {failed && <div className={styles.state}><h2>{text.errorTitle}</h2><p>{text.errorBody}</p></div>}
      {!loading && !failed && podcasts.length === 0 && <p className={styles.state}>{text.empty}</p>}
      {!loading && !failed && podcasts.length > 0 && <div className={styles.list}>{podcasts.map((podcast) => <article className={styles.episode} key={podcast.id}>
        <img className={styles.cover} src={podcast.image_path ? apiAssetUrl(podcast.image_path) : defaultArtwork} alt="" />
        <div className={styles.content}>
          <h2><Link className={styles.titleLink} to={`/podcasts/${podcast.id}`} aria-label={text.episodeLink.replace("{title}", podcast.title)}>{podcast.title}</Link></h2>
          <Button className={styles.listen} type="button" onClick={() => openPodcast(podcast)}>{text.listen}</Button>
        </div>
      </article>)}</div>}
      {!loading && !failed && pagination.pages > 1 && <nav className={styles.pagination} aria-label={text.title}>
        {pagination.page > 1 ? <Link to={`/podcasts?page=${pagination.page - 1}`}>← {text.previous}</Link> : <span className={styles.disabled}>{text.previous}</span>}
        <span className={styles.pageNumber}>{pageLabel}</span>
        {pagination.page < pagination.pages ? <Link to={`/podcasts?page=${pagination.page + 1}`}>{text.next} →</Link> : <span className={styles.disabled}>{text.next}</span>}
      </nav>}
    </main>
  </div>;
}
