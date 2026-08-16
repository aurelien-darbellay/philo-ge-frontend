import { defineTextMap, defaultText } from "../../i18n/textMap";
export const appShellText = defineTextMap({
  fr: { home: "Accueil", dashboard: "Tableau de bord", mediaLibrary: "Médiathèque", users: "Utilisateurs", invite: "Inviter", signOut: "Se déconnecter" },
  de: { home: "Startseite", dashboard: "Dashboard", mediaLibrary: "Mediathek", users: "Benutzer", invite: "Einladen", signOut: "Abmelden" },
  it: { home: "Home", dashboard: "Dashboard", mediaLibrary: "Mediateca", users: "Utenti", invite: "Invita", signOut: "Esci" },
  en: { home: "Home", dashboard: "Dashboard", mediaLibrary: "Media library", users: "Users", invite: "Invite", signOut: "Sign out" },
});
export const appShellDefaultText = defaultText(appShellText);
