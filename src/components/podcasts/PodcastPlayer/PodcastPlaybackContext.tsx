import { createContext, useContext, useState, type ReactNode } from "react";
import type { Podcast } from "../../../types";
import { defineTextMap } from "../../../i18n/textMap";
import { useText } from "../../../i18n/useText";
import { PodcastPlayer } from "./PodcastPlayer";
import styles from "./PodcastPlaybackContext.module.css";

type PodcastPlaybackContextValue = {
  openPodcast: (podcast: Podcast) => void;
  closePodcast: () => void;
};

const PodcastPlaybackContext = createContext<PodcastPlaybackContextValue | null>(null);

const playerText = defineTextMap({
  fr: { close: "Fermer le lecteur" },
  de: { close: "Player schließen" },
  it: { close: "Chiudi il lettore" },
  en: { close: "Close player" },
});

export function PodcastPlaybackProvider({ children }: { children: ReactNode }) {
  const text = useText(playerText);
  const [podcast, setPodcast] = useState<Podcast | null>(null);

  return <PodcastPlaybackContext.Provider value={{ openPodcast: setPodcast, closePodcast: () => setPodcast(null) }}>
    {children}
    {podcast && <section className={styles.host} aria-label={podcast.title}>
      <button className={styles.close} type="button" aria-label={text.close} onClick={() => setPodcast(null)}>×</button>
      <PodcastPlayer podcast={podcast} active onActivate={() => undefined} />
    </section>}
  </PodcastPlaybackContext.Provider>;
}

export function usePodcastPlayback() {
  const context = useContext(PodcastPlaybackContext);
  if (!context) throw new Error("usePodcastPlayback must be used within PodcastPlaybackProvider");
  return context;
}
