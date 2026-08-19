import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button, ButtonLink } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { MarkdownEditor } from "../../components/ui/MarkdownEditor/MarkdownEditor";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import { adminPodcastFormPageText } from "./AdminPodcastFormPage.text";
import styles from "./AdminPodcastFormPage.module.css";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = 250 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/x-m4a"]);

export function AdminPodcastFormPage() {
  const text = useText(adminPodcastFormPageText);
  const { csrfToken } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!csrfToken || !audioFile) { setError(text.audioError); return; }
    if (!validAudio(audioFile)) { setError(text.audioError); return; }
    if (imageFile && !validImage(imageFile)) { setError(text.imageError); return; }
    setSubmitting(true);
    setError("");

    try {
      const imagePath = imageFile ? (await api.uploadPodcastImage(imageFile, csrfToken)).image_path : null;
      await api.createPodcast(title.trim(), description.trim(), imagePath, audioFile, csrfToken);
      navigate("/admin/podcasts");
    } catch (caught) {
      if (caught instanceof ApiError && caught.code.startsWith("invalid_image")) setError(text.imageError);
      else if (caught instanceof ApiError && caught.code.startsWith("invalid_audio")) setError(text.audioError);
      else setError(text.saveError);
    } finally {
      setSubmitting(false);
    }
  };

  return <AppShell><main className={styles.page}>
    <div className={styles.heading}><ButtonLink to="/admin/podcasts" variant="secondary">{text.back}</ButtonLink><PageHeader eyebrow={text.eyebrow} title={text.title} /></div>
    {error && <Alert>{error}</Alert>}
    <Card className={styles.card}><form className={styles.form} onSubmit={submit}>
      <section className={styles.section}><h2>{text.content}</h2><TextField label={text.titleLabel} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required /><MarkdownEditor label={text.description} value={description} onChange={setDescription} /></section>
      <section className={styles.section}><h2>{text.cover}</h2><p className={styles.hint}>{text.coverHint}</p><TextField label={text.coverFile} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage(event.target.files?.[0] ?? null)} />{preview && <img className={styles.preview} src={preview} alt="" />}</section>
      <section className={styles.section}><h2>{text.audio}</h2><p className={styles.hint}>{text.audioHint}</p><TextField label={text.audioFile} type="file" accept=".mp3,.m4a,audio/mpeg,audio/mp4" onChange={(event) => selectAudio(event.target.files?.[0] ?? null)} required />{audioFile && <p className={styles.filename}>{audioFile.name}</p>}</section>
      <div className={styles.actions}><Button disabled={submitting}>{submitting ? text.saving : text.save}</Button><ButtonLink to="/admin/podcasts" variant="secondary">{text.cancel}</ButtonLink></div>
    </form></Card>
  </main></AppShell>;
}
