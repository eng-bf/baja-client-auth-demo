import { useEffect, useRef, useState } from "react";
import type { BajaClient } from "baja-client";
import { baja, isConfigured } from "./baja";
import { useAuth } from "./useAuth";

/** Shown until VITE_CLIENT_ID is set in .env. */
function ConfigNeeded() {
  return (
    <main className="card">
      <h1>Baja Client — Auth Demo</h1>
      <p className="muted">This demo isn't configured yet.</p>
      <ol className="steps">
        <li>
          In the dashboard, go to <strong>Public API → Browser apps</strong> and{" "}
          <strong>Register app</strong> with redirect URI{" "}
          <code>http://localhost:5180/callback</code> and scopes{" "}
          <code>openid profile public_api:read</code>.
        </li>
        <li>
          Copy the generated <code>client_id</code> into <code>.env</code> as{" "}
          <code>VITE_CLIENT_ID</code>.
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </main>
  );
}

/** The /callback route: completes the OAuth code exchange, then returns home. */
function Callback({ client }: { client: BajaClient }) {
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    // Guard against StrictMode's double-invoke — the exchange is one-shot.
    if (ran.current) return;
    ran.current = true;
    client
      .handleRedirectCallback()
      .then(() => window.location.replace("/"))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [client]);

  return (
    <main className="card">
      <h1>Signing in…</h1>
      {error ? (
        <>
          <p className="error">{error}</p>
          <a href="/">← Back to start</a>
        </>
      ) : (
        <p className="muted">Completing the OAuth exchange…</p>
      )}
    </main>
  );
}

function Home({ client }: { client: BajaClient }) {
  const { authenticated, user, error, login, logout } = useAuth(client);
  const [output, setOutput] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      const result = await fn();
      setOutput(
        typeof result === "string" ? result : JSON.stringify(result, null, 2),
      );
    } catch (e) {
      setOutput(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="card">
      <h1>Baja Client — Auth Demo</h1>

      {!authenticated ? (
        <>
          <p className="muted">You're not signed in.</p>
          <button className="primary" onClick={() => void login()}>
            Sign in with Baja
          </button>
        </>
      ) : (
        <>
          <p>
            Signed in{user?.name ? ` as ${user.name}` : ""}.{" "}
            <button className="link" onClick={logout}>
              Log out
            </button>
          </p>
          <div className="row">
            <button disabled={busy} onClick={() => run(() => client.whoami())}>
              whoami()
            </button>
            <button disabled={busy} onClick={() => run(() => client.ping())}>
              ping()
            </button>
            <button
              disabled={busy}
              onClick={() => run(() => client.getAccessToken())}
            >
              getAccessToken()
            </button>
          </div>
          {output && <pre>{output}</pre>}
        </>
      )}

      {error && <p className="error">{error}</p>}
    </main>
  );
}

export default function App() {
  if (!isConfigured || !baja) return <ConfigNeeded />;
  if (window.location.pathname === "/callback")
    return <Callback client={baja} />;
  return <Home client={baja} />;
}
