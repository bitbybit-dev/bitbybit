// ---------------------------------------------------------------------------
// Files endpoint — /api/v1/files
// ---------------------------------------------------------------------------

import type {
    FileUploadBody,
    UploadResult,
    ConfirmResult,
    FileDetail,
    FileList,
    FileListQuery,
} from "../types/index.js";
import { BitbybitApiError } from "../errors.js";
import { unwrap } from "../unwrap.js";

type Fetcher = (method: string, path: string, body?: unknown) => Promise<Response>;

export class FilesEndpoint {
    constructor(private readonly fetch: Fetcher) {}

    /**
     * Request a pre-signed upload URL.
     * After receiving the result, PUT the file bytes to `uploadUrl`, then call `confirm()`.
     */
    async upload(body: FileUploadBody): Promise<UploadResult> {
        return unwrap(await this.fetch("POST", "/api/v1/files/upload", body));
    }

    /** Confirm that bytes have been uploaded to the pre-signed URL. */
    async confirm(fileId: string): Promise<ConfirmResult> {
        return unwrap(
            await this.fetch("POST", `/api/v1/files/${encodeURIComponent(fileId)}/confirm`),
        );
    }

    /** Get details for a single file. */
    async get(fileId: string): Promise<FileDetail> {
        return unwrap(
            await this.fetch("GET", `/api/v1/files/${encodeURIComponent(fileId)}`),
        );
    }

    /** List uploaded files with optional filters. */
    async list(query?: FileListQuery): Promise<FileList> {
        const params = new URLSearchParams();
        if (query?.page != null) params.set("page", String(query.page));
        if (query?.limit != null) params.set("limit", String(query.limit));
        if (query?.status) params.set("status", query.status);
        const qs = params.toString();
        return unwrap(await this.fetch("GET", `/api/v1/files${qs ? `?${qs}` : ""}`));
    }

    /** Delete a file. */
    async delete(fileId: string): Promise<{ deleted: boolean }> {
        return unwrap(
            await this.fetch("DELETE", `/api/v1/files/${encodeURIComponent(fileId)}`),
        );
    }

    /**
     * Convenience: upload file bytes end-to-end.
     * 1. Requests a pre-signed URL
     * 2. PUTs the bytes
     * 3. Confirms the upload
     */
    async uploadBytes(
        filename: string,
        data: Uint8Array | ArrayBuffer,
        contentType = "application/octet-stream",
    ): Promise<ConfirmResult> {
        const uploadResult = await this.upload({
            filename,
            contentType,
            bytes: data.byteLength,
        });

        const putRes = await fetch(uploadResult.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": contentType },
            body: data as BodyInit,
        });

        if (!putRes.ok) {
            throw new BitbybitApiError({
                code: "UPLOAD_FAILED",
                message: `PUT to upload URL failed: ${putRes.status} ${putRes.statusText}`,
                statusCode: putRes.status,
            });
        }

        return this.confirm(uploadResult.fileId);
    }
}
