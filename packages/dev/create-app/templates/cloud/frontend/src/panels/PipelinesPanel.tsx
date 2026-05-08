import { useEffect, useState } from "react";

interface Download {
    format: string;
    downloadUrl: string;
    filename: string;
}

interface PipelineResult {
    taskId?: string;
    downloads?: Download[];
    downloadUrl?: string;
}

interface PipelinesPanelProps {
    active: boolean;
    modelLoaded: boolean;
    onLoadModel: (url: string) => void;
}

function findGlbUrl(data: PipelineResult): string | undefined {
    const glb = data.downloads?.find((d) => d.format === "glb" || d.format === "gltf");
    return glb?.downloadUrl ?? data.downloadUrl ?? data.downloads?.[0]?.downloadUrl;
}

function setTaskInUrl(taskId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("pipeline-task", taskId);
    window.history.replaceState({}, "", url.toString());
}

export function PipelinesPanel({ active, modelLoaded, onLoadModel }: PipelinesPanelProps) {
    const [status, setStatus] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PipelineResult | null>(null);
    const [showRawJson, setShowRawJson] = useState(false);
    const [activePipeline, setActivePipeline] = useState<string | null>(null);

    // On mount, check for ?pipeline-task= and fetch existing result
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const existingTaskId = params.get("pipeline-task");
        if (!existingTaskId) return;

        setLoading(true);
        setStatus("Fetching existing pipeline result…");
        fetch(`/api/task/${encodeURIComponent(existingTaskId)}`)
            .then((r) => r.json())
            .then((data: PipelineResult & { status?: string; error?: string }) => {
                if (data.status && data.status !== "completed") {
                    setStatus(`Task still ${data.status} — run a pipeline to try again.`);
                    return;
                }
                setResult(data);
                const glbUrl = findGlbUrl(data);
                if (glbUrl) {
                    onLoadModel(glbUrl);
                    setStatus("Pipeline result loaded from URL!");
                } else {
                    setStatus("Pipeline result loaded — no 3D preview available.");
                }
            })
            .catch((e) => {
                setStatus(e instanceof Error ? e.message : "Failed to fetch task");
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    const runPipeline = async (endpoint: string, label: string, expectsFile?: File) => {
        setLoading(true);
        setError(false);
        setResult(null);
        setShowRawJson(false);
        setActivePipeline(endpoint);
        setStatus(`Running ${label}…`);
        try {
            let res: Response;
            if (expectsFile) {
                const formData = new FormData();
                formData.append("file", expectsFile);
                res = await fetch(endpoint, { method: "POST", body: formData });
            } else {
                res = await fetch(endpoint, { method: "POST" });
            }
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data: PipelineResult = await res.json();
            setResult(data);

            if (data.taskId) {
                setTaskInUrl(data.taskId);
            }

            const glbUrl = findGlbUrl(data);
            if (glbUrl) {
                onLoadModel(glbUrl);
                setStatus(`${label} complete — model loaded!`);
            } else {
                setStatus(`${label} complete — see result below`);
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            setStatus(msg);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleFileInput = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".step,.stp";
        input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
                runPipeline("/api/pipeline/file-input", "File Input Pipeline", file);
            }
        };
        input.click();
    };

    const downloadFile = async (url: string, filename: string) => {
        try {
            const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}`;
            const res = await fetch(proxyUrl);
            if (!res.ok) throw new Error(`Download failed: ${res.status}`);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            // Fallback to direct link
            window.open(url, "_blank");
        }
    };

    const taskUrl = result?.taskId
        ? `${window.location.origin}${window.location.pathname}?pipeline-task=${result.taskId}`
        : null;

    const btnClass = (endpoint: string) =>
        `btn${activePipeline === endpoint ? "" : " btn-outline"}`;

    return (
        <div className={`panel ${active ? "" : "hidden"} ${modelLoaded ? "minimized" : ""}`}>
            <div className="actions">
                <button className={btnClass("/api/pipeline/translate-union-fillet")} disabled={loading} onClick={() => runPipeline("/api/pipeline/translate-union-fillet", "Translate, Union + Fillet")}>
                    Translate, Union + Fillet
                </button>
                <button className={btnClass("/api/pipeline/map-cylinders")} disabled={loading} onClick={() => runPipeline("/api/pipeline/map-cylinders", "Map Cylinders")}>
                    Map: Cylinders at Positions
                </button>
                <button className={btnClass("/api/pipeline/map-spheres")} disabled={loading} onClick={() => runPipeline("/api/pipeline/map-spheres", "Map Spheres")}>
                    Map: Spheres at Different Radii
                </button>
                <button className={btnClass("/api/pipeline/choice")} disabled={loading} onClick={() => runPipeline("/api/pipeline/choice", "Choice Conditional")}>
                    Choice: Conditional Shape
                </button>
                <button className={btnClass("/api/pipeline/file-input")} disabled={loading} onClick={handleFileInput}>
                    File Input: STEP → Fillet
                </button>
            </div>
            <p className={`status ${error ? "error" : ""}`}>{status}</p>
            {result && (
                <div className="result-card">
                    {result.taskId && (
                        <div className="result-row">
                            <span className="result-label">Task ID</span>
                            <code className="result-value">{result.taskId}</code>
                        </div>
                    )}
                    {taskUrl && (
                        <div className="result-row">
                            <span className="result-label">Permalink</span>
                            <a className="result-link" href={taskUrl}>{taskUrl}</a>
                        </div>
                    )}
                    {result.downloads && result.downloads.length > 0 && (
                        <table className="result-table">
                            <thead>
                                <tr><th>Format</th><th>Filename</th><th></th></tr>
                            </thead>
                            <tbody>
                                {result.downloads.map((d, i) => (
                                    <tr key={i}>
                                        <td><code>{d.format}</code></td>
                                        <td>{d.filename}</td>
                                        <td><a className="result-link" href="#" onClick={(e) => { e.preventDefault(); downloadFile(d.downloadUrl, d.filename); }}>Download</a></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {result.downloadUrl && !result.downloads && (
                        <div className="result-row">
                            <span className="result-label">Download</span>
                            <a className="result-link" href={result.downloadUrl} target="_blank" rel="noopener noreferrer">Download result</a>
                        </div>
                    )}
                    <button className="btn-raw-toggle" onClick={() => setShowRawJson((v) => !v)}>
                        {showRawJson ? "Hide" : "Show"} raw JSON
                    </button>
                    {showRawJson && <pre className="json-preview">{JSON.stringify(result, null, 2)}</pre>}
                </div>
            )}
        </div>
    );
}
