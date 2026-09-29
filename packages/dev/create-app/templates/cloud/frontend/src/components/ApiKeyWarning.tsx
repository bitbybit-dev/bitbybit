import { useEffect, useState, type ReactElement } from "react";

const CAD_CLOUD_URL = "https://bitbybit.dev/cad-cloud";
const STUDIO_KEYS_URL = "https://studio.bitbybit.dev/keys/billing";

export function ApiKeyWarning(): ReactElement | null {
    const [state, setState] = useState<"ok" | "no-key" | "no-backend">("ok");

    useEffect(() => {
        fetch("/api/generate", { method: "POST" })
            .then((res) => {
                if (res.status === 503) setState("no-key");
                else if (res.status === 502 || res.status === 504) setState("no-backend");
            })
            .catch(() => { setState("no-backend"); });
    }, []);

    if (state === "ok") return null;

    return (
        <div className="api-key-warning">
            <div className="api-key-warning-icon">⚠️</div>
            <div className="api-key-warning-content">
                {state === "no-backend" ? (
                    <>
                        <strong>Backend not reachable</strong>
                        <p>Start it in a second terminal: <code>cd backend</code> then <code>npm run dev</code> (or <code>dotnet run</code>). The frontend proxies <code>/api</code> to it.</p>
                    </>
                ) : (
                    <>
                        <strong>This app needs CAD Cloud</strong>
                        <p>
                            Everything it renders is computed on{" "}
                            <a href={CAD_CLOUD_URL} target="_blank" rel="noopener noreferrer">CAD Cloud</a>, and the backend has no API key yet.
                            Any plan includes one: create it in{" "}
                            <a href={STUDIO_KEYS_URL} target="_blank" rel="noopener noreferrer">Bitbybit Studio</a>, put it in the backend's secret file
                            (see the README) and restart the backend. The key stays on the server; this page never sees it.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
