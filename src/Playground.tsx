import { useState, type ReactNode } from "react";
import type { BajaClient, WhoAmIResponse } from "baja-client";

/** Tracks one endpoint call's lifecycle for display. */
interface CallState {
  loading: boolean;
  data?: unknown;
  error?: string;
}

function useCall() {
  const [state, setState] = useState<CallState>({ loading: false });
  const run = async (fn: () => Promise<unknown>) => {
    setState({ loading: true });
    try {
      setState({ loading: false, data: await fn() });
    } catch (e) {
      setState({
        loading: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  };
  return { state, run };
}

function Output({ state }: { state: CallState }) {
  if (state.loading) return <pre className="output muted">Running…</pre>;
  if (state.error) return <pre className="output error">{state.error}</pre>;
  if (state.data === undefined) return null;
  const text =
    typeof state.data === "string"
      ? state.data
      : JSON.stringify(state.data, null, 2);
  return <pre className="output">{text}</pre>;
}

function Section({
  title,
  endpoint,
  children,
}: {
  title: string;
  endpoint: string;
  children: ReactNode;
}) {
  return (
    <section className="pg-card">
      <div className="pg-card-head">
        <h2>{title}</h2>
        <code className="pg-endpoint">{endpoint}</code>
      </div>
      {children}
    </section>
  );
}

export function Playground({
  client,
  user,
  onLogout,
}: {
  client: BajaClient;
  user: WhoAmIResponse | null;
  onLogout: () => void;
}) {
  const identity = useCall();
  const report = useCall();
  const nameHistory = useCall();
  const live = useCall();

  // Defaults are real values from the check_in_app DB (plant 4 "Shiraz",
  // America/Tijuana) so every call returns populated data on the first click.
  // The 3-day window is recent and dense (~90 movements across all employees);
  // leave Employee # blank for the full report or filter to e.g. 21275.
  const [reportForm, setReportForm] = useState({
    from: "2026-05-29",
    to: "2026-05-31",
    plantId: "4",
    employeeNumber: "",
  });
  const [nhForm, setNhForm] = useState<{
    type: "area" | "activity";
    id: string;
  }>({ type: "area", id: "11" });
  const [livePlantId, setLivePlantId] = useState("4");
  const [liveCursor, setLiveCursor] = useState<string | null>(null);

  const reportValid =
    !!reportForm.from && !!reportForm.to && !!reportForm.plantId;

  return (
    <main className="playground">
      <header className="pg-header">
        <div>
          <h1>API Playground</h1>
          <p className="muted">
            Signed in{user?.name ? ` as ${user.name}` : ""}
            {user?.scopes?.length ? ` · scopes: ${user.scopes.join(", ")}` : ""}
            .
          </p>
        </div>
        <button className="link" onClick={onLogout}>
          Log out
        </button>
      </header>

      {/* Identity */}
      <Section title="Identity" endpoint="GET /public/v1 · /public/v1/whoami">
        <div className="row">
          <button
            disabled={identity.state.loading}
            onClick={() => identity.run(() => client.whoami())}
          >
            whoami()
          </button>
          <button
            disabled={identity.state.loading}
            onClick={() => identity.run(() => client.ping())}
          >
            ping()
          </button>
        </div>
        <Output state={identity.state} />
      </Section>

      {/* Check-in report */}
      <Section
        title="Check-in report"
        endpoint="GET /public/v1/check-in/report"
      >
        <div className="form-grid">
          <label>
            From
            <input
              type="date"
              value={reportForm.from}
              onChange={(e) =>
                setReportForm({ ...reportForm, from: e.target.value })
              }
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={reportForm.to}
              onChange={(e) =>
                setReportForm({ ...reportForm, to: e.target.value })
              }
            />
          </label>
          <label>
            Plant ID
            <input
              type="number"
              value={reportForm.plantId}
              onChange={(e) =>
                setReportForm({ ...reportForm, plantId: e.target.value })
              }
            />
          </label>
          <label>
            Employee # (optional)
            <input
              type="text"
              placeholder="e.g. 21275 (blank = all employees)"
              value={reportForm.employeeNumber}
              onChange={(e) =>
                setReportForm({ ...reportForm, employeeNumber: e.target.value })
              }
            />
          </label>
        </div>
        <button
          className="primary"
          disabled={report.state.loading || !reportValid}
          onClick={() =>
            report.run(() =>
              client.checkIn.report({
                from: reportForm.from,
                to: reportForm.to,
                plantId: Number(reportForm.plantId),
                employeeNumber: reportForm.employeeNumber || undefined,
              }),
            )
          }
        >
          Run report
        </button>
        <Output state={report.state} />
      </Section>

      {/* Name history */}
      <Section
        title="Cost-center name history"
        endpoint="GET /public/v1/check-in/cost-centers/{type}/{id}/name-history"
      >
        <div className="form-grid">
          <label>
            Type
            <select
              value={nhForm.type}
              onChange={(e) =>
                setNhForm({
                  ...nhForm,
                  type: e.target.value as "area" | "activity",
                })
              }
            >
              <option value="area">area</option>
              <option value="activity">activity</option>
            </select>
          </label>
          <label>
            ID
            <input
              type="number"
              value={nhForm.id}
              onChange={(e) => setNhForm({ ...nhForm, id: e.target.value })}
            />
          </label>
        </div>
        <button
          className="primary"
          disabled={nameHistory.state.loading || !nhForm.id}
          onClick={() =>
            nameHistory.run(() =>
              client.checkIn.nameHistory({
                type: nhForm.type,
                id: Number(nhForm.id),
              }),
            )
          }
        >
          Get history
        </button>
        <Output state={nameHistory.state} />
      </Section>

      {/* Live board */}
      <Section title="Live board" endpoint="GET /public/v1/check-in/live">
        <div className="form-grid">
          <label>
            Plant ID
            <input
              type="number"
              value={livePlantId}
              onChange={(e) => setLivePlantId(e.target.value)}
            />
          </label>
        </div>
        {liveCursor && (
          <p className="muted cursor">
            cursor: <code>{liveCursor}</code>
          </p>
        )}
        <div className="row">
          <button
            className="primary"
            disabled={live.state.loading || !livePlantId}
            onClick={() =>
              live.run(async () => {
                const board = await client.checkIn.live({
                  plantId: Number(livePlantId),
                });
                setLiveCursor(board.cursor);
                return board;
              })
            }
          >
            Full snapshot
          </button>
          <button
            disabled={live.state.loading || !livePlantId || !liveCursor}
            onClick={() =>
              live.run(async () => {
                const board = await client.checkIn.live({
                  plantId: Number(livePlantId),
                  since: liveCursor ?? undefined,
                });
                setLiveCursor(board.cursor);
                return board;
              })
            }
          >
            Refresh (delta)
          </button>
        </div>
        <Output state={live.state} />
      </Section>
    </main>
  );
}
