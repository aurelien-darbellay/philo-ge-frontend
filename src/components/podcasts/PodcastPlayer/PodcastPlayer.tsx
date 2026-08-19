import { useEffect, useRef, useState } from "react";
import defaultArtwork from "../../../assets/brand/GGPh_Avatar_Insta_FB copie.jpg";
import { apiAssetUrl } from "../../../api";
import { Button } from "../../ui/Button/Button";
import { useText } from "../../../i18n/useText";
import type { Podcast } from "../../../types";
import { podcastPlayerText } from "./PodcastPlayer.text";
import styles from "./PodcastPlayer.module.css";

let activeMediaPodcastId: number | null = null;
const PLAYBACK_STORAGE_PREFIX = "philo-ge:podcast-playback:";

type SavedPlayback = {
  audioPath: string;
  position: number;
  playbackRate: number;
  savedAt: number;
};

type PodcastPlayerProps = {
  podcast: Podcast;
  active: boolean;
  onActivate: (podcastId: number) => void;
  compact?: boolean;
};

export function PodcastPlayer({ podcast, active, onActivate, compact = false }: PodcastPlayerProps) {
  const text = useText(podcastPlayerText);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (!active) audioRef.current?.pause();
  }, [active]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const updateRate = () => setPlaybackRate(audio.playbackRate);
    const markPlaying = () => setPlaying(true);
    const markPaused = () => setPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ratechange", updateRate);
    audio.addEventListener("play", markPlaying);
    audio.addEventListener("pause", markPaused);
    audio.addEventListener("ended", markPaused);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ratechange", updateRate);
      audio.removeEventListener("play", markPlaying);
      audio.removeEventListener("pause", markPaused);
      audio.removeEventListener("ended", markPaused);
    };
  }, [podcast.audio_path]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const storageKey = `${PLAYBACK_STORAGE_PREFIX}${podcast.id}`;
    let lastSavedAt = 0;
    let restored = false;

    const save = (force = false) => {
      const now = Date.now();
      if (!force && now - lastSavedAt < 5_000) return;
      if (!Number.isFinite(audio.currentTime) || audio.currentTime <= 0) return;

      try {
        const playback: SavedPlayback = {
          audioPath: podcast.audio_path,
          position: audio.currentTime,
          playbackRate: audio.playbackRate,
          savedAt: now,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(playback));
        lastSavedAt = now;
      } catch { /* Playback persistence is optional. */ }
    };

    const restore = () => {
      if (restored) return;
      restored = true;

      try {
        const value = window.localStorage.getItem(storageKey);
        if (!value) return;
        const playback = JSON.parse(value) as Partial<SavedPlayback>;
        const validPosition = typeof playback.position === "number" && Number.isFinite(playback.position) && playback.position > 0;
        const validRate = typeof playback.playbackRate === "number" && Number.isFinite(playback.playbackRate) && playback.playbackRate >= 0.5 && playback.playbackRate <= 4;

        if (playback.audioPath !== podcast.audio_path || !validPosition || !Number.isFinite(audio.duration) || playback.position! >= audio.duration - 5) {
          window.localStorage.removeItem(storageKey);
          return;
        }

        audio.currentTime = playback.position!;
        setCurrentTime(playback.position!);
        if (validRate) audio.playbackRate = playback.playbackRate!;
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    };

    const finish = () => {
      try { window.localStorage.removeItem(storageKey); } catch { /* Playback persistence is optional. */ }
    };
    const saveForced = () => save(true);
    const savePeriodic = () => save();

    audio.addEventListener("loadedmetadata", restore);
    audio.addEventListener("timeupdate", savePeriodic);
    audio.addEventListener("pause", saveForced);
    audio.addEventListener("ended", finish);
    window.addEventListener("pagehide", saveForced);
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) restore();

    return () => {
      save(true);
      audio.removeEventListener("loadedmetadata", restore);
      audio.removeEventListener("timeupdate", savePeriodic);
      audio.removeEventListener("pause", saveForced);
      audio.removeEventListener("ended", finish);
      window.removeEventListener("pagehide", saveForced);
    };
  }, [podcast.audio_path, podcast.id]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!active || !audio || !("mediaSession" in navigator)) return;

    activeMediaPodcastId = podcast.id;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: podcast.title,
      artist: text.artist,
      album: text.album,
      artwork: [{ src: podcast.image_path ? apiAssetUrl(podcast.image_path) : new URL(defaultArtwork, window.location.origin).href }],
    });

    const play = () => { void audio.play(); };
    const pause = () => audio.pause();
    const seekBackward = (details: MediaSessionActionDetails) => {
      audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset ?? 10));
    };
    const seekForward = (details: MediaSessionActionDetails) => {
      audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + (details.seekOffset ?? 10));
    };
    const seekTo = (details: MediaSessionActionDetails) => {
      if (details.seekTime !== undefined) audio.currentTime = details.seekTime;
    };
    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ["play", play],
      ["pause", pause],
      ["seekbackward", seekBackward],
      ["seekforward", seekForward],
      ["seekto", seekTo],
    ];

    for (const [action, handler] of handlers) {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* Unsupported action. */ }
    }

    const updatePosition = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: Math.min(audio.currentTime, audio.duration),
        });
      } catch { /* Position state is optional. */ }
    };

    audio.addEventListener("durationchange", updatePosition);
    audio.addEventListener("timeupdate", updatePosition);
    audio.addEventListener("ratechange", updatePosition);

    return () => {
      audio.removeEventListener("durationchange", updatePosition);
      audio.removeEventListener("timeupdate", updatePosition);
      audio.removeEventListener("ratechange", updatePosition);

      if (activeMediaPodcastId !== podcast.id) return;
      activeMediaPodcastId = null;
      navigator.mediaSession.metadata = null;
      for (const [action] of handlers) {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* Unsupported action. */ }
      }
    };
  }, [active, podcast, text.album, text.artist]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration || Infinity, audio.currentTime + seconds));
  };

  const seekTo = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const setAudioPlaybackRate = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = value;
  };

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const rounded = Math.floor(seconds);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const remainingSeconds = String(rounded % 60).padStart(2, "0");
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${remainingSeconds}` : `${minutes}:${remainingSeconds}`;
  };

  return <div className={`${styles.player} ${compact ? styles.compact : ""}`}>
    <audio ref={audioRef} className={styles.audio} src={apiAssetUrl(podcast.audio_path)} controlsList="nodownload" preload="metadata" onPlay={() => onActivate(podcast.id)}>{text.unsupported}</audio>
    <div className={styles.titleDisplay} title={podcast.title}><span>{podcast.title}</span></div>
    <label className={styles.speedGroup}><select className={styles.speed} value={playbackRate} aria-label={text.speed} onChange={(event) => setAudioPlaybackRate(Number(event.target.value))}><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label>
    <div className={styles.times}>
      <span aria-label={`${text.elapsed}: ${formatTime(currentTime)}`}>{formatTime(currentTime)}</span>
      <div className={styles.commands}>
        <Button className={styles.command} type="button" variant="secondary" aria-label={text.backward} onClick={() => seekBy(-10)}>−10</Button>
        <Button className={`${styles.command} ${styles.play}`} type="button" aria-label={playing ? text.pause : text.play} aria-pressed={playing} onClick={togglePlayback}><span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span></Button>
        <Button className={styles.command} type="button" variant="secondary" aria-label={text.forward} onClick={() => seekBy(10)}>+10</Button>
      </div>
      <span aria-label={`${text.total}: ${formatTime(duration)}`}>{formatTime(duration)}</span>
    </div>
    <input className={styles.progress} type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} aria-label={text.progress} disabled={duration <= 0} onChange={(event) => seekTo(Number(event.target.value))} />
  </div>;
}
