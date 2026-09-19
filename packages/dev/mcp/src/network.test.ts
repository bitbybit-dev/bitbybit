import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { IndexNotPublishedError, loadIndex } from "./index-loader.js";
import { IndexReader } from "./index-reader.js";

const ownVersion = (JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string }).version;
const REGISTRY_URL = `https://registry.npmjs.org/@bitbybit-dev/mcp/${ownVersion}`;
const NOT_FOUND = 404;

async function publishedOnNpm(): Promise<boolean> {
    const response = await fetch(REGISTRY_URL);
    return response.status !== NOT_FOUND;
}

describe.skipIf(process.env["BITBYBIT_MCP_NETWORK"] !== "1")("the published index", () => {
    it("serves this package's version once the package is on npm, and describes a solid primitive", async (context) => {
        // Arrange
        let reader: IndexReader;
        try {
            reader = new IndexReader(await loadIndex({ version: ownVersion, cacheDir: null }));
        } catch (error) {
            if (error instanceof IndexNotPublishedError && !(await publishedOnNpm())) {
                context.skip();
                return;
            }
            throw error;
        }

        // Act
        const member = reader.get("occt.shapes.solid.createBox");

        // Assert
        expect(reader.version).toBe(ownVersion);
        expect(member?.tier).toBe("oss");
        expect(member?.params[0]?.fields?.map((field) => field.name)).toContain("width");
    });
});
