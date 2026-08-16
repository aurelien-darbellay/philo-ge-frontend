import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, apiAssetUrl, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button, ButtonLink } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { MarkdownEditor } from "../../components/ui/MarkdownEditor/MarkdownEditor";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { CycleInput } from "../../types";
import { adminCycleFormPageText } from "./AdminCycleFormPage.text";
import styles from "./AdminCycleFormPage.module.css";

type FormState = { title: string; description: string; startsOn: string; endsOn: string; imagePath: string | null };
const emptyForm = (): FormState => ({ title: "", description: "", startsOn: "", endsOn: "", imagePath: null });
const nullable = (value: string) => value.trim() || null;

export function AdminCycleFormPage() {
  const text = useText(adminCycleFormPageText);
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { csrfToken } = useAuth();
  const id = cycleId ? Number(cycleId) : null;
  const editing = id !== null;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const preview = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  useEffect(() => {
    let active = true;
    if (id === null) return () => { active = false; };
    api.adminCycle(id).then(({ cycle }) => { if (active) setForm({ title: cycle.title, description: cycle.description ?? "", startsOn: cycle.starts_on ?? "", endsOn: cycle.ends_on ?? "", imagePath: cycle.image_path }); }).catch(() => { if (active) setError(text.loadError); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, text.loadError]);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!csrfToken) return; setSubmitting(true); setError("");
    try {
      let imagePath = form.imagePath;
      if (imageFile) imagePath = (await api.uploadCycleImage(imageFile, csrfToken)).image_path;
      const payload: CycleInput = { title: form.title.trim(), description: nullable(form.description), starts_on: nullable(form.startsOn), ends_on: nullable(form.endsOn), image_path: imagePath };
      if (id === null) await api.createCycle(payload, csrfToken); else await api.updateCycle(id, payload, csrfToken);
      navigate("/admin/cycles");
    } catch (caught) { setError(caught instanceof ApiError && caught.code.startsWith("invalid_image") ? text.imageError : text.saveError); } finally { setSubmitting(false); }
  };

  if (loading) return <AppShell><main className={styles.page}><p className={styles.state}>{text.loading}</p></main></AppShell>;
  return <AppShell><main className={styles.page}><div className={styles.heading}><ButtonLink to="/admin/cycles" variant="secondary">{text.back}</ButtonLink><PageHeader eyebrow={text.eyebrow} title={editing ? text.editTitle : text.createTitle} /></div>{error && <Alert>{error}</Alert>}<Card className={styles.card}><form className={styles.form} onSubmit={submit}><section className={styles.section}><h2>{text.content}</h2><TextField label={text.title} value={form.title} onChange={(event) => setField("title", event.target.value)} maxLength={255} required /><MarkdownEditor label={text.description} value={form.description} onChange={(value) => setField("description", value)} /></section><section className={styles.section}><h2>{text.dates}</h2><div className={styles.twoColumns}><TextField label={text.startsOn} type="date" value={form.startsOn} onChange={(event) => setField("startsOn", event.target.value)} /><TextField label={text.endsOn} type="date" value={form.endsOn} onChange={(event) => setField("endsOn", event.target.value)} /></div></section><section className={styles.section}><h2>{text.image}</h2><p className={styles.hint}>{text.imageHint}</p><TextField label={text.imageFile} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />{(preview || form.imagePath) && <img className={styles.preview} src={preview ?? apiAssetUrl(form.imagePath ?? "")} alt="" />}</section><div className={styles.actions}><Button disabled={submitting}>{submitting ? text.saving : text.save}</Button><ButtonLink to="/admin/cycles" variant="secondary">{text.cancel}</ButtonLink></div></form></Card></main></AppShell>;
}
