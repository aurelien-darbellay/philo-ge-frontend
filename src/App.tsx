import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "./api";
import { AuthProvider, useAuth } from "./AuthContext";
import type { AdminUser, Invitation } from "./types";

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

function LoadingScreen() {
  return <main className="centered"><div className="loader" aria-label="Loading" /></main>;
}

function ProtectedRoute({ admin = false }: { admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}

function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/"><span>φ</span> Philo Genève</Link>
        <nav>
          {user?.role === "admin" && <Link to="/admin/users">Users</Link>}
          {user?.role === "admin" && <Link to="/admin/invitations">Invite</Link>}
          <button className="button-link" onClick={onLogout}>Sign out</button>
        </nav>
      </header>
      {children}
    </div>
  );
}

function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <div className="eyebrow">PHILO GENÈVE</div>
        <h1>Ideas deserve<br />a place to meet.</h1>
        <p>A private space for our community, conversations, and shared curiosity.</p>
      </section>
      <section className="auth-panel">
        <form className="card form-card" onSubmit={submit}>
          <div><div className="mark">φ</div><h2>Welcome back</h2><p>Sign in to continue to your account.</p></div>
          {error && <div className="alert" role="alert">{error}</div>}
          <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <label className="checkbox"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me for 30 days</label>
          <button className="primary" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
          <p className="hint">Access is by invitation only.</p>
        </form>
      </section>
    </main>
  );
}

function Dashboard() {
  const { user } = useAuth();
  return <Shell><main className="page"><div className="eyebrow">MEMBER SPACE</div><h1>Welcome to Philo Genève.</h1><p className="lead">You are signed in as <strong>{user?.email}</strong>.</p><div className="feature-grid"><article className="feature"><span>01</span><h3>Conversations</h3><p>Join thoughtful exchanges with the community.</p></article><article className="feature"><span>02</span><h3>Events</h3><p>Discover upcoming gatherings and talks.</p></article><article className="feature"><span>03</span><h3>Archives</h3><p>Return to ideas worth revisiting.</p></article></div></main></Shell>;
}

function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { acceptInvitation } = useAuth();
  const token = params.get("token") ?? "";
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.inspectInvitation(token).then(({ invitation: value }) => setInvitation(value)).catch((caught) => setError(errorMessage(caught))).finally(() => setLoading(false));
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await acceptInvitation(token, password, confirmation, rememberMe);
      navigate("/");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  return <main className="single-page"><form className="card form-card wide" onSubmit={submit}><div className="mark">φ</div><div className="eyebrow">YOUR INVITATION</div><h1>Join the conversation.</h1>{error && <div className="alert" role="alert">{error}</div>}{invitation && <><p>Your invitation is for <strong>{invitation.email}</strong>. Choose a password to create your account.</p><label>Password<input type="password" minLength={12} maxLength={1024} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /><small>At least 12 characters</small></label><label>Confirm password<input type="password" minLength={12} maxLength={1024} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required /></label><label className="checkbox"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me for 30 days</label><button className="primary" disabled={submitting}>{submitting ? "Creating account…" : "Create account"}</button></>}</form></main>;
}

function AdminInvitations() {
  const { csrfToken } = useAuth();
  const [email, setEmail] = useState("");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(""); setInvitation(null); setCopied(false);
    try {
      const result = await api.createInvitation(email, csrfToken!);
      setInvitation(result.invitation); setEmail("");
    } catch (caught) { setError(errorMessage(caught)); }
  };

  const copy = async () => { if (invitation?.url) { await navigator.clipboard.writeText(invitation.url); setCopied(true); } };
  return <Shell><main className="page narrow"><div className="eyebrow">ADMINISTRATION</div><h1>Invite a member.</h1><p className="lead">Create a private link valid for seven days.</p><form className="card inline-form" onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="member@example.com" required /></label><button className="primary">Create invitation</button></form>{error && <div className="alert" role="alert">{error}</div>}{invitation?.url && <div className="card result"><div><div className="eyebrow">INVITATION READY</div><strong>{invitation.email}</strong></div><code>{invitation.url}</code><button className="secondary" onClick={copy}>{copied ? "Copied" : "Copy link"}</button></div>}</main></Shell>;
}

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.users().then(({ users: value }) => setUsers(value)).catch((caught) => setError(errorMessage(caught))).finally(() => setLoading(false)); }, []);
  return <Shell><main className="page"><div className="eyebrow">ADMINISTRATION</div><div className="title-row"><div><h1>Community members.</h1><p className="lead">{users.length} registered {users.length === 1 ? "user" : "users"}</p></div><Link className="primary link-button" to="/admin/invitations">Invite user</Link></div>{error && <div className="alert" role="alert">{error}</div>}<div className="card table-card">{loading ? <div className="table-empty">Loading users…</div> : <table><thead><tr><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><strong>{user.email}</strong></td><td><span className={`badge ${user.role}`}>{user.role}</span></td><td>{new Date(`${user.created_at}Z`).toLocaleDateString()}</td></tr>)}</tbody></table>}</div></main></Shell>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<LoginPage />} /><Route path="/accept-invitation" element={<AcceptInvitationPage />} /><Route element={<ProtectedRoute />}><Route path="/" element={<Dashboard />} /></Route><Route element={<ProtectedRoute admin />}><Route path="/admin/invitations" element={<AdminInvitations />} /><Route path="/admin/users" element={<AdminUsers />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></AuthProvider></BrowserRouter>;
}
