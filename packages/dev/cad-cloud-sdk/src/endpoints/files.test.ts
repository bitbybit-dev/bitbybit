import { describe, it, expect, afterEach, vi } from "vitest";
import { FilesEndpoint } from "./files.js";
import { okResponse, spyFetcher } from "../__test__/helpers.js";
import { BitbybitApiError } from "../errors.js";

describe("FilesEndpoint", () => {
    describe("upload", () => {
        it("sends POST to /api/v1/files/upload with body", async () => {
            // Arrange
            const uploadResult = { fileId: "f-1", uploadUrl: "https://r2.example.com/upload" };
            const { fn, calls } = spyFetcher(okResponse(uploadResult));
            const files = new FilesEndpoint(fn);
            const body = { filename: "test.step", contentType: "application/step", bytes: 1024 };

            // Act
            const result = await files.upload(body);

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/files/upload");
            expect(calls[0]!.body).toStrictEqual(body);
            expect(result).toStrictEqual(uploadResult);
        });
    });

    describe("confirm", () => {
        it("sends POST to /api/v1/files/{id}/confirm", async () => {
            // Arrange
            const confirmResult = { fileId: "f-1", status: "confirmed" };
            const { fn, calls } = spyFetcher(okResponse(confirmResult));
            const files = new FilesEndpoint(fn);

            // Act
            const result = await files.confirm("f-1");

            // Assert
            expect(calls[0]!.method).toBe("POST");
            expect(calls[0]!.path).toBe("/api/v1/files/f-1/confirm");
            expect(result).toStrictEqual(confirmResult);
        });
    });

    describe("get", () => {
        it("sends GET to /api/v1/files/{id}", async () => {
            // Arrange
            const fileDetail = { fileId: "f-1", filename: "test.step", status: "confirmed" };
            const { fn, calls } = spyFetcher(okResponse(fileDetail));
            const files = new FilesEndpoint(fn);

            // Act
            const result = await files.get("f-1");

            // Assert
            expect(calls[0]!.method).toBe("GET");
            expect(calls[0]!.path).toBe("/api/v1/files/f-1");
            expect(result).toStrictEqual(fileDetail);
        });
    });

    describe("list", () => {
        it("sends GET to /api/v1/files without query when none provided", async () => {
            // Arrange
            const fileList = { files: [], total: 0 };
            const { fn, calls } = spyFetcher(okResponse(fileList));
            const files = new FilesEndpoint(fn);

            // Act
            const result = await files.list();

            // Assert
            expect(calls[0]!.method).toBe("GET");
            expect(calls[0]!.path).toBe("/api/v1/files");
            expect(result).toStrictEqual(fileList);
        });

        it("appends query parameters when provided", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({ files: [], total: 0 }));
            const files = new FilesEndpoint(fn);

            // Act
            await files.list({ page: 1, limit: 5, status: "confirmed" });

            // Assert
            expect(calls[0]!.path).toContain("page=1");
            expect(calls[0]!.path).toContain("limit=5");
            expect(calls[0]!.path).toContain("status=confirmed");
        });
    });

    describe("delete", () => {
        it("sends DELETE to /api/v1/files/{id}", async () => {
            // Arrange
            const { fn, calls } = spyFetcher(okResponse({ deleted: true }));
            const files = new FilesEndpoint(fn);

            // Act
            const result = await files.delete("f-1");

            // Assert
            expect(calls[0]!.method).toBe("DELETE");
            expect(calls[0]!.path).toBe("/api/v1/files/f-1");
            expect(result).toStrictEqual({ deleted: true });
        });
    });

    describe("uploadBytes", () => {
        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it("asks for an upload url, puts the bytes there, and confirms the file", async () => {
            // Arrange
            const puts: { url: string; init: RequestInit }[] = [];
            vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
                puts.push({ url, init });
                return Promise.resolve(new Response(null, { status: 200 }));
            });
            const { fn, calls } = spyFetcher(
                okResponse({ fileId: "f-1", uploadUrl: "https://store.test/put" }),
                okResponse({ fileId: "f-1", status: "ready" }),
            );
            const files = new FilesEndpoint(fn);
            const bytes = new Uint8Array([1, 2, 3]);

            // Act
            const result = await files.uploadBytes("part.step", bytes, "application/step");

            // Assert
            expect(calls[0]!.body).toStrictEqual({ filename: "part.step", contentType: "application/step", bytes: 3 });
            expect(puts[0]!.url).toBe("https://store.test/put");
            expect(result).toStrictEqual({ fileId: "f-1", status: "ready" });
        });

        it("puts the bytes as the content type it was given", async () => {
            // Arrange
            const puts: { init: RequestInit }[] = [];
            vi.stubGlobal("fetch", (_url: string, init: RequestInit) => {
                puts.push({ init });
                return Promise.resolve(new Response(null, { status: 200 }));
            });
            const { fn } = spyFetcher(
                okResponse({ fileId: "f-1", uploadUrl: "https://store.test/put" }),
                okResponse({ fileId: "f-1", status: "ready" }),
            );
            const files = new FilesEndpoint(fn);

            // Act
            await files.uploadBytes("part.bin", new Uint8Array([1]));

            // Assert
            expect(puts[0]!.init.method).toBe("PUT");
            expect(puts[0]!.init.headers).toStrictEqual({ "Content-Type": "application/octet-stream" });
        });

        it("fails with what the store said when the put is refused", async () => {
            // Arrange
            vi.stubGlobal("fetch", () => Promise.resolve(new Response(null, { status: 403, statusText: "Forbidden" })));
            const { fn } = spyFetcher(
                okResponse({ fileId: "f-1", uploadUrl: "https://store.test/put" }),
                okResponse({ fileId: "f-1", uploadUrl: "https://store.test/put" }),
            );
            const files = new FilesEndpoint(fn);

            // Act & Assert
            await expect(files.uploadBytes("part.step", new Uint8Array([1]))).rejects.toThrow(BitbybitApiError);
            await expect(files.uploadBytes("part.step", new Uint8Array([1]))).rejects.toThrow("PUT to upload URL failed: 403 Forbidden");
        });
    });
});
