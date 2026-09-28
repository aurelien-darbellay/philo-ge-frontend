import { defineTextMap } from "../../i18n/textMap";

export const programmePageText = defineTextMap({
  fr: { title: "Programme", searchLabel: "Rechercher dans le programme", searchPlaceholder: "Titre, intervenant·e, lieu ou cycle", loading: "Chargement du programme", errorTitle: "Programme indisponible", errorBody: "Le programme ne peut pas être chargé pour le moment.", empty: "Aucun cycle ou rencontre publié." },
  de: { title: "Programm", searchLabel: "Programm durchsuchen", searchPlaceholder: "Titel, Mitwirkende, Ort oder Zyklus", loading: "Programm wird geladen", errorTitle: "Programm nicht verfügbar", errorBody: "Das Programm kann derzeit nicht geladen werden.", empty: "Keine veröffentlichten Zyklen oder Veranstaltungen." },
  it: { title: "Programma", searchLabel: "Cerca nel programma", searchPlaceholder: "Titolo, partecipante, luogo o ciclo", loading: "Caricamento del programma", errorTitle: "Programma non disponibile", errorBody: "Il programma non può essere caricato al momento.", empty: "Nessun ciclo o incontro pubblicato." },
  en: { title: "Programme", searchLabel: "Search the programme", searchPlaceholder: "Title, speaker, venue, or cycle", loading: "Loading programme", errorTitle: "Programme unavailable", errorBody: "The programme cannot be loaded right now.", empty: "No published cycles or events." },
});
