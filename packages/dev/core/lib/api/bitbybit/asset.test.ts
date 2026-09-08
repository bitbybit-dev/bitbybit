import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Asset } from "./asset";
import { AssetManager } from "../../asset-manager";

// The asset API is the boundary between a script and the files around it: the project's own assets,
// which the asset manager fetches, the network, and the browser's file types. Nothing here computes
// anything, so what is asserted is what each member asks for and what it hands back.

const A_URL = "https://example.test/parts/dada.png";
const CONTENT = "hello";

const textFile = (name = "part.txt", text = CONTENT): File => new File([text], name, { type: "text/plain" });

describe("Asset unit tests", () => {
    let asset: Asset;
    let assetManager: AssetManager;

    beforeEach(() => {
        assetManager = new AssetManager();
        assetManager.getAsset = vi.fn();
        assetManager.getLocalAsset = vi.fn();
        assetManager.downloadFile = vi.fn();
        asset = new Asset();
        asset.assetManager = assetManager;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("getFile", () => {
        it("should ask the asset manager for the file by name", () => {
            // Act
            void asset.getFile({ fileName: "part.step" });

            // Assert
            expect(assetManager.getAsset).toHaveBeenCalledWith("part.step");
        });
    });

    describe("getTextFile", () => {
        it("should read the asset the manager found as text", async () => {
            // Arrange
            vi.mocked(assetManager.getAsset).mockResolvedValue(textFile());

            // Act
            const result = await asset.getTextFile({ fileName: "part.txt" });

            // Assert
            expect(result).toBe(CONTENT);
        });
    });

    describe("getLocalFile", () => {
        it("should ask the asset manager for the local file by name", () => {
            // Act
            void asset.getLocalFile({ fileName: "part.step" });

            // Assert
            expect(assetManager.getLocalAsset).toHaveBeenCalledWith("part.step");
        });
    });

    describe("getLocalTextFile", () => {
        it("should read a single local asset as text", async () => {
            // Arrange
            vi.mocked(assetManager.getLocalAsset).mockResolvedValue(textFile());

            // Act
            const result = await asset.getLocalTextFile({ fileName: "part.txt" });

            // Assert
            expect(result).toBe(CONTENT);
        });

        it("should read every local asset as text when the name matched several", async () => {
            // Arrange
            vi.mocked(assetManager.getLocalAsset).mockResolvedValue([textFile("a.txt", "first"), textFile("b.txt", "second")]);

            // Act
            const result = await asset.getLocalTextFile({ fileName: "*.txt" });

            // Assert
            expect(result).toEqual(["first", "second"]);
        });
    });

    describe("fetching from the network", () => {
        const stubFetch = (response: Partial<Response>): void => {
            vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(response)));
        };

        it("should hand back the blob the url answered with", async () => {
            // Arrange
            const blob = new Blob([CONTENT]);
            stubFetch({ blob: () => Promise.resolve(blob) });

            // Act
            const result = await asset.fetchBlob({ url: A_URL });

            // Assert
            expect(result).toBe(blob);
        });

        it("should name the fetched file after the last part of the url", async () => {
            // Arrange
            stubFetch({ blob: () => Promise.resolve(new Blob([CONTENT])) });

            // Act
            const result = await asset.fetchFile({ url: A_URL });

            // Assert
            expect(result.name).toBe("dada.png");
        });

        it("should drop a query string from the file name", async () => {
            // Arrange
            stubFetch({ blob: () => Promise.resolve(new Blob([CONTENT])) });

            // Act
            const result = await asset.fetchFile({ url: `${A_URL}?v=2` });

            // Assert
            expect(result.name).toBe("dada.png");
        });

        it("should hand back the json the url answered with", async () => {
            // Arrange
            stubFetch({ json: () => Promise.resolve({ parts: 3 }) });

            // Act
            const result = await asset.fetchJSON({ url: A_URL });

            // Assert
            expect(result).toEqual({ parts: 3 });
        });

        it("should hand back the text the url answered with", async () => {
            // Arrange
            stubFetch({ text: () => Promise.resolve(CONTENT) });

            // Act
            const result = await asset.fetchText({ url: A_URL });

            // Assert
            expect(result).toBe(CONTENT);
        });
    });

    describe("createObjectURL", () => {
        it("should make a url the browser can read the file back from", () => {
            // Act
            const result = asset.createObjectURL({ file: new Blob([CONTENT]) });

            // Assert
            expect(result.startsWith("blob:")).toBe(true);
        });
    });

    describe("createObjectURLs", () => {
        it("should make one url per file", () => {
            // Act
            const result = asset.createObjectURLs({ files: [new Blob([CONTENT]), new Blob([CONTENT])] });

            // Assert
            expect(result).toHaveLength(2);
            expect(result[0]!.startsWith("blob:")).toBe(true);
        });
    });

    describe("download", () => {
        it("should wrap text in a blob of the content type it was given", () => {
            // Act
            asset.download({ fileName: "part", content: CONTENT, extension: "txt", contentType: "text/plain" });

            // Assert
            const [blob, fileName, extension, contentType] = vi.mocked(assetManager.downloadFile).mock.calls[0]!;
            expect(blob.type).toBe("text/plain");
            expect([fileName, extension, contentType]).toEqual(["part", "txt", "text/plain"]);
        });

        it("should pass a blob on as it stands", () => {
            // Arrange
            const blob = new Blob([CONTENT], { type: "application/step" });

            // Act
            asset.download({ fileName: "part", content: blob, extension: "step", contentType: "application/step" });

            // Assert
            expect(vi.mocked(assetManager.downloadFile).mock.calls[0]![0]).toBe(blob);
        });
    });

    describe("toArrayBuffer", () => {
        it("should read the file into a buffer of its own length", async () => {
            // Act
            const result = await asset.toArrayBuffer({ file: new Blob([CONTENT]) });

            // Assert
            expect(result.byteLength).toBe(CONTENT.length);
        });
    });

    describe("toUint8Array", () => {
        it("should read the file into bytes", async () => {
            // Act
            const result = await asset.toUint8Array({ file: new Blob(["AB"]) });

            // Assert
            expect(Array.from(result)).toEqual([65, 66]);
        });
    });

    describe("blobToFile", () => {
        it("should name the file and keep the type it was given", () => {
            // Act
            const result = asset.blobToFile({ blob: new Blob([CONTENT]), fileName: "part.txt", mimeType: "text/plain" });

            // Assert
            expect(result.name).toBe("part.txt");
            expect(result.type).toBe("text/plain");
        });

        it("should keep the blob's own type when it was given none", () => {
            // Act
            const result = asset.blobToFile({ blob: new Blob([CONTENT], { type: "application/step" }), fileName: "part.step" });

            // Assert
            expect(result.type).toBe("application/step");
        });
    });

    describe("fileToBlob", () => {
        it("should hand back the whole file as a blob of the same type", async () => {
            // Act
            const result = asset.fileToBlob({ file: textFile() });

            // Assert
            expect(result.type).toBe("text/plain");
            await expect(result.text()).resolves.toBe(CONTENT);
        });
    });

    describe("arrayBufferToUint8Array", () => {
        it("should read the buffer as bytes", () => {
            // Act
            const result = asset.arrayBufferToUint8Array({ arrayBuffer: new Uint8Array([1, 2, 3]).buffer });

            // Assert
            expect(Array.from(result)).toEqual([1, 2, 3]);
        });
    });

    describe("uint8ArrayToArrayBuffer", () => {
        it("should hand back a buffer holding the same bytes", () => {
            // Act
            const result = asset.uint8ArrayToArrayBuffer({ uint8Array: new Uint8Array([1, 2, 3]) });

            // Assert
            expect(Array.from(new Uint8Array(result))).toEqual([1, 2, 3]);
        });

        it("should copy only the view's own window of a shared buffer", () => {
            // Arrange
            const view = new Uint8Array(new Uint8Array([1, 2, 3, 4]).buffer, 1, 2);

            // Act
            const result = asset.uint8ArrayToArrayBuffer({ uint8Array: view });

            // Assert
            expect(Array.from(new Uint8Array(result))).toEqual([2, 3]);
        });
    });
});
