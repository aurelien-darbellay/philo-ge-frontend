import { defineTextMap, defaultText } from "../../i18n/textMap";
export const appShellText = defineTextMap({
  fr: { home: "Accueil", users: "Utilisateurs", invite: "Inviter", signOut: "Se déconnecter" },
  de: { home: "Startseite", users: "Benutzer", invite: "Einladen", signOut: "Abmelden" },
  it: { home: "Home", users: "Utenti", invite: "Invita", signOut: "Esci" },
  en: { home: "Home", users: "Users", invite: "Invite", signOut: "Sign out" },
});
export const appShellDefaultText = defaultText(appShellText);
