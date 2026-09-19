import { describe, expect, it } from "vitest";
import { createDocsRegistry } from "./index.js";
import { TOOL_CEILING, toHttp } from "../registry.js";
import type { HttpTool, ToolResult } from "../registry.js";
import { DESCRIPTIONS, TOOL_NAMES } from "../descriptions.js";
import { FIXTURE_VERSION, GUIDE_URL, fixtureContext } from "../__fixtures__/load.js";

function tool(name: string): HttpTool {
    const found = toHttp(createDocsRegistry(), fixtureContext()).find((candidate) => candidate.name === name);
    if (!found) throw new Error(`no tool ${name}`);
    return found;
}

const call = (name: string, args: unknown): Promise<ToolResult> => tool(name).call(args);
const structured = (result: ToolResult): Record<string, unknown> => result.structured ?? {};
const paths = (rows: unknown): string[] => (rows as { path: string }[]).map((row) => row.path);

describe("the docs registry", () => {
    it("exposes the seven tools within the ceiling, every one read-only, each described once", () => {
        // Act
        const definitions = createDocsRegistry().list();

        // Assert
        expect(definitions.map((definition) => definition.name)).toEqual([...TOOL_NAMES]);
        expect(definitions.length).toBeLessThanOrEqual(TOOL_CEILING);
        expect(definitions.every((definition) => definition.annotations.readOnlyHint && !definition.annotations.destructiveHint)).toBe(true);
        expect(Object.keys(DESCRIPTIONS).sort()).toEqual([...TOOL_NAMES].sort());
        expect(definitions.every((definition) => definition.description === DESCRIPTIONS[definition.name as keyof typeof DESCRIPTIONS].description)).toBe(true);
    });
});

describe("search_api", () => {
    it("ranks the member whose name and summary match first", async () => {
        // Act
        const result = await call("search_api", { query: "box solid" });

        // Assert
        expect(paths(structured(result)["results"])[0]).toBe("occt.shapes.solid.createBox");
        expect(structured(result)["version"]).toBe(FIXTURE_VERSION);
        expect(result.text).toContain("occt.shapes.solid.createBox");
    });

    it("keeps only members published for the requested engine", async () => {
        // Act
        const forThree = await call("search_api", { query: "create box", engine: "threejs" });
        const forBabylon = await call("search_api", { query: "create box", engine: "babylonjs" });

        // Assert
        expect(paths(structured(forThree)["results"])).not.toContain("babylon.meshBuilder.createBox");
        expect(paths(structured(forBabylon)["results"])).toContain("babylon.meshBuilder.createBox");
    });

    it("reports the tier of every result", async () => {
        // Act
        const result = await call("search_api", { query: "text 3d", limit: 5 });

        // Assert
        const rows = structured(result)["results"] as { path: string; tier: string }[];
        expect(rows.find((row) => row.path === "advanced.text3d.create")?.tier).toBe("platform-pro");
    });

    it("ranks the exact path first whether or not the query carries the bitbybit prefix", async () => {
        // Act
        const plain = await call("search_api", { query: "occt.shapes.solid.createBox" });
        const prefixed = await call("search_api", { query: "bitbybit.occt.shapes.solid.createBox" });

        // Assert
        expect(paths(structured(plain)["results"])[0]).toBe("occt.shapes.solid.createBox");
        expect(paths(structured(prefixed)["results"])[0]).toBe("occt.shapes.solid.createBox");
    });

    it("refuses a query longer than a sentence, before any scoring", async () => {
        // Arrange
        const overlong = "box ".repeat(100);

        // Act
        const result = await call("search_api", { query: overlong });

        // Assert
        expect(result.isError).toBe(true);
        expect(result.text).toContain("Invalid arguments for search_api");
    });

    it("says so when nothing matches", async () => {
        // Act
        const result = await call("search_api", { query: "zzzz" });

        // Assert
        expect(structured(result)["results"]).toEqual([]);
        expect(result.text).toContain("No member");
    });
});

describe("describe", () => {
    it("returns the full record, the version and the examples of a known path", async () => {
        // Act
        const result = await call("describe", { path: "occt.shapes.solid.createBox" });

        // Assert
        const member = structured(result)["member"] as { path: string; signature: string };
        expect(member.path).toBe("occt.shapes.solid.createBox");
        expect(structured(result)["version"]).toBe(FIXTURE_VERSION);
        expect(result.text).toContain(member.signature);
        expect(result.text).toContain("version: 9.9.9");
        expect(result.text).toContain("## Examples");
    });

    it("accepts the bitbybit. prefix", async () => {
        // Act
        const result = await call("describe", { path: "bitbybit.occt.shapes.solid.createBox" });

        // Assert
        expect((structured(result)["member"] as { path: string }).path).toBe("occt.shapes.solid.createBox");
    });

    it("reports an unknown path with the nearest existing ones instead of guessing", async () => {
        // Act
        const result = await call("describe", { path: "occt.shapes.solid.createbox" });

        // Assert
        expect(structured(result)["notFound"]).toBe("occt.shapes.solid.createbox");
        expect((structured(result)["nearest"] as string[])[0]).toBe("occt.shapes.solid.createBox");
        expect(result.isError).toBeUndefined();
    });

    it("offers the sibling a misspelling meant before anything that merely shares a word", async () => {
        // Act
        const result = await call("describe", { path: "occt.shapes.solid.createboxx" });

        // Assert
        expect((structured(result)["nearest"] as string[])[0]).toBe("occt.shapes.solid.createBox");
    });

    it("offers the path with a misspelt middle segment before a same-named member elsewhere", async () => {
        // Act
        const result = await call("describe", { path: "occt.shape.solid.createBox" });

        // Assert
        expect((structured(result)["nearest"] as string[])[0]).toBe("occt.shapes.solid.createBox");
    });

    it("refuses a path longer than a dotted API path can be, before any lookup", async () => {
        // Arrange
        const overlong = "a".repeat(300);

        // Act
        const result = await call("describe", { path: overlong });

        // Assert
        expect(result.isError).toBe(true);
        expect(result.text).toContain("Invalid arguments for describe");
    });

    it("shows a deprecation", async () => {
        // Act
        const result = await call("describe", { path: "verb" });

        // Assert
        expect(result.text).toContain("deprecated:");
    });

    it("shows a bare deprecation without a reason", async () => {
        // Act
        const result = await call("describe", { path: "verb.curve" });

        // Assert
        expect(result.text).toContain("- deprecated\n");
    });

    it("documents the CAD Cloud inputs beside the browser signature when they differ", async () => {
        // Act
        const result = await call("describe", { path: "occt.shapes.solid.createBoxFromCorner" });

        // Assert
        expect(result.text).toContain("## Parameters on CAD Cloud");
        expect(result.text).toContain("On CAD Cloud the corner is given as three numbers.");
        expect(result.text).toContain("- corner: number[]; default [0,0,0] - The corner as [x, y, z]");
        expect((await call("describe", { path: "occt.shapes.solid.createBox" })).text).not.toContain("Parameters on CAD Cloud");
    });

    it("refuses another version than the one it holds, naming both", async () => {
        // Act
        const result = await call("describe", { path: "occt", version: "1.0.0" });

        // Assert
        expect(result.isError).toBe(true);
        expect(structured(result)).toEqual({ code: "VERSION_NOT_LOADED", requested: "1.0.0", loaded: FIXTURE_VERSION });
    });
});

describe("list_namespace", () => {
    it("lists the roots without a path", async () => {
        // Act
        const result = await call("list_namespace", {});

        // Assert
        const listed = paths(structured(result)["members"]);
        expect(listed).toContain("occt");
        expect(listed).toContain("math");
        expect(listed).toContain("occtPro");
        expect(listed).not.toContain("cloud.unfold.solidToFlat");
    });

    it("lists a namespace the index carries only through its members", async () => {
        // Act
        const result = await call("list_namespace", { path: "cloud.unfold" });

        // Assert
        expect(paths(structured(result)["members"])).toEqual(["cloud.unfold.solidToFlat"]);
        expect(structured(result)["notFound"]).toBeUndefined();
        expect(paths(structured(await call("list_namespace", { path: "occtPro" }))["members"])).toEqual(["occtPro.sheetMetal"]);
    });

    it("lists the children of a namespace", async () => {
        // Act
        const result = await call("list_namespace", { path: "occt.shapes" });

        // Assert
        expect(paths(structured(result)["members"])).toEqual(["occt.shapes.solid"]);
        expect(result.text).toContain("occt.shapes");
    });

    it("says when the path is a member rather than a namespace", async () => {
        // Act
        const result = await call("list_namespace", { path: "occt.shapes.solid.createBox" });

        // Assert
        expect(structured(result)["notNamespace"]).toBe("occt.shapes.solid.createBox");
        expect(structured(result)["kind"]).toBe("method");
        expect(result.text).toContain("not a namespace");
    });

    it("reports an unknown namespace with the nearest paths", async () => {
        // Act
        const result = await call("list_namespace", { path: "occt.shape" });

        // Assert
        expect(structured(result)["notFound"]).toBe("occt.shape");
        expect(structured(result)["nearest"]).toContain("occt.shapes");
    });
});

describe("get_examples", () => {
    it("returns a member's examples with its reference url", async () => {
        // Act
        const result = await call("get_examples", { path: "occt.shapes.solid.createBox" });

        // Assert
        const rows = structured(result)["examples"] as { path: string; url: string; code: string }[];
        expect(rows[0]?.path).toBe("occt.shapes.solid.createBox");
        expect(rows[0]?.url).toContain("docs.bitbybit.dev");
        expect(result.text).toContain(rows[0]?.code ?? "missing");
    });

    it("collects examples under a namespace", async () => {
        // Act
        const result = await call("get_examples", { path: "occt.shapes.solid", limit: 3 });

        // Assert
        const rows = structured(result)["examples"] as { path: string }[];
        expect(rows.length).toBeGreaterThan(0);
        expect(rows.every((row) => row.path.startsWith("occt.shapes.solid."))).toBe(true);
    });

    it("collects examples under a namespace the index carries only through its members", async () => {
        // Act
        const result = await call("get_examples", { path: "cloud.unfold" });

        // Assert
        expect(result.isError).toBeUndefined();
    });

    it("finds examples by topic", async () => {
        // Act
        const result = await call("get_examples", { topic: "box" });

        // Assert
        expect((structured(result)["examples"] as unknown[]).length).toBeGreaterThan(0);
    });

    it("needs a path or a topic", async () => {
        // Act
        const result = await call("get_examples", {});

        // Assert
        expect(result.isError).toBe(true);
    });

    it("reports an unknown path as an error", async () => {
        // Act
        const result = await call("get_examples", { path: "occt.nothing" });

        // Assert
        expect(result.isError).toBe(true);
    });
});

describe("get_guide", () => {
    it("lists the sections without a topic", async () => {
        // Act
        const result = await call("get_guide", {});

        // Assert
        expect((structured(result)["sections"] as { id: string }[]).map((section) => section.id)).toContain("browser-apps");
        expect(structured(result)["url"]).toBe(GUIDE_URL);
    });

    it("resolves a short name to its section and links the anchor", async () => {
        // Act
        const result = await call("get_guide", { topic: "deploy" });

        // Assert
        expect(structured(result)["id"]).toBe("how-an-agent-should-integrate-bitbybit");
        expect(structured(result)["url"]).toBe(`${GUIDE_URL}#how-an-agent-should-integrate-bitbybit`);
        expect(result.text).toContain("The packages are the whole answer.");
    });

    it("matches a title by its words", async () => {
        // Act
        const result = await call("get_guide", { topic: "browser" });

        // Assert
        expect(structured(result)["id"]).toBe("browser-apps");
    });

    it("names the sections when nothing matches", async () => {
        // Act
        const result = await call("get_guide", { topic: "kitchen" });

        // Assert
        expect(structured(result)["notFound"]).toBe("kitchen");
        expect(result.text).toContain("get-started");
    });
});

describe("search and fetch, the connector shape", () => {
    it("search returns results of id, title and url", async () => {
        // Act
        const result = await call("search", { query: "box" });

        // Assert
        const rows = structured(result)["results"] as { id: string; title: string; url: string }[];
        expect(rows[0]).toMatchObject({ id: "occt.shapes.solid.createBox" });
        expect(rows[0]?.title).toContain("occt.shapes.solid.createBox");
        expect(rows[0]?.url).toContain("docs.bitbybit.dev");
        expect(JSON.parse(result.text)).toEqual({ results: rows });
    });

    it("fetch returns one document by id with text, url and metadata", async () => {
        // Act
        const result = await call("fetch", { id: "occt.shapes.solid.createBox" });

        // Assert
        expect(structured(result)).toMatchObject({ id: "occt.shapes.solid.createBox", title: "occt.shapes.solid.createBox", metadata: { tier: "oss", version: FIXTURE_VERSION } });
        expect(structured(result)["text"]).toContain("# occt.shapes.solid.createBox");
        expect(JSON.parse(result.text)).toEqual(structured(result));
    });

    it("fetch accepts the bitbybit. prefix like every other tool", async () => {
        // Act
        const result = await call("fetch", { id: "bitbybit.occt.shapes.solid.createBox" });

        // Assert
        expect(result.isError).toBeUndefined();
        expect(structured(result)["id"]).toBe("occt.shapes.solid.createBox");
    });

    it("fetch reports an unknown id as an error", async () => {
        // Act
        const result = await call("fetch", { id: "nope" });

        // Assert
        expect(result.isError).toBe(true);
    });
});
