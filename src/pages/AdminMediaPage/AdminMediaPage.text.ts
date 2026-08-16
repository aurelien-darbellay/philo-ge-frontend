import { defineTextMap, defaultText } from "../../i18n/textMap";

export const adminMediaPageText = defineTextMap({
  fr: { eyebrow: "ADMINISTRATION", title: "Médiathèque.", loading: "Chargement des images…", empty: "Aucune image dans la médiathèque.", loadError: "Impossible de charger les images.", delete: "Supprimer", deleting: "Suppression…", deleteError: "Impossible de supprimer l’image.", deleteConfirm: "Supprimer « {filename} » ? Elle sera également retirée des contenus qui l’utilisent." },
  de: { eyebrow: "ADMINISTRATION", title: "Mediathek.", loading: "Bilder werden geladen…", empty: "Keine Bilder in der Mediathek.", loadError: "Die Bilder konnten nicht geladen werden.", delete: "Löschen", deleting: "Wird gelöscht…", deleteError: "Das Bild konnte nicht gelöscht werden.", deleteConfirm: "„{filename}“ löschen? Das Bild wird auch aus allen Inhalten entfernt, die es verwenden." },
  it: { eyebrow: "AMMINISTRAZIONE", title: "Mediateca.", loading: "Caricamento delle immagini…", empty: "Nessuna immagine nella mediateca.", loadError: "Impossibile caricare le immagini.", delete: "Elimina", deleting: "Eliminazione…", deleteError: "Impossibile eliminare l’immagine.", deleteConfirm: "Eliminare «{filename}»? L’immagine sarà rimossa anche dai contenuti che la utilizzano." },
  en: { eyebrow: "ADMINISTRATION", title: "Media library.", loading: "Loading images…", empty: "There are no images in the media library.", loadError: "Could not load the images.", delete: "Delete", deleting: "Deleting…", deleteError: "Could not delete the image.", deleteConfirm: "Delete “{filename}”? It will also be removed from any content using it." },
});

export const adminMediaPageDefaultText = defaultText(adminMediaPageText);
