import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  // --------------------------------------------------
  // Logique globale de la page :
  // 1. Si l'utilisateur est déjà connecté, on l'envoie vers /admin
  // 2. Sinon on affiche un formulaire simple email + mot de passe
  // 3. À la validation, on utilise Supabase Auth
  // 4. En cas de succès, on redirige vers /admin
  // --------------------------------------------------

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    setCheckingSession(true);

    const { data, error } = await supabase.auth.getSession();

    if (!error && data.session) {
      navigate({ to: "/admin" });
      return;
    }

    setCheckingSession(false);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setError("Connexion réussie, mais utilisateur introuvable.");
      setLoading(false);
      return;
    }

    navigate({ to: "/admin" });
  }

  if (checkingSession) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Vérification de session...</h1>
          <p style={styles.text}>Patiente une seconde.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.badge}>NFC Card Admin</p>

        <h1 style={styles.title}>Connexion</h1>
        <p style={styles.text}>
          Connecte-toi avec l’adresse email et le mot de passe du client pour accéder au back-office.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="client@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error ? <p style={styles.error}>{error}</p> : null}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1e293b 100%)",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(15, 23, 42, 0.88)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    backdropFilter: "blur(12px)",
    color: "white",
  },
  badge: {
    margin: "0 0 12px 0",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#93c5fd",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1.1,
  },
  text: {
    margin: "0 0 24px 0",
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#e2e8f0",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    outline: "none",
    fontSize: "15px",
  },
  button: {
    marginTop: "8px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "white",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    margin: 0,
    color: "#fca5a5",
    fontSize: "14px",
  },
};