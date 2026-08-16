import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { Button } from "../../components/ui/Button/Button";
import { LanguageSelector } from "../../components/ui/LanguageSelector/LanguageSelector";
import { useText } from "../../i18n/useText";
import { appShellText } from "./AppShell.text";
import styles from "./AppShell.module.css";
export function AppShell({ children, compact = false }: { children: ReactNode; compact?: boolean }) { const { user, logout } = useAuth(); const text = useText(appShellText); const navigate = useNavigate(); const onLogout = async () => { await logout(); navigate("/login"); }; return <div className={`${styles.shell} ${compact ? styles.compact : ""}`}><header className={styles.topbar}><Link className={styles.brandLink} to="/"><BrandMark compact /></Link><div className={styles.actions}><nav className={styles.nav}><Link className={styles.navLink} to="/">{text.home}</Link>{user?.role === "admin" && <Link className={styles.navLink} to="/espace-membre">{text.dashboard}</Link>}{user?.role === "admin" && <Link className={styles.navLink} to="/admin/media">{text.mediaLibrary}</Link>}{user?.role === "admin" && <Link className={styles.navLink} to="/admin/users">{text.users}</Link>}{user?.role === "admin" && <Link className={styles.navLink} to="/admin/invitations">{text.invite}</Link>}<Button variant="ghost" onClick={onLogout}>{text.signOut}</Button></nav><LanguageSelector /></div></header>{children}</div>; }
