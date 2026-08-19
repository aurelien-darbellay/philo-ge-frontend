import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import defaultArtwork from "../../assets/brand/GGPh_Avatar_Insta_FB copie.jpg";
import { api, apiAssetUrl } from "../../api";
import { usePodcastPlayback } from "../../components/podcasts/PodcastPlayer/PodcastPlaybackContext";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { Button } from "../../components/ui/Button/Button";
import { LanguageSelector } from "../../components/ui/LanguageSelector/LanguageSelector";
import { MarkdownContent } from "../../components/ui/MarkdownContent/MarkdownContent";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import type { Podcast } from "../../types";
import { podcastPageText } from "./PodcastPage.text";
import styles from "./PodcastPage.module.css";

export function PodcastPage() {
  const text = useText(podcastPageText);
  const { openPodcast } = usePodcastPlayback();
  const { language } = useLanguage();
  const { podcastId } = useParams();
  const id = podcastId && /^[1-9][0-9]*$/.test(podcastId) ? Number(podcastId) : null;
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [failed, setFailed] = useState(id === null);

  useEffect(() => {
    let active = true;
    if (id === null) return () => { active = false; };
    setLoading(true);
    setFailed(false);
    api.podcast(id)
      .then(({ podcast: value }) => { if (active) setPodcast(value); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const dateFormatter = new Intl.DateTimeFormat(languageLocales[language], { dateStyle: "long" });
  const sizeFormatter = new Intl.NumberFormat(languageLocales[language], { maximumFractionDigits: 1 });

  return <div className={styles.page}>
    <header className={styles.header}><Link to="/" aria-label={text.brand}><BrandMark compact /></Link><div className={styles.headerActions}><Link to="/">{text.home}</Link><Link to="/podcasts">{text.allPodcasts}</Link><LanguageSelector /></div></header>
    <main className={styles.main}>
      <Link className={styles.back} to="/podcasts">← {text.back}</Link>
      {loading && <p className={styles.state} aria-live="polite">{text.loading}</p>}
      {failed && !loading && <div className={styles.state}><h1>{text.errorTitle}</h1><p>{text.errorBody}</p></div>}
      {podcast && !loading && !failed && <article className={styles.episode}>
        <img className={styles.cover} src={podcast.image_path ? apiAssetUrl(podcast.image_path) : defaultArtwork} alt="" />
        <div className={styles.content}>
          <p className={styles.meta}>{text.published} {dateFormatter.format(new Date(podcast.published_at))} · {sizeFormatter.format(podcast.file_size / 1_000_000)} {text.megabytes}</p>
          <h1>{podcast.title}</h1>
          <Button type="button" onClick={() => openPodcast(podcast)}>{text.listen}</Button>
          {podcast.description && <MarkdownContent value={podcast.description} />}
        </div>
      </article>}
    </main>
  </div>;
}
