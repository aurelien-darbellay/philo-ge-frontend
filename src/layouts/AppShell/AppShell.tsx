import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { BrandMark } from "../../components/ui/BrandMark/BrandMark";
import { Button } from "../../components/ui/Button/Button";
import { appShellDefaultText as text } from "./AppShell.text";
import styles from "./AppShell.module.css";
export function AppShell({ children }: { children: ReactNode }) { const { user, logout } = useAuth(); const navigate = useNavigate(); const onLogout = async () => { await logout(); navigate("/login"); }; return <div className={styles.shell}><header className={styles.topbar}><Link className={styles.brandLink} to="/espace-membre"><BrandMark compact /></Link><nav className={styles.nav}>{user?.role === "admin" && <Link className={styles.navLink} to="/admin/users">{text.users}</Link>}{user?.role === "admin" && <Link className={styles.navLink} to="/admin/invitations">{text.invite}</Link>}<Button variant="ghost" onClick={onLogout}>{text.signOut}</Button></nav></header>{children}</div>; }
