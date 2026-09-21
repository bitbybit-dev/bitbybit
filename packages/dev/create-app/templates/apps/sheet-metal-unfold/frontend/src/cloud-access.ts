export const CAD_CLOUD_URL = "https://bitbybit.dev/cad-cloud";
export const STUDIO_KEYS_URL = "https://studio.bitbybit.dev/keys/billing";
export const KEY_LINE = "BITBYBIT_API_KEY=your-key-here";
export const NO_KEY_CODE = "NO_API_KEY";

export type Access =
    | { state: "ready" }
    | { state: "locked"; reason: string }
    | { state: "unreachable"; message: string }
    | { state: "error"; message: string };

const text = (value: unknown, fallback: string): string => (typeof value === "string" ? value : fallback);

export function accessFromResponse(status: number, body: unknown): Access {
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    if (status === 503 && record["code"] === NO_KEY_CODE) return { state: "locked", reason: text(record["error"], "no API key configured") };
    if (status === 502 || status === 504 || status === 0) return { state: "unreachable", message: "the backend is not running; start it with: cd backend && npm run dev" };
    if (status >= 200 && status < 300) return { state: "ready" };
    return { state: "error", message: text(record["error"], `HTTP ${status}`) };
}

export function renderAccess(root: HTMLElement, access: Access): void {
    root.classList.toggle("hidden", access.state === "ready");
    if (access.state === "ready") { root.innerHTML = ""; return; }
    if (access.state === "locked") {
        root.innerHTML = `
            <strong>Unfolding needs CAD Cloud</strong>
            Everything else on this page runs in your browser on the open-source packages. The sheet-metal unfold is a Pro algorithm that exists only on
            <a href="${CAD_CLOUD_URL}" target="_blank" rel="noopener noreferrer">CAD Cloud</a>; any plan includes it.
            Create a key in <a href="${STUDIO_KEYS_URL}" target="_blank" rel="noopener noreferrer">Bitbybit Studio</a>, put it in <code>backend/.env</code> as
            <code>${KEY_LINE}</code>
            and restart the backend. The key stays on the server; the browser never sees it.
        `;
        return;
    }
    root.innerHTML = `<strong>${access.state === "unreachable" ? "Backend not reachable" : "Unfold failed"}</strong>${access.message}`;
}
