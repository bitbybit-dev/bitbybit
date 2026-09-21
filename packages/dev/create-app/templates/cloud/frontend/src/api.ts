export interface Download {
    format: string;
    downloadUrl: string;
    filename: string;
}

export async function readJson(response: Response): Promise<Record<string, unknown>> {
    const data: unknown = await response.json();
    return data !== null && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

export function stringOf(record: Record<string, unknown>, key: string): string | undefined {
    const value = record[key];
    return typeof value === "string" ? value : undefined;
}

export function isDownload(value: unknown): value is Download {
    return typeof value === "object" && value !== null
        && "format" in value && typeof value.format === "string"
        && "downloadUrl" in value && typeof value.downloadUrl === "string"
        && "filename" in value && typeof value.filename === "string";
}

export function downloadsOf(value: unknown): Download[] {
    return Array.isArray(value) ? value.filter(isDownload) : [];
}

export function glbUrlOf(downloads: Download[]): string | undefined {
    const glb = downloads.find((download) => download.format === "glb" || download.format === "gltf") ?? downloads[0];
    return glb?.downloadUrl;
}
