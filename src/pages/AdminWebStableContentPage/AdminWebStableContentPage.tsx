import { useEffect, useMemo, useState } from "react";
import { api, apiAssetUrl, ApiError } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { RegularSponsorEditor } from "../../components/admin/RegularSponsorEditor/RegularSponsorEditor";
import { Button } from "../../components/ui/Button/Button";
import { Card } from "../../components/ui/Card/Card";
import { MarkdownEditor } from "../../components/ui/MarkdownEditor/MarkdownEditor";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { TextArea } from "../../components/ui/TextArea/TextArea";
import { TextField } from "../../components/ui/TextField/TextField";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { AboutContent, BecomeMemberContent, OrganizationProfile } from "../../types";
import { adminWebStableContentPageText } from "./AdminWebStableContentPage.text";
import styles from "./AdminWebStableContentPage.module.css";

export function AdminWebStableContentPage() {
  const text = useText(adminWebStableContentPageText);
  const { csrfToken } = useAuth();
  const [aboutEditorOpen, setAboutEditorOpen] = useState(false);
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutSaved, setAboutSaved] = useState(false);
  const [aboutError, setAboutError] = useState("");
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    title_fr: "",
    title_de: "",
    title_it: "",
    title_en: "",
    body_fr: "",
    body_de: "",
    body_it: "",
    body_en: "",
  });
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [introFr, setIntroFr] = useState("");
  const [introDe, setIntroDe] = useState("");
  const [introIt, setIntroIt] = useState("");
  const [introEn, setIntroEn] = useState("");
  const [instructionFr, setInstructionFr] = useState("");
  const [instructionDe, setInstructionDe] = useState("");
  const [instructionIt, setInstructionIt] = useState("");
  const [instructionEn, setInstructionEn] = useState("");
  const [qrPath, setQrPath] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [regQuota, setRegQuota] = useState("");
  const [reduceQuota, setReduceQuota] = useState("");
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileInstagram, setProfileInstagram] = useState("");
  const [profileFacebook, setProfileFacebook] = useState("");
  const [profileBankAccount, setProfileBankAccount] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [sponsorEditorOpen, setSponsorEditorOpen] = useState(false);
  const qrPreview = useMemo(() => qrFile ? URL.createObjectURL(qrFile) : null, [qrFile]);

  useEffect(() => () => {
    if (qrPreview) URL.revokeObjectURL(qrPreview);
  }, [qrPreview]);

  useEffect(() => {
    if (!aboutEditorOpen || !csrfToken) return;

    let active = true;
    setAboutLoading(true);
    setAboutSaved(false);
    setAboutError("");

    api.adminAboutContent()
      .then(({ content }) => {
        if (active) setAboutContent(content);
      })
      .catch((caught) => {
        if (!active) return;
        setAboutError(caught instanceof ApiError ? caught.message : text.aboutLoadError);
      })
      .finally(() => {
        if (active) setAboutLoading(false);
      });

    return () => {
      active = false;
    };
  }, [aboutEditorOpen, csrfToken, text.aboutLoadError]);

  const setAboutField = (field: keyof AboutContent, value: string) => {
    setAboutContent((current) => ({ ...current, [field]: value }));
    setAboutSaved(false);
  };

  const onSaveAbout = async () => {
    if (!csrfToken || aboutSaving) return;
    const payload = Object.fromEntries(
      Object.entries(aboutContent).map(([field, value]) => [field, value.trim()]),
    ) as AboutContent;
    if (Object.values(payload).some((value) => value === "")) {
      setAboutError(text.aboutInvalid);
      setAboutSaved(false);
      return;
    }

    setAboutSaving(true);
    setAboutSaved(false);
    setAboutError("");
    try {
      const { content } = await api.updateAdminAboutContent(payload, csrfToken);
      setAboutContent(content);
      setAboutSaved(true);
    } catch (caught) {
      setAboutError(caught instanceof ApiError ? caught.message : text.aboutSaveError);
    } finally {
      setAboutSaving(false);
    }
  };

  const applyContent = (content: BecomeMemberContent) => {
    setIntroFr(content.intro_fr);
    setIntroDe(content.intro_de);
    setIntroIt(content.intro_it);
    setIntroEn(content.intro_en);
    setInstructionFr(content.instruction_fr);
    setInstructionDe(content.instruction_de);
    setInstructionIt(content.instruction_it);
    setInstructionEn(content.instruction_en);
    setQrPath(content.qr_path);
    setQrFile(null);
    setRegQuota(content.reg_quota.toFixed(2));
    setReduceQuota(content.reduce_quota.toFixed(2));
  };

  useEffect(() => {
    if (!editorOpen || !csrfToken) return;

    let active = true;
    setLoading(true);
    setSaved(false);
    setError("");

    api.adminBecomeMemberContent()
      .then(({ content }) => {
        if (!active) return;
        applyContent(content);
      })
      .catch((caught) => {
        if (!active) return;
        setError(caught instanceof ApiError ? caught.message : text.loadError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [csrfToken, editorOpen, text.loadError]);

  const onSave = async () => {
    if (!csrfToken || saving) return;
    const regular = Number(regQuota);
    const reduced = Number(reduceQuota);
    if (
      introFr.trim() === ""
      || introDe.trim() === ""
      || introIt.trim() === ""
      || introEn.trim() === ""
      || instructionFr.trim() === ""
      || instructionDe.trim() === ""
      || instructionIt.trim() === ""
      || instructionEn.trim() === ""
      || (qrPath === "" && qrFile === null)
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
      const savedQrPath = qrFile
        ? (await api.uploadBecomeMemberQr(qrFile, csrfToken)).image_path
        : qrPath;
      const payload: BecomeMemberContent = {
        intro_fr: introFr.trim(),
        intro_de: introDe.trim(),
        intro_it: introIt.trim(),
        intro_en: introEn.trim(),
        instruction_fr: instructionFr.trim(),
        instruction_de: instructionDe.trim(),
        instruction_it: instructionIt.trim(),
        instruction_en: instructionEn.trim(),
        qr_path: savedQrPath,
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

  const applyProfile = (profile: OrganizationProfile) => {
    setProfileEmail(profile.email);
    setProfileInstagram(profile.instagram ?? "");
    setProfileFacebook(profile.facebook ?? "");
    setProfileBankAccount(profile.bank_account);
    setProfileAddress(profile.address ?? "");
  };

  useEffect(() => {
    if (!profileEditorOpen || !csrfToken) return;

    let active = true;
    setProfileLoading(true);
    setProfileSaved(false);
    setProfileError("");

    api.adminOrganizationProfile()
      .then(({ profile }) => {
        if (!active) return;
        applyProfile(profile);
      })
      .catch((caught) => {
        if (!active) return;
        setProfileError(caught instanceof ApiError ? caught.message : text.profileLoadError);
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [csrfToken, profileEditorOpen, text.profileLoadError]);

  const onSaveProfile = async () => {
    if (!csrfToken || profileSaving) return;
    const email = profileEmail.trim();
    const bankAccount = profileBankAccount.trim();
    if (email === "" || bankAccount === "") {
      setProfileError(text.profileInvalid);
      setProfileSaved(false);
      return;
    }

    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError("");

    try {
      const payload: OrganizationProfile = {
        email,
        instagram: profileInstagram.trim() === "" ? null : profileInstagram.trim(),
        facebook: profileFacebook.trim() === "" ? null : profileFacebook.trim(),
        bank_account: bankAccount,
        address: profileAddress.trim() === "" ? null : profileAddress.trim(),
      };
      const { profile } = await api.updateAdminOrganizationProfile(payload, csrfToken);
      applyProfile(profile);
      setProfileSaved(true);
    } catch (caught) {
      setProfileError(caught instanceof ApiError ? caught.message : text.profileSaveError);
    } finally {
      setProfileSaving(false);
    }
  };

  return <AppShell><main className={styles.page}>
    <PageHeader eyebrow={text.eyebrow} title={text.title} lead={text.lead} />
    <Card className={styles.sectionCard}>
      <h2>{text.aboutTitle}</h2>
      <p>{text.aboutBody}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => setAboutEditorOpen((open) => !open)}>
          {aboutEditorOpen ? text.aboutCloseEditor : text.aboutOpenEditor}
        </Button>
      </div>

      {aboutEditorOpen && (aboutLoading
        ? <p className={styles.state}>{text.aboutLoading}</p>
        : <>
          {aboutError && <Alert>{aboutError}</Alert>}
          <div className={styles.form}>
            <div className={styles.introGrid}>
              <TextField label={text.aboutTitleFr} value={aboutContent.title_fr} onChange={(event) => setAboutField("title_fr", event.target.value)} maxLength={255} />
              <TextField label={text.aboutTitleDe} value={aboutContent.title_de} onChange={(event) => setAboutField("title_de", event.target.value)} maxLength={255} />
              <TextField label={text.aboutTitleIt} value={aboutContent.title_it} onChange={(event) => setAboutField("title_it", event.target.value)} maxLength={255} />
              <TextField label={text.aboutTitleEn} value={aboutContent.title_en} onChange={(event) => setAboutField("title_en", event.target.value)} maxLength={255} />
            </div>
            <div className={styles.introGrid}>
              <MarkdownEditor label={text.aboutBodyFr} value={aboutContent.body_fr} onChange={(value) => setAboutField("body_fr", value)} />
              <MarkdownEditor label={text.aboutBodyDe} value={aboutContent.body_de} onChange={(value) => setAboutField("body_de", value)} />
              <MarkdownEditor label={text.aboutBodyIt} value={aboutContent.body_it} onChange={(value) => setAboutField("body_it", value)} />
              <MarkdownEditor label={text.aboutBodyEn} value={aboutContent.body_en} onChange={(value) => setAboutField("body_en", value)} />
            </div>
            <div className={styles.actions}>
              <Button onClick={onSaveAbout} disabled={aboutSaving}>{aboutSaving ? text.aboutSaving : text.aboutSave}</Button>
              {aboutSaved && <p className={styles.saved}>{text.aboutSaved}</p>}
            </div>
          </div>
        </>)}
    </Card>
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
            <div className={styles.introGrid}>
              <TextArea label={text.instructionFr} value={instructionFr} onChange={(event) => setInstructionFr(event.target.value)} />
              <TextArea label={text.instructionDe} value={instructionDe} onChange={(event) => setInstructionDe(event.target.value)} />
              <TextArea label={text.instructionIt} value={instructionIt} onChange={(event) => setInstructionIt(event.target.value)} />
              <TextArea label={text.instructionEn} value={instructionEn} onChange={(event) => setInstructionEn(event.target.value)} />
            </div>
            <div className={styles.quotaGrid}>
              <TextField label={text.regQuota} type="number" min="0" step="0.01" value={regQuota} onChange={(event) => setRegQuota(event.target.value)} />
              <TextField label={text.reduceQuota} type="number" min="0" step="0.01" value={reduceQuota} onChange={(event) => setReduceQuota(event.target.value)} />
            </div>
            <div className={styles.qrEditor}>
              <TextField label={text.qrFile} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setQrFile(event.target.files?.[0] ?? null)} />
              <p className={styles.hint}>{text.qrHint}</p>
              {(qrPreview || qrPath) && <img className={styles.qrPreview} src={qrPreview ?? apiAssetUrl(qrPath)} alt={text.qrPreviewAlt} />}
            </div>
            <div className={styles.actions}>
              <Button onClick={onSave} disabled={saving}>{saving ? text.saving : text.save}</Button>
              {saved && <p className={styles.saved}>{text.saved}</p>}
            </div>
          </div>
        </>)}
    </Card>
    <Card className={styles.sectionCard}>
      <h2>{text.sponsorTitle}</h2>
      <p>{text.sponsorBody}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={() => setSponsorEditorOpen((open) => !open)}>
          {sponsorEditorOpen ? text.sponsorCloseEditor : text.sponsorOpenEditor}
        </Button>
      </div>
      {sponsorEditorOpen && csrfToken && <RegularSponsorEditor csrfToken={csrfToken} />}
    </Card>
    <Card className={styles.profileCard}>
      <h2>{text.profileTitle}</h2>
      <p>{text.profileBody}</p>
      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => setProfileEditorOpen((open) => !open)}
        >
          {profileEditorOpen ? text.profileCloseEditor : text.profileOpenEditor}
        </Button>
      </div>

      {profileEditorOpen && (profileLoading
        ? <p className={styles.state}>{text.profileLoading}</p>
        : <>
          {profileError && <Alert>{profileError}</Alert>}
          <div className={styles.form}>
            <div className={styles.quotaGrid}>
              <TextField label={text.profileEmail} type="email" autoComplete="email" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} />
              <TextField label={text.profileBankAccount} value={profileBankAccount} onChange={(event) => setProfileBankAccount(event.target.value)} />
            </div>
            <div className={styles.quotaGrid}>
              <TextField label={text.profileInstagram} value={profileInstagram} onChange={(event) => setProfileInstagram(event.target.value)} />
              <TextField label={text.profileFacebook} value={profileFacebook} onChange={(event) => setProfileFacebook(event.target.value)} />
            </div>
            <TextArea label={text.profileAddress} value={profileAddress} onChange={(event) => setProfileAddress(event.target.value)} />
            <div className={styles.actions}>
              <Button onClick={onSaveProfile} disabled={profileSaving}>{profileSaving ? text.profileSaving : text.profileSave}</Button>
              {profileSaved && <p className={styles.saved}>{text.profileSaved}</p>}
            </div>
          </div>
        </>)}
    </Card>
  </main></AppShell>;
}
