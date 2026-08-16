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
import { TextArea } from "../../components/ui/TextArea/TextArea";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { AdminCycleSummary, EventInput } from "../../types";
import { adminEventFormPageText } from "./AdminEventFormPage.text";
import styles from "./AdminEventFormPage.module.css";

type SpeakerState = { name: string; roleLabel: string; affiliation: string; biography: string; imagePath: string | null };
type FormState = {
  cycleId: string;
  title: string;
  summary: string;
  description: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  venueName: string;
  venueAddress: string;
  onlineUrl: string;
  imagePath: string | null;
  speakers: SpeakerState[];
};

const emptySpeaker = (): SpeakerState => ({ name: "", roleLabel: "", affiliation: "", biography: "", imagePath: null });
const emptyForm = (): FormState => ({ cycleId: "", title: "", summary: "", description: "", startsAt: "", endsAt: "", timezone: "Europe/Zurich", venueName: "", venueAddress: "", onlineUrl: "", imagePath: null, speakers: [] });

const localDateTime = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const nullable = (value: string) => value.trim() || null;

const dateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = new Date();
const fiveYearsFromToday = new Date(today);
fiveYearsFromToday.setFullYear(fiveYearsFromToday.getFullYear() + 5);

export function AdminEventFormPage() {
  const text = useText(adminEventFormPageText);
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useAuth();
  const id = eventId ? Number(eventId) : null;
  const editing = id !== null;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [cycles, setCycles] = useState<AdminCycleSummary[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const localImagePreview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile]);
  useEffect(() => () => { if (localImagePreview) URL.revokeObjectURL(localImagePreview); }, [localImagePreview]);

  useEffect(() => {
    let active = true;
    const loadCycles = api.adminCycles(dateValue(today), dateValue(fiveYearsFromToday)).then(({ cycles: value }) => { if (active) setCycles(value); });
    const loadEvent = id === null ? Promise.resolve() : api.adminEvent(id).then(({ event }) => {
      if (!active) return;
      setForm({
        cycleId: event.cycle ? String(event.cycle.id) : "",
        title: event.title,
        summary: event.summary ?? "",
        description: event.description ?? "",
        startsAt: localDateTime(event.starts_at),
        endsAt: localDateTime(event.ends_at),
        timezone: event.timezone,
        venueName: event.venue.name ?? "",
        venueAddress: event.venue.address ?? "",
        onlineUrl: event.venue.online_url ?? "",
        imagePath: event.image_path,
        speakers: event.speakers.map((speaker) => ({ name: speaker.name, roleLabel: speaker.role_label ?? "", affiliation: speaker.affiliation ?? "", biography: speaker.biography ?? "", imagePath: speaker.image_path })),
      });
    });

    Promise.all([loadCycles, loadEvent])
      .catch(() => { if (active) setError(text.loadError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, text.loadError]);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));
  const setSpeaker = (index: number, field: keyof SpeakerState, value: string) => setForm((current) => ({ ...current, speakers: current.speakers.map((speaker, speakerIndex) => speakerIndex === index ? { ...speaker, [field]: value } : speaker) }));

  const message = (caught: unknown) => {
    if (caught instanceof ApiError && caught.code.startsWith("invalid_image")) return text.imageError;
    return text.saveError;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!csrfToken) return;
    setSubmitting(true);
    setError("");

    try {
      let imagePath = form.imagePath;
      if (imageFile) imagePath = (await api.uploadEventImage(imageFile, csrfToken)).image_path;
      const payload: EventInput = {
        cycle_id: form.cycleId ? Number(form.cycleId) : null,
        title: form.title.trim(),
        summary: nullable(form.summary),
        description: nullable(form.description),
        starts_at: new Date(form.startsAt).toISOString(),
        ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        timezone: form.timezone.trim(),
        venue_name: nullable(form.venueName),
        venue_address: nullable(form.venueAddress),
        online_url: nullable(form.onlineUrl),
        image_path: imagePath,
        speakers: form.speakers.filter((speaker) => speaker.name.trim()).map((speaker, displayOrder) => ({ name: speaker.name.trim(), role_label: nullable(speaker.roleLabel), affiliation: nullable(speaker.affiliation), biography: nullable(speaker.biography), image_path: speaker.imagePath, display_order: displayOrder })),
      };

      if (id === null) await api.createEvent(payload, csrfToken);
      else await api.updateEvent(id, payload, csrfToken);
      navigate("/admin/events");
    } catch (caught) {
      setError(message(caught));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AppShell><main className={styles.page}><p className={styles.state}>{text.loading}</p></main></AppShell>;

  return <AppShell><main className={styles.page}>
    <div className={styles.heading}><ButtonLink to="/admin/events" variant="secondary">{text.back}</ButtonLink><PageHeader eyebrow={text.eyebrow} title={editing ? text.editTitle : text.createTitle} /></div>
    {error && <Alert>{error}</Alert>}
    <Card className={styles.card}><form className={styles.form} onSubmit={submit}>
      <section className={styles.section}><h2>{text.identity}</h2><TextField label={text.title} value={form.title} onChange={(event) => setField("title", event.target.value)} maxLength={255} required /><TextArea label={text.summary} value={form.summary} onChange={(event) => setField("summary", event.target.value)} maxLength={300} /><MarkdownEditor label={text.description} value={form.description} onChange={(value) => setField("description", value)} /></section>
      <section className={styles.section}><h2>{text.schedule}</h2><div className={styles.twoColumns}><TextField label={text.startsAt} type="datetime-local" value={form.startsAt} onChange={(event) => setField("startsAt", event.target.value)} required /><TextField label={text.endsAt} type="datetime-local" value={form.endsAt} onChange={(event) => setField("endsAt", event.target.value)} /><TextField label={text.timezone} value={form.timezone} onChange={(event) => setField("timezone", event.target.value)} maxLength={64} required /><SelectField label={text.cycle} value={form.cycleId} onChange={(event) => setField("cycleId", event.target.value)}><option value="">{text.noCycle}</option>{cycles.map((cycle) => <option value={cycle.id} key={cycle.id}>{cycle.title}</option>)}</SelectField></div></section>
      <section className={styles.section}><h2>{text.location}</h2><div className={styles.twoColumns}><TextField label={text.venueName} value={form.venueName} onChange={(event) => setField("venueName", event.target.value)} maxLength={255} /><TextField label={text.onlineUrl} type="url" value={form.onlineUrl} onChange={(event) => setField("onlineUrl", event.target.value)} maxLength={1000} /></div><TextArea label={text.venueAddress} value={form.venueAddress} onChange={(event) => setField("venueAddress", event.target.value)} /></section>
      <section className={styles.section}><h2>{text.image}</h2><p className={styles.hint}>{text.imageHint}</p><TextField label={text.imageFile} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />{(localImagePreview || form.imagePath) && <img className={styles.preview} src={localImagePreview ?? apiAssetUrl(form.imagePath ?? "")} alt="" />}</section>
      <section className={styles.section}><div className={styles.sectionHeading}><h2>{text.speakers}</h2><Button type="button" variant="secondary" onClick={() => setField("speakers", [...form.speakers, emptySpeaker()])}>{text.addSpeaker}</Button></div>{form.speakers.length === 0 && <p className={styles.hint}>{text.noSpeakers}</p>}<div className={styles.speakers}>{form.speakers.map((speaker, index) => <div className={styles.speaker} key={index}><div className={styles.twoColumns}><TextField label={text.speakerName} value={speaker.name} onChange={(event) => setSpeaker(index, "name", event.target.value)} maxLength={255} required /><TextField label={text.speakerRole} value={speaker.roleLabel} onChange={(event) => setSpeaker(index, "roleLabel", event.target.value)} maxLength={100} /><TextField label={text.speakerAffiliation} value={speaker.affiliation} onChange={(event) => setSpeaker(index, "affiliation", event.target.value)} maxLength={255} /></div><TextArea label={text.speakerBiography} value={speaker.biography} onChange={(event) => setSpeaker(index, "biography", event.target.value)} /><Button type="button" variant="ghost" onClick={() => setField("speakers", form.speakers.filter((_, speakerIndex) => speakerIndex !== index))}>{text.removeSpeaker}</Button></div>)}</div></section>
      <div className={styles.formActions}><Button disabled={submitting}>{submitting ? text.saving : text.save}</Button><ButtonLink to="/admin/events" variant="secondary">{text.cancel}</ButtonLink></div>
    </form></Card>
  </main></AppShell>;
}
