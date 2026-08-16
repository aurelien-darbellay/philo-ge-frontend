import { useEffect, useState } from "react";
import { api, apiAssetUrl } from "../../api";
import { useAuth } from "../../AuthContext";
import { Alert } from "../../components/ui/Alert/Alert";
import { Button } from "../../components/ui/Button/Button";
import { PageHeader } from "../../components/ui/PageHeader/PageHeader";
import { useLanguage } from "../../i18n/LanguageContext";
import { languageLocales } from "../../i18n/textMap";
import { useText } from "../../i18n/useText";
import { AppShell } from "../../layouts/AppShell/AppShell";
import type { MediaImage } from "../../types";
import { adminMediaPageText } from "./AdminMediaPage.text";
import styles from "./AdminMediaPage.module.css";

export function AdminMediaPage() {
  const text = useText(adminMediaPageText);
  const { language } = useLanguage();
  const { csrfToken } = useAuth();
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.mediaImages()
      .then(({ images: value }) => { if (active) setImages(value); })
      .catch(() => { if (active) setError(text.loadError); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [text.loadError]);

  const deleteImage = async (image: MediaImage) => {
    if (!csrfToken || !window.confirm(text.deleteConfirm.replace("{filename}", image.filename))) return;
    setDeleting(image.filename);
    setError("");

    try {
      await api.deleteMediaImage(image.filename, csrfToken);
      setImages((current) => current.filter((item) => item.filename !== image.filename));
    } catch {
      setError(text.deleteError);
    } finally {
      setDeleting(null);
    }
  };

  const sizeFormatter = new Intl.NumberFormat(languageLocales[language], { style: "unit", unit: "kilobyte", maximumFractionDigits: 0 });

  return <AppShell><main className={styles.page}>
    <PageHeader eyebrow={text.eyebrow} title={text.title} />
    {error && <Alert>{error}</Alert>}
    {loading ? <p className={styles.state}>{text.loading}</p> : images.length === 0 ? <p className={styles.state}>{text.empty}</p> : <ul className={styles.grid}>
      {images.map((image) => <li className={styles.item} key={image.filename}>
        <div className={styles.thumbnail}><img src={apiAssetUrl(image.path)} alt="" /></div>
        <p className={styles.filename}>{image.filename}</p>
        <p className={styles.meta}>{sizeFormatter.format(image.size / 1000)}</p>
        <Button variant="danger" disabled={deleting === image.filename} onClick={() => deleteImage(image)}>{deleting === image.filename ? text.deleting : text.delete}</Button>
      </li>)}
    </ul>}
  </main></AppShell>;
}
