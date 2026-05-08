import { useEffect, useState } from "react";

interface ModelsPanelProps {
    active: boolean;
    modelLoaded: boolean;
    onLoadModel: (url: string) => void;
    onLoadModels: (urls: string[]) => void;
}

/** Pick the GLB download URL from various response shapes */
function extractGlbUrl(data: Record<string, unknown>): string | undefined {
    // REST backend: { downloadUrl: "..." }
    if (typeof data.downloadUrl === "string") return data.downloadUrl;
    // SDK backend: { downloads: [{ format, downloadUrl, filename }] }
    const downloads = data.downloads as { format: string; downloadUrl: string }[] | undefined;
    if (Array.isArray(downloads)) {
        const glb = downloads.find((d) => d.format === "glb") ?? downloads[0];
        return glb?.downloadUrl;
    }
    return undefined;
}

/** Pick GLB URLs from batch response */
function extractBatchGlbUrls(data: Record<string, unknown>): string[] {
    // REST backend: { downloadUrls: [...] }
    if (Array.isArray(data.downloadUrls)) return data.downloadUrls as string[];
    // SDK backend: { subTasks: [{ downloads: [...] }] }
    const subTasks = data.subTasks as { downloads: { format: string; downloadUrl: string }[] }[] | undefined;
    if (Array.isArray(subTasks)) {
        return subTasks.map((t) => {
            const glb = t.downloads.find((d) => d.format === "glb") ?? t.downloads[0];
            return glb.downloadUrl;
        });
    }
    return [];
}

export function ModelsPanel({ active, modelLoaded, onLoadModel, onLoadModels }: ModelsPanelProps) {
    const [status, setStatus] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    // On mount, check for ?task= query param and fetch existing result
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const existingTaskId = params.get("task");
        if (!existingTaskId) return;

        setLoading(true);
        setStatus("Fetching existing task result…");
        fetch(`/api/task/${encodeURIComponent(existingTaskId)}`)
            .then((r) => r.json())
            .then((data) => {
                const downloadUrl = extractGlbUrl(data);
                if (downloadUrl) {
                    setStatus("Model loaded!");
                    onLoadModel(downloadUrl);
                } else if (data.status && data.status !== "completed") {
                    setStatus(`Task still ${data.status} — click to regenerate.`);
                } else {
                    throw new Error(data.error || "Could not fetch result");
                }
            })
            .catch((e) => {
                setStatus(e.message);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    const generate = async () => {
        setLoading(true);
        setError(false);
        setStatus("Generating Dragon Cup…");
        try {
            const res = await fetch("/api/generate", { method: "POST" });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            const downloadUrl = extractGlbUrl(data);
            if (!downloadUrl) throw new Error("No GLB download URL returned");

            // Store task ID in URL for refresh
            if (data.taskId) {
                const url = new URL(window.location.href);
                url.searchParams.set("task", data.taskId);
                window.history.replaceState({}, "", url.toString());
            }

            setStatus("Model loaded!");
            onLoadModel(downloadUrl);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            setStatus(msg);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const generateBatch = async () => {
        setLoading(true);
        setError(false);
        setStatus("Generating batch (3 variations)…");
        try {
            const res = await fetch("/api/generate-batch", { method: "POST" });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            const urls = extractBatchGlbUrls(data);
            if (urls.length === 0) throw new Error("No GLB downloads returned");
            setStatus(`Loaded ${urls.length} models!`);
            onLoadModels(urls);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            setStatus(msg);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`panel ${active ? "" : "hidden"} ${modelLoaded ? "minimized" : ""}`}>
            <div className="actions">
                <button className="btn" disabled={loading} onClick={generate}>
                    Generate Dragon Cup
                </button>
                <button className="btn btn-outline" disabled={loading} onClick={generateBatch}>
                    Generate Batch (3 Cups)
                </button>
            </div>
            <p className={`status ${error ? "error" : ""}`}>{status}</p>
        </div>
    );
}
