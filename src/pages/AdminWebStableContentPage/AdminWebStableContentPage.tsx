import { useEffect, useState } from "react";
import { api, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextArea } from "../../components/ui/TextArea/TextArea";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { BecomeMemberContent } from "../../types";
import { adminWebStableContentPageText } from "./AdminWebStableContentPage.text";
import styles from "./AdminWebStableContentPage.module.css";

export function AdminWebStableContentPage() {
  const text = useText(adminWebStableContentPageText);
  const { csrfToken } = useAuth();
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [introFr, setIntroFr] = useState("");
  const [introDe, setIntroDe] = useState("");
  const [introIt, setIntroIt] = useState("");
  const [introEn, setIntroEn] = useState("");
  const [regQuota, setRegQuota] = useState("");
  const [reduceQuota, setReduceQuota] = useState("");

  const applyContent = (content: BecomeMemberContent) => {
    setIntroFr(content.intro_fr);
    setIntroDe(content.intro_de);
    setIntroIt(content.intro_it);
    setIntroEn(content.intro_en);
    setRegQuota(content.reg_quota.toFixed(2));
    setReduceQuota(content.reduce_quota.toFixed(2));
  };

  useEffect(() => {
    if (!editorOpen) return;

    let active = true;
    setLoading(true);
    setSaved(false);
    setError("");

    api.adminBecomeMemberContent()
      .then(({ content }) => {
        if (!active) return;
        applyContent(content);
      })
      .catch(() => {
        if (!active) return;
        setError(text.loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [editorOpen, text.loadError]);

  const onSave = async () => {
    if (!csrfToken || saving) return;
    const regular = Number(regQuota);
    const reduced = Number(reduceQuota);
    if (
      introFr.trim() === ""
      || introDe.trim() === ""
      || introIt.trim() === ""
      || introEn.trim() === ""
      || !Number.isFinite(regular)
      || !Number.isFinite(reduced)
      || regular < 0
      || reduced < 0
    ) {
      setError(text.invalid);
      setSaved(false);
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload: BecomeMemberContent = {
        intro_fr: introFr.trim(),
        intro_de: introDe.trim(),
        intro_it: introIt.trim(),
        intro_en: introEn.trim(),
        reg_quota: regular,
        reduce_quota: reduced,
      };
      const { content } = await api.updateAdminBecomeMemberContent(payload, csrfToken);
      applyContent(content);
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : text.saveError);
    } finally {
      setSaving(false);
    }
  };

  return <AppShell><main className={styles.page}>
    <PageHeader eyebrow={text.eyebrow} title={text.title} lead={text.lead} />
    <Card className={styles.sectionCard}>
      <h2>{text.sectionTitle}</h2>
      <p>{text.sectionBody}</p>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => setEditorOpen((open) => !open)}
        >
          {editorOpen ? text.closeEditor : text.openEditor}
        </Button>
      </div>

      {editorOpen && (loading
        ? <p className={styles.state}>{text.loading}</p>
        : <>
          {error && <Alert>{error}</Alert>}
          <div className={styles.form}>
            <div className={styles.introGrid}>
              <TextArea label={text.introFr} value={introFr} onChange={(event) => setIntroFr(event.target.value)} />
              <TextArea label={text.introDe} value={introDe} onChange={(event) => setIntroDe(event.target.value)} />
              <TextArea label={text.introIt} value={introIt} onChange={(event) => setIntroIt(event.target.value)} />
              <TextArea label={text.introEn} value={introEn} onChange={(event) => setIntroEn(event.target.value)} />
            </div>
            <div className={styles.quotaGrid}>
              <TextField label={text.regQuota} type="number" min="0" step="0.01" value={regQuota} onChange={(event) => setRegQuota(event.target.value)} />
              <TextField label={text.reduceQuota} type="number" min="0" step="0.01" value={reduceQuota} onChange={(event) => setReduceQuota(event.target.value)} />
            </div>
            <div className={styles.actions}>
              <Button onClick={onSave} disabled={saving}>{saving ? text.saving : text.save}</Button>
              {saved && <p className={styles.saved}>{text.saved}</p>}
            </div>
          </div>
        </>)}
    </Card>
  </main></AppShell>;
}
