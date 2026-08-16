import { defineTextMap, defaultText } from "../../i18n/textMap";
export const appShellText = defineTextMap({
  fr: { users: "Utilisateurs", invite: "Inviter", signOut: "Se déconnecter" },
  de: { users: "Benutzer", invite: "Einladen", signOut: "Abmelden" },
  it: { users: "Utenti", invite: "Invita", signOut: "Esci" },
  en: { users: "Users", invite: "Invite", signOut: "Sign out" },
});
export const appShellDefaultText = defaultText(appShellText);
