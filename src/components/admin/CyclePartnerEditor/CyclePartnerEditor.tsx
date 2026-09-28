import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, apiAssetUrl, ApiError } from "../../../api";
import { useText } from "../../../i18n/useText";
import type { CyclePartner, CyclePartnerInput } from "../../../types";
import { Alert } from "../../ui/Alert/Alert";
import { Button } from "../../ui/Button/Button";
import { TextField } from "../../ui/TextField/TextField";
import { cyclePartnerEditorText } from "./CyclePartnerEditor.text";
import styles from "./CyclePartnerEditor.module.css";

type PartnerDraft = {
  key: string;
  id: number | null;
  name: string;
  websiteUrl: string;
  displayOrder: number;
  logoPath: string | null;
  logoFile: File | null;
};

const sortPartners = (partners: CyclePartner[]) => [...partners].sort((left, right) => left.display_order - right.display_order || left.id - right.id);
const toDraft = (partner: CyclePartner): PartnerDraft => ({ key: `partner-${partner.id}`, id: partner.id, name: partner.name, websiteUrl: partner.website_url ?? "", displayOrder: partner.display_order, logoPath: partner.logo_path, logoFile: null });
const newDraft = (): PartnerDraft => ({ key: `new-${crypto.randomUUID()}`, id: null, name: "", websiteUrl: "", displayOrder: 0, logoPath: null, logoFile: null });
const sortDrafts = (drafts: PartnerDraft[]) => [...drafts].sort((left, right) => left.displayOrder - right.displayOrder || (left.id ?? Number.MAX_SAFE_INTEGER) - (right.id ?? Number.MAX_SAFE_INTEGER));

function LogoPreview({ draft }: { draft: PartnerDraft }) {
  const localPreview = useMemo(() => draft.logoFile ? URL.createObjectURL(draft.logoFile) : null, [draft.logoFile]);
  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview); }, [localPreview]);
  const source = localPreview ?? (draft.logoPath ? apiAssetUrl(draft.logoPath) : null);
  return source ? <img className={styles.logoPreview} src={source} alt={draft.name} /> : null;
}

export function CyclePartnerEditor({ cycleId, csrfToken, initialPartners }: { cycleId: number; csrfToken: string; initialPartners: CyclePartner[] }) {
  const text = useText(cyclePartnerEditorText);
  const [drafts, setDrafts] = useState<PartnerDraft[]>(() => sortPartners(initialPartners).map(toDraft));
  const [pending, setPending] = useState<{ key: string; action: "save" | "remove" } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => setDrafts(sortPartners(initialPartners).map(toDraft)), [initialPartners]);

  const setDraft = <K extends keyof PartnerDraft>(key: string, field: K, value: PartnerDraft[K]) => {
    setDrafts((current) => current.map((draft) => draft.key === key ? { ...draft, [field]: value } : draft));
  };

  const save = async (event: FormEvent, draft: PartnerDraft) => {
    event.preventDefault();
    setError("");
    setPending({ key: draft.key, action: "save" });

    try {
      let logoPath = draft.logoPath;
      if (draft.logoFile) logoPath = (await api.uploadCycleImage(draft.logoFile, csrfToken)).image_path;
      if (!logoPath) {
        setError(text.logoRequired);
        return;
      }

      const payload: CyclePartnerInput = { name: draft.name.trim(), logo_path: logoPath, website_url: draft.websiteUrl.trim() || null, display_order: draft.displayOrder };
      const { partner } = draft.id === null
        ? await api.createCyclePartner(cycleId, payload, csrfToken)
        : await api.updateCyclePartner(draft.id, payload, csrfToken);
      setDrafts((current) => sortDrafts(current.map((item) => item.key === draft.key ? toDraft(partner) : item)));
    } catch (caught) {
      setError(caught instanceof ApiError && caught.code.startsWith("invalid_image") ? text.imageError : text.saveError);
    } finally {
      setPending(null);
    }
  };

  const remove = async (draft: PartnerDraft) => {
    if (!window.confirm(text.deleteConfirm.replace("{name}", draft.name || text.title))) return;
    setError("");
    setPending({ key: draft.key, action: "remove" });

    try {
      if (draft.id !== null) await api.deleteCyclePartner(draft.id, csrfToken);
      setDrafts((current) => current.filter((item) => item.key !== draft.key));
    } catch {
      setError(text.deleteError);
    } finally {
      setPending(null);
    }
  };

  return <section className={styles.editor}>
    <div className={styles.heading}><div><h2>{text.title}</h2><p>{text.introduction}</p></div><Button type="button" variant="secondary" onClick={() => setDrafts((current) => [...current, newDraft()])}>{text.add}</Button></div>
    {error && <Alert>{error}</Alert>}
    {drafts.length === 0 && <p className={styles.empty}>{text.empty}</p>}
    <div className={styles.partners}>{drafts.map((draft) => <form className={styles.partner} onSubmit={(event) => save(event, draft)} key={draft.key}>
      <div className={styles.fields}>
        <TextField label={text.name} value={draft.name} onChange={(event) => setDraft(draft.key, "name", event.target.value)} maxLength={255} required />
        <TextField label={text.website} type="url" value={draft.websiteUrl} onChange={(event) => setDraft(draft.key, "websiteUrl", event.target.value)} maxLength={2048} />
        <TextField label={text.order} type="number" min={0} max={2147483647} value={draft.displayOrder} onChange={(event) => setDraft(draft.key, "displayOrder", Number(event.target.value))} required />
        <TextField key={`${draft.key}-${draft.logoPath ?? "new"}`} label={text.logo} hint={text.logoHint} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setDraft(draft.key, "logoFile", event.target.files?.[0] ?? null)} />
      </div>
      <LogoPreview draft={draft} />
      <div className={styles.actions}><Button disabled={pending?.key === draft.key}>{pending?.key === draft.key && pending.action === "save" ? text.saving : text.save}</Button><Button type="button" variant="danger" disabled={pending?.key === draft.key} onClick={() => remove(draft)}>{pending?.key === draft.key && pending.action === "remove" ? text.removing : text.remove}</Button></div>
    </form>)}</div>
  </section>;
}
