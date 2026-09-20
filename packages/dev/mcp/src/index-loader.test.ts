import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { IndexNotPublishedError, defaultCacheDir, indexUrl, isApiIndex, loadIndex } from "./index-loader.js";
import { fixtureIndex } from "./__fixtures__/load.js";

const temporaryDirectories: string[] = [];
const temporaryDirectory = (): string => {
    const directory = mkdtempSync(join(tmpdir(), "bitbybit-mcp-test-"));
    temporaryDirectories.push(directory);
    return directory;
};

afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function fetchAnswering(status: number, body: string): { fetch: typeof fetch; calls: string[] } {
    const calls: string[] = [];
    const fake = (input: RequestInfo | URL): Promise<Response> => {
        calls.push(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
        return Promise.resolve(new Response(body, { status }));
    };
    return { fetch: fake, calls };
}

describe("indexUrl", () => {
    it("addresses the index by exact version", () => {
        // Assert
        expect(indexUrl("1.2.5")).toBe("https://git-cdn.bitbybit.dev/v1.2.5/ai-context/index.json");
        expect(indexUrl("1.4.0-rc.1")).toBe("https://git-cdn.bitbybit.dev/v1.4.0-rc.1/ai-context/index.json");
    });

    it("refuses a moving or partial version", () => {
        // Act & Assert
        expect(() => indexUrl("latest")).toThrow("not an exact version");
        expect(() => indexUrl("1.3")).toThrow("not an exact version");
    });
});

describe("defaultCacheDir", () => {
    it("honours XDG_CACHE_HOME", () => {
        // Assert
        expect(defaultCacheDir({ XDG_CACHE_HOME: "/tmp/xdg" })).toBe(join("/tmp/xdg", "bitbybit-mcp"));
        expect(defaultCacheDir({})).toContain(join(".cache", "bitbybit-mcp"));
    });

    it("treats an empty XDG_CACHE_HOME as unset instead of caching into the working directory", () => {
        // Act
        const directory = defaultCacheDir({ XDG_CACHE_HOME: "" });

        // Assert
        expect(directory).toContain(join(".cache", "bitbybit-mcp"));
        expect(directory.startsWith("bitbybit-mcp")).toBe(false);
    });
});

describe("isApiIndex", () => {
    it("accepts the fixture and refuses a member without a path, a name, engines or examples", () => {
        // Arrange
        const index = fixtureIndex();
        const broken = { ...index, members: [{ ...index.members[0], name: undefined }] };

        // Act
        const verdicts = [isApiIndex(index, index.version), isApiIndex(broken, index.version), isApiIndex({ version: index.version, members: [] }, index.version)];

        // Assert
        expect(verdicts).toEqual([true, false, false]);
    });
});

describe("loadIndex", () => {
    it("fetches the index of the version and caches it", async () => {
        // Arrange
        const cacheDir = temporaryDirectory();
        const { fetch, calls } = fetchAnswering(200, JSON.stringify(fixtureIndex()));

        // Act
        const index = await loadIndex({ version: "9.9.9", fetch, cacheDir });

        // Assert
        expect(index.version).toBe("9.9.9");
        expect(calls).toEqual(["https://git-cdn.bitbybit.dev/v9.9.9/ai-context/index.json"]);
        expect(existsSync(join(cacheDir, "index-v9.9.9.json"))).toBe(true);
    });

    it("leaves no partial file behind once the cache is written", async () => {
        // Arrange
        const cacheDir = temporaryDirectory();
        const index = fixtureIndex();
        const { fetch } = fetchAnswering(200, JSON.stringify(index));

        // Act
        await loadIndex({ version: index.version, fetch, cacheDir });

        // Assert
        expect(existsSync(join(cacheDir, `index-v${index.version}.json`))).toBe(true);
        expect(readdirSync(cacheDir).filter((name) => name.endsWith(".partial"))).toEqual([]);
    });

    it("answers the index when the cache directory cannot be created, and writes nothing", async () => {
        // Arrange
        const blocker = join(temporaryDirectory(), "not-a-directory");
        writeFileSync(blocker, "");
        const cacheDir = join(blocker, "cache");
        const { fetch } = fetchAnswering(200, JSON.stringify(fixtureIndex()));

        // Act
        const index = await loadIndex({ version: "9.9.9", fetch, cacheDir });

        // Assert
        expect(index.version).toBe("9.9.9");
        expect(existsSync(cacheDir)).toBe(false);
    });

    it("reads a cached index without fetching", async () => {
        // Arrange
        const cacheDir = temporaryDirectory();
        const first = fetchAnswering(200, JSON.stringify(fixtureIndex()));
        await loadIndex({ version: "9.9.9", fetch: first.fetch, cacheDir });
        const second = fetchAnswering(500, "");

        // Act
        const index = await loadIndex({ version: "9.9.9", fetch: second.fetch, cacheDir });

        // Assert
        expect(index.members.length).toBe(fixtureIndex().members.length);
        expect(second.calls).toEqual([]);
    });

    it("writes nothing when the cache is disabled", async () => {
        // Arrange
        const cacheDir = temporaryDirectory();
        const { fetch } = fetchAnswering(200, JSON.stringify(fixtureIndex()));

        // Act
        await loadIndex({ version: "9.9.9", fetch, cacheDir: null });

        // Assert
        expect(existsSync(join(cacheDir, "index-v9.9.9.json"))).toBe(false);
    });

    it("names an unpublished version", async () => {
        // Arrange
        const { fetch } = fetchAnswering(404, "");

        // Act & Assert
        await expect(loadIndex({ version: "0.0.1", fetch, cacheDir: null })).rejects.toBeInstanceOf(IndexNotPublishedError);
    });

    it("refuses an index that describes another version", async () => {
        // Arrange
        const { fetch } = fetchAnswering(200, JSON.stringify({ ...fixtureIndex(), version: "1.0.0" }));

        // Act & Assert
        await expect(loadIndex({ version: "9.9.9", fetch, cacheDir: null })).rejects.toThrow("not an API index for version 9.9.9");
    });

    it("replaces a cache file that is not an index", async () => {
        // Arrange
        const cacheDir = temporaryDirectory();
        const cacheFile = join(cacheDir, "index-v9.9.9.json");
        writeFileSync(cacheFile, "{not json");
        const { fetch, calls } = fetchAnswering(200, JSON.stringify(fixtureIndex()));

        // Act
        const index = await loadIndex({ version: "9.9.9", fetch, cacheDir });

        // Assert
        expect(index.version).toBe("9.9.9");
        expect(calls.length).toBe(1);
        expect((JSON.parse(readFileSync(cacheFile, "utf8")) as { version: string }).version).toBe("9.9.9");
    });
});
