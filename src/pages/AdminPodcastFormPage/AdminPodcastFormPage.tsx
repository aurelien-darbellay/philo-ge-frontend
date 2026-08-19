import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, apiAssetUrl, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button, ButtonLink } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { MarkdownEditor } from "../../components/ui/MarkdownEditor/MarkdownEditor";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { SelectField } from "../../components/ui/SelectField/SelectField";
import { TextField } from "../../components/ui/TextField/TextField";
import { defineTextMap } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import { adminPodcastFormPageText } from "./AdminPodcastFormPage.text";
import styles from "./AdminPodcastFormPage.module.css";
import type { PodcastPodcasterInput, PodcastPodcasterRole } from "../../types";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = 250 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/x-m4a"]);
const formModeText = defineTextMap({
  fr: { editTitle: "Modifier le podcast.", loading: "Chargement du podcast…", loadError: "Impossible de charger le podcast.", podcasters: "Podcasteurs", addPodcaster: "+ Ajouter", noPodcasters: "Aucun podcasteur.", podcasterName: "Nom", podcasterRole: "Rôle", facilitator: "Facilitateur", speaker: "Intervenant", removePodcaster: "Retirer", saveChanges: "Enregistrer", savingChanges: "Enregistrement…" },
  de: { editTitle: "Podcast bearbeiten.", loading: "Podcast wird geladen…", loadError: "Der Podcast konnte nicht geladen werden.", podcasters: "Podcast-Mitwirkende", addPodcaster: "+ Hinzufügen", noPodcasters: "Keine Mitwirkenden.", podcasterName: "Name", podcasterRole: "Rolle", facilitator: "Moderation", speaker: "Gast", removePodcaster: "Entfernen", saveChanges: "Speichern", savingChanges: "Wird gespeichert…" },
  it: { editTitle: "Modifica il podcast.", loading: "Caricamento del podcast…", loadError: "Impossibile caricare il podcast.", podcasters: "Partecipanti", addPodcaster: "+ Aggiungi", noPodcasters: "Nessun partecipante.", podcasterName: "Nome", podcasterRole: "Ruolo", facilitator: "Facilitatore", speaker: "Ospite", removePodcaster: "Rimuovi", saveChanges: "Salva", savingChanges: "Salvataggio…" },
  en: { editTitle: "Update the podcast.", loading: "Loading podcast…", loadError: "Could not load the podcast.", podcasters: "Podcasters", addPodcaster: "+ Add", noPodcasters: "No podcasters.", podcasterName: "Name", podcasterRole: "Role", facilitator: "Facilitator", speaker: "Speaker", removePodcaster: "Remove", saveChanges: "Save", savingChanges: "Saving…" },
});

export function AdminPodcastFormPage() {
  const text = useText(adminPodcastFormPageText);
  const modeText = useText(formModeText);
  const { csrfToken } = useAuth();
  const navigate = useNavigate();
  const { podcastId } = useParams();
  const id = podcastId && /^[1-9][0-9]*$/.test(podcastId) ? Number(podcastId) : null;
  const editing = podcastId !== undefined;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [podcasters, setPodcasters] = useState<PodcastPodcasterInput[]>([]);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    if (!editing) return;
    if (id === null) { setError(modeText.loadError); setLoading(false); return; }
    let active = true;
    api.podcast(id)
      .then(({ podcast }) => { if (active) { setTitle(podcast.title); setDescription(podcast.description ?? ""); setImagePath(podcast.image_path); setPodcasters(podcast.podcasters.map(({ name, role }) => ({ name, role }))); } })
      .catch(() => { if (active) setError(modeText.loadError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editing, id, modeText.loadError]);

  const validImage = (file: File) => file.size > 0 && file.size <= MAX_IMAGE_BYTES && IMAGE_TYPES.has(file.type);
  const validAudio = (file: File) => {
    const validExtension = /\.(?:mp3|m4a)$/i.test(file.name);
    return file.size > 0 && file.size <= MAX_AUDIO_BYTES && validExtension && (file.type === "" || AUDIO_TYPES.has(file.type));
  };

  const selectImage = (file: File | null) => {
    if (file && !validImage(file)) { setImageFile(null); setError(text.imageError); return; }
    setImageFile(file);
    setError("");
  };

  const selectAudio = (file: File | null) => {
    if (file && !validAudio(file)) { setAudioFile(null); setError(text.audioError); return; }
    setAudioFile(file);
    setError("");
  };

  const setPodcaster = (index: number, field: "name" | "role", value: string) => setPodcasters((current) => current.map((podcaster, podcasterIndex) => podcasterIndex === index ? { ...podcaster, [field]: value } as PodcastPodcasterInput : podcaster));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!csrfToken || (!editing && !audioFile)) { setError(text.audioError); return; }
    if (audioFile && !validAudio(audioFile)) { setError(text.audioError); return; }
    if (imageFile && !validImage(imageFile)) { setError(text.imageError); return; }
    setSubmitting(true);
    setError("");

    try {
      const nextImagePath = imageFile ? (await api.uploadPodcastImage(imageFile, csrfToken)).image_path : imagePath;
      const metadata = { title: title.trim(), description: description.trim() || null, image_path: nextImagePath, podcasters: podcasters.filter((podcaster) => podcaster.name.trim()).map((podcaster) => ({ ...podcaster, name: podcaster.name.trim() })) };
      if (editing && id !== null) await api.updatePodcast(id, metadata, csrfToken);
      else await api.createPodcast(metadata.title, metadata.description ?? "", metadata.image_path, metadata.podcasters, audioFile!, csrfToken);
      navigate("/admin/podcasts");
    } catch (caught) {
      if (caught instanceof ApiError && caught.code.startsWith("invalid_image")) setError(text.imageError);
      else if (caught instanceof ApiError && caught.code.startsWith("invalid_audio")) setError(text.audioError);
      else setError(text.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AppShell><main className={styles.page}><p className={styles.hint}>{modeText.loading}</p></main></AppShell>;

  return <AppShell><main className={styles.page}>
    <div className={styles.heading}><ButtonLink to="/admin/podcasts" variant="secondary">{text.back}</ButtonLink><PageHeader eyebrow={text.eyebrow} title={editing ? modeText.editTitle : text.title} /></div>
    {error && <Alert>{error}</Alert>}
    <Card className={styles.card}><form className={styles.form} onSubmit={submit}>
      <section className={styles.section}><h2>{text.content}</h2><TextField label={text.titleLabel} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required /><MarkdownEditor label={text.description} value={description} onChange={setDescription} /></section>
      <section className={styles.section}><div className={styles.sectionHeading}><h2>{modeText.podcasters}</h2><Button type="button" variant="secondary" onClick={() => setPodcasters((current) => [...current, { name: "", role: "speaker" }])}>{modeText.addPodcaster}</Button></div>{podcasters.length === 0 && <p className={styles.hint}>{modeText.noPodcasters}</p>}<div className={styles.podcasters}>{podcasters.map((podcaster, index) => <div className={styles.podcaster} key={index}><TextField label={modeText.podcasterName} value={podcaster.name} onChange={(event) => setPodcaster(index, "name", event.target.value)} maxLength={255} required /><SelectField label={modeText.podcasterRole} value={podcaster.role} onChange={(event) => setPodcaster(index, "role", event.target.value as PodcastPodcasterRole)}><option value="facilitator">{modeText.facilitator}</option><option value="speaker">{modeText.speaker}</option></SelectField><Button type="button" variant="ghost" onClick={() => setPodcasters((current) => current.filter((_, podcasterIndex) => podcasterIndex !== index))}>{modeText.removePodcaster}</Button></div>)}</div></section>
      <section className={styles.section}><h2>{text.cover}</h2><p className={styles.hint}>{text.coverHint}</p><TextField label={text.coverFile} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage(event.target.files?.[0] ?? null)} />{(preview || imagePath) && <img className={styles.preview} src={preview ?? apiAssetUrl(imagePath!)} alt="" />}</section>
      {!editing && <section className={styles.section}><h2>{text.audio}</h2><p className={styles.hint}>{text.audioHint}</p><TextField label={text.audioFile} type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4" onChange={(event) => selectAudio(event.target.files?.[0] ?? null)} required />{audioFile && <p className={styles.filename}>{audioFile.name}</p>}</section>}
      <div className={styles.actions}><Button disabled={submitting}>{submitting ? (editing ? modeText.savingChanges : text.saving) : (editing ? modeText.saveChanges : text.save)}</Button><ButtonLink to="/admin/podcasts" variant="secondary">{text.cancel}</ButtonLink></div>
    </form></Card>
  </main></AppShell>;
}
