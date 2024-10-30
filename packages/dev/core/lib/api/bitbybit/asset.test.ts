import { Asset } from "./asset";
import { AssetManager } from "../../asset-manager";

describe("Asset unit tests", () => {
    let asset: Asset;
    let assetManager: AssetManager;

    beforeAll(async () => {
        assetManager = new AssetManager();
        assetManager.fetch = jest.fn();
        assetManager.getAsset = jest.fn();
        assetManager.getLocalAsset = jest.fn();

        asset = new Asset();
        asset.assetManager = assetManager;
    });

    it("should get file", async () => {
        asset.getFile({ fileName: "test" });
        expect(assetManager.getAsset).toBeCalledWith("test");
    });

    it("should get file", async () => {
        asset.getLocalFile({ fileName: "test" });
        expect(assetManager.getLocalAsset).toBeCalledWith("test");
    });

    it("should fetch blob", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                blob: () => Promise.resolve({ mock: "blob" }),
            })
        ) as jest.Mock;
        const res = await asset.fetchBlob({ url: "https://test.com/dada.png" });
        expect(res).toEqual({ mock: "blob" });
    });

    it("should fetch file", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                blob: () => Promise.resolve(mockBlob(10, "plain/txt")),
            })
        ) as jest.Mock;
        global.File = FileMock as jest.Mock;
        const res = await asset.fetchFile({ url: "https://test.com/dada.png" });
        expect(res instanceof File).toBeTruthy();
        expect(res.name).toEqual("dada.png");
    });

    it("should fetch json", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ mock: "json" }),
            })
        ) as jest.Mock;
        const res = await asset.fetchJSON({ url: "https://test.com/dada" });
        expect(res).toEqual({ mock: "json" });
    });

    it("should fetch text", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => Promise.resolve({ mock: "text" }),
            })
        ) as jest.Mock;
        const res = await asset.fetchText({ url: "https://test.com/dada" });
        expect(res).toEqual({ mock: "text" });
    });

    it("should create object URL", async () => {
        const res = await asset.createObjectURL({ file: mockBlob(10, "plain/txt") });
        expect(res).toContain("blob:nodedata:");
    });

    it("should create object URLs", async () => {
        const res = await asset.createObjectURLs({ files: [mockBlob(10, "plain/txt"), mockBlob(20, "plain/txt")] });
        expect(res.length).toBe(2);
        expect(res[0]).toContain("blob:nodedata:");
        expect(res[1]).toContain("blob:nodedata:");
    });
});

function mockBlob(size, mimeType) {
    size = size || 1024;
    mimeType = mimeType || "plain/txt";

    function range(count) {
        let output = "";
        for (let i = 0; i < count; i++) {
            output += "a";
        }
        return output;
    }

    const blob = new Blob([range(size)], { type: mimeType });
    return blob;
}

class FileMock {
    parts;
    name;
    constructor(parts: any, name: string) {
        this.parts = parts;
        this.name = name;
    }
}
