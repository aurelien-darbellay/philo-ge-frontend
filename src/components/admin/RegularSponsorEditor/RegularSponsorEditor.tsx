import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, apiAssetUrl, ApiError } from "../../../api";
import { useText } from "../../../i18n/useText";
import type { RegularSponsor, RegularSponsorInput } from "../../../types";
import { Alert } from "../../ui/Alert/Alert";
import { Button } from "../../ui/Button/Button";
import { TextField } from "../../ui/TextField/TextField";
import { regularSponsorEditorText } from "./RegularSponsorEditor.text";
import styles from "./RegularSponsorEditor.module.css";

type SponsorDraft = {
  key: string;
  id: number | null;
  name: string;
  url: string;
  logoPath: string | null;
  logoFile: File | null;
};

const toDraft = (sponsor: RegularSponsor): SponsorDraft => ({ key: `sponsor-${sponsor.id}`, id: sponsor.id, name: sponsor.name, url: sponsor.url ?? "", logoPath: sponsor.logo_path, logoFile: null });
const newDraft = (): SponsorDraft => ({ key: `new-${crypto.randomUUID()}`, id: null, name: "", url: "", logoPath: null, logoFile: null });

function LogoPreview({ draft }: { draft: SponsorDraft }) {
  const localPreview = useMemo(() => draft.logoFile ? URL.createObjectURL(draft.logoFile) : null, [draft.logoFile]);
  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);
  const source = localPreview ?? (draft.logoPath ? apiAssetUrl(draft.logoPath) : null);
  return source ? <img className={styles.logoPreview} src={source} alt={draft.name} /> : null;
}

export function RegularSponsorEditor({ csrfToken }: { csrfToken: string }) {
  const text = useText(regularSponsorEditorText);
  const [drafts, setDrafts] = useState<SponsorDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<{ key: string; action: "save" | "remove" } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.adminRegularSponsors()
      .then(({ sponsors }) => { if (active) setDrafts(sponsors.map(toDraft)); })
      .catch(() => { if (active) setError(text.loadError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [text.loadError]);

  const setDraft = <K extends keyof SponsorDraft>(key: string, field: K, value: SponsorDraft[K]) => {
    setDrafts((current) => current.map((draft) => draft.key === key ? { ...draft, [field]: value } : draft));
  };

  const save = async (event: FormEvent, draft: SponsorDraft) => {
    event.preventDefault();
    setError("");
    setPending({ key: draft.key, action: "save" });
    try {
      let logoPath = draft.logoPath;
      if (draft.logoFile) logoPath = (await api.uploadRegularSponsorLogo(draft.logoFile, csrfToken)).image_path;
      if (!logoPath) {
        setError(text.logoRequired);
        return;
      }
      const payload: RegularSponsorInput = { name: draft.name.trim(), url: draft.url.trim() || null, logo_path: logoPath };
      const { sponsor } = draft.id === null
        ? await api.createRegularSponsor(payload, csrfToken)
        : await api.updateRegularSponsor(draft.id, payload, csrfToken);
      setDrafts((current) => current.map((item) => item.key === draft.key ? toDraft(sponsor) : item));
    } catch (caught) {
      setError(caught instanceof ApiError && caught.code.startsWith("invalid_image") ? text.imageError : text.saveError);
    } finally {
      setPending(null);
    }
  };

  const remove = async (draft: SponsorDraft) => {
    if (!window.confirm(text.deleteConfirm.replace("{name}", draft.name || text.title))) return;
    setError("");
    setPending({ key: draft.key, action: "remove" });
    try {
      if (draft.id !== null) await api.deleteRegularSponsor(draft.id, csrfToken);
      setDrafts((current) => current.filter((item) => item.key !== draft.key));
    } catch {
      setError(text.deleteError);
    } finally {
      setPending(null);
    }
  };

  return <section className={styles.editor}>
    <div className={styles.toolbar}><Button type="button" variant="secondary" onClick={() => setDrafts((current) => [...current, newDraft()])}>{text.add}</Button></div>
    {error && <Alert>{error}</Alert>}
    {loading
      ? <p className={styles.state}>{text.loading}</p>
      : <>{drafts.length === 0 && <p className={styles.empty}>{text.empty}</p>}<div className={styles.sponsors}>{drafts.map((draft) => <form className={styles.sponsor} onSubmit={(event) => save(event, draft)} key={draft.key}>
        <div className={styles.fields}>
          <TextField label={text.name} value={draft.name} onChange={(event) => setDraft(draft.key, "name", event.target.value)} maxLength={255} required />
          <TextField label={text.website} type="url" value={draft.url} onChange={(event) => setDraft(draft.key, "url", event.target.value)} maxLength={2048} />
          <TextField key={`${draft.key}-${draft.logoPath ?? "new"}`} label={text.logo} hint={text.logoHint} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setDraft(draft.key, "logoFile", event.target.files?.[0] ?? null)} />
        </div>
        <LogoPreview draft={draft} />
        <div className={styles.actions}><Button disabled={pending?.key === draft.key}>{pending?.key === draft.key && pending.action === "save" ? text.saving : text.save}</Button><Button type="button" variant="danger" disabled={pending?.key === draft.key} onClick={() => remove(draft)}>{pending?.key === draft.key && pending.action === "remove" ? text.removing : text.remove}</Button></div>
      </form>)}</div></>}
  </section>;
}
