import { defineTextMap, defaultText } from "../../../i18n/textMap";
export const loadingIndicatorText = defineTextMap({ fr: { label: "Chargement" }, de: { label: "Wird geladen" }, it: { label: "Caricamento" }, en: { label: "Loading" } });
export const loadingIndicatorDefaultText = defaultText(loadingIndicatorText);
