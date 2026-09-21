import { useEffect, useState, type ReactElement } from "react";
import { downloadsOf, glbUrlOf, readJson, stringOf } from "../api";

interface ModelsPanelProps {
    active: boolean;
    modelLoaded: boolean;
    onLoadModel: (url: string) => void;
    onLoadModels: (urls: string[]) => void;
}

function glbUrlIn(data: Record<string, unknown>): string | undefined {
    return stringOf(data, "downloadUrl") ?? glbUrlOf(downloadsOf(data["downloads"]));
}

function batchGlbUrlsIn(data: Record<string, unknown>): string[] {
    const listed = data["downloadUrls"];
    if (Array.isArray(listed)) return listed.filter((entry: unknown): entry is string => typeof entry === "string");
    const subTasks = data["subTasks"];
    if (!Array.isArray(subTasks)) return [];
    return subTasks.flatMap((task: unknown) => {
        const downloads = task !== null && typeof task === "object" && "downloads" in task ? downloadsOf(task.downloads) : [];
        const glbUrl = glbUrlOf(downloads);
        return glbUrl ? [glbUrl] : [];
    });
}

function rememberTask(taskId: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set("task", taskId);
    window.history.replaceState({}, "", url.toString());
}

const taskFromUrl = (): string | null => new URLSearchParams(window.location.search).get("task");

export function ModelsPanel({ active, modelLoaded, onLoadModel, onLoadModels }: ModelsPanelProps): ReactElement {
    const [existingTaskId] = useState(taskFromUrl);
    const [status, setStatus] = useState(existingTaskId ? "Fetching the existing task result..." : "");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(existingTaskId !== null);

    useEffect(() => {
        if (!existingTaskId) return;
        let cancelled = false;
        const load = async (): Promise<void> => {
            try {
                const data = await readJson(await fetch(`/api/task/${encodeURIComponent(existingTaskId)}`));
                if (cancelled) return;
                const downloadUrl = glbUrlIn(data);
                const taskStatus = stringOf(data, "status");
                if (downloadUrl) {
                    setStatus("Model loaded!");
                    onLoadModel(downloadUrl);
                } else if (taskStatus !== undefined && taskStatus !== "completed") {
                    setStatus(`Task still ${taskStatus} - click to regenerate.`);
                } else {
                    throw new Error(stringOf(data, "error") ?? "Could not fetch the result");
                }
            } catch (caught: unknown) {
                if (cancelled) return;
                setStatus(caught instanceof Error ? caught.message : "Could not fetch the result");
                setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        void load();
        return () => { cancelled = true; };
    }, [existingTaskId, onLoadModel]);

    const generate = async (): Promise<void> => {
        setLoading(true);
        setError(false);
        setStatus("Generating the dragon cup...");
        try {
            const response = await fetch("/api/generate", { method: "POST" });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await readJson(response);
            const downloadUrl = glbUrlIn(data);
            if (!downloadUrl) throw new Error("No GLB download URL returned");

            const taskId = stringOf(data, "taskId");
            if (taskId) rememberTask(taskId);

            setStatus("Model loaded!");
            onLoadModel(downloadUrl);
        } catch (caught: unknown) {
            setStatus(caught instanceof Error ? caught.message : "Unknown error");
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const generateBatch = async (): Promise<void> => {
        setLoading(true);
        setError(false);
        setStatus("Generating a batch of three variations...");
        try {
            const response = await fetch("/api/generate-batch", { method: "POST" });
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const urls = batchGlbUrlsIn(await readJson(response));
            if (urls.length === 0) throw new Error("No GLB downloads returned");
            setStatus(`Loaded ${urls.length} models!`);
            onLoadModels(urls);
        } catch (caught: unknown) {
            setStatus(caught instanceof Error ? caught.message : "Unknown error");
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`panel ${active ? "" : "hidden"} ${modelLoaded ? "minimized" : ""}`}>
            <div className="actions">
                <button className="btn" disabled={loading} onClick={() => { void generate(); }}>
                    Generate Dragon Cup
                </button>
                <button className="btn btn-outline" disabled={loading} onClick={() => { void generateBatch(); }}>
                    Generate Batch (3 Cups)
                </button>
            </div>
            <p className={`status ${error ? "error" : ""}`}>{status}</p>
        </div>
    );
}
