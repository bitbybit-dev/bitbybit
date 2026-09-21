import { useEffect, useState, type ReactElement } from "react";
import { downloadsOf, readJson, stringOf, type Download } from "../api";

interface PipelineResult {
    taskId?: string;
    status?: string;
    downloadUrl?: string;
    downloads: Download[];
    raw: Record<string, unknown>;
}

interface PipelinesPanelProps {
    active: boolean;
    modelLoaded: boolean;
    onLoadModel: (url: string) => void;
}

function pipelineResultOf(data: Record<string, unknown>): PipelineResult {
    const result: PipelineResult = { downloads: downloadsOf(data["downloads"]), raw: data };
    const taskId = stringOf(data, "taskId");
    if (taskId !== undefined) result.taskId = taskId;
    const status = stringOf(data, "status");
    if (status !== undefined) result.status = status;
    const downloadUrl = stringOf(data, "downloadUrl");
    if (downloadUrl !== undefined) result.downloadUrl = downloadUrl;
    return result;
}

function findGlbUrl(result: PipelineResult): string | undefined {
    const glb = result.downloads.find((download) => download.format === "glb" || download.format === "gltf");
    return glb?.downloadUrl ?? result.downloadUrl ?? result.downloads[0]?.downloadUrl;
}

function setTaskInUrl(taskId: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set("pipeline-task", taskId);
    window.history.replaceState({}, "", url.toString());
}

const taskFromUrl = (): string | null => new URLSearchParams(window.location.search).get("pipeline-task");

export function PipelinesPanel({ active, modelLoaded, onLoadModel }: PipelinesPanelProps): ReactElement {
    const [existingTaskId] = useState(taskFromUrl);
    const [status, setStatus] = useState(existingTaskId ? "Fetching the existing pipeline result..." : "");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(existingTaskId !== null);
    const [result, setResult] = useState<PipelineResult | null>(null);
    const [showRawJson, setShowRawJson] = useState(false);
    const [activePipeline, setActivePipeline] = useState<string | null>(null);

    useEffect(() => {
        if (!existingTaskId) return;
        let cancelled = false;
        const load = async (): Promise<void> => {
            try {
                const data = pipelineResultOf(await readJson(await fetch(`/api/task/${encodeURIComponent(existingTaskId)}`)));
                if (cancelled) return;
                if (data.status !== undefined && data.status !== "completed") {
                    setStatus(`Task still ${data.status} - run a pipeline to try again.`);
                    return;
                }
                setResult(data);
                const glbUrl = findGlbUrl(data);
                if (glbUrl) {
                    onLoadModel(glbUrl);
                    setStatus("Pipeline result loaded from the URL.");
                } else {
                    setStatus("Pipeline result loaded - no 3D preview available.");
                }
            } catch (caught: unknown) {
                if (cancelled) return;
                setStatus(caught instanceof Error ? caught.message : "Failed to fetch the task");
                setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [existingTaskId, onLoadModel]);

    const runPipeline = async (endpoint: string, label: string, stepFile?: File): Promise<void> => {
        setLoading(true);
        setError(false);
        setResult(null);
        setShowRawJson(false);
        setActivePipeline(endpoint);
        setStatus(`Running ${label}...`);
        try {
            const formData = new FormData();
            if (stepFile) formData.append("file", stepFile);
            const response = await fetch(endpoint, stepFile ? { method: "POST", body: formData } : { method: "POST" });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = pipelineResultOf(await readJson(response));
            setResult(data);

            if (data.taskId) setTaskInUrl(data.taskId);

            const glbUrl = findGlbUrl(data);
            if (glbUrl) {
                onLoadModel(glbUrl);
                setStatus(`${label} complete - model loaded!`);
            } else {
                setStatus(`${label} complete - see the result below`);
            }
        } catch (caught: unknown) {
            setStatus(caught instanceof Error ? caught.message : "Unknown error");
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleFileInput = (): void => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".step,.stp";
        input.onchange = () => {
            const file = input.files?.[0];
            if (file) void runPipeline("/api/pipeline/file-input", "File Input Pipeline", file);
        };
        input.click();
    };

    const downloadFile = async (url: string, filename: string): Promise<void> => {
        try {
            const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            window.open(url, "_blank");
        }
    };

    const taskUrl = result?.taskId
        ? `${window.location.origin}${window.location.pathname}?pipeline-task=${result.taskId}`
        : null;

    const btnClass = (endpoint: string): string => `btn${activePipeline === endpoint ? "" : " btn-outline"}`;

    return (
        <div className={`panel ${active ? "" : "hidden"} ${modelLoaded ? "minimized" : ""}`}>
            <div className="actions">
                <button className={btnClass("/api/pipeline/translate-union-fillet")} disabled={loading} onClick={() => { void runPipeline("/api/pipeline/translate-union-fillet", "Translate, Union + Fillet"); }}>
                    Translate, Union + Fillet
                </button>
                <button className={btnClass("/api/pipeline/map-cylinders")} disabled={loading} onClick={() => { void runPipeline("/api/pipeline/map-cylinders", "Map Cylinders"); }}>
                    Map: Cylinders at Positions
                </button>
                <button className={btnClass("/api/pipeline/map-spheres")} disabled={loading} onClick={() => { void runPipeline("/api/pipeline/map-spheres", "Map Spheres"); }}>
                    Map: Spheres at Different Radii
                </button>
                <button className={btnClass("/api/pipeline/choice")} disabled={loading} onClick={() => { void runPipeline("/api/pipeline/choice", "Choice Conditional"); }}>
                    Choice: Conditional Shape
                </button>
                <button className={btnClass("/api/pipeline/file-input")} disabled={loading} onClick={handleFileInput}>
                    File Input: STEP to Fillet
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
                    {result.downloads.length > 0 && (
                        <table className="result-table">
                            <thead>
                                <tr><th>Format</th><th>Filename</th><th></th></tr>
                            </thead>
                            <tbody>
                                {result.downloads.map((download) => (
                                    <tr key={download.downloadUrl}>
                                        <td><code>{download.format}</code></td>
                                        <td>{download.filename}</td>
                                        <td><a className="result-link" href="#" onClick={(event) => { event.preventDefault(); void downloadFile(download.downloadUrl, download.filename); }}>Download</a></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {result.downloadUrl && result.downloads.length === 0 && (
                        <div className="result-row">
                            <span className="result-label">Download</span>
                            <a className="result-link" href={result.downloadUrl} target="_blank" rel="noopener noreferrer">Download result</a>
                        </div>
                    )}
                    <button className="btn-raw-toggle" onClick={() => { setShowRawJson((shown) => !shown); }}>
                        {showRawJson ? "Hide" : "Show"} raw JSON
                    </button>
                    {showRawJson && <pre className="json-preview">{JSON.stringify(result.raw, null, 2)}</pre>}
                </div>
            )}
        </div>
    );
}
