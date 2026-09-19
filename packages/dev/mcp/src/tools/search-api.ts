import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import type { DocsContext } from "../context.js";
import { DESCRIPTIONS } from "../descriptions.js";
import { ok, failFor } from "../results.js";
import { renderLine } from "../render.js";

const ENGINES = ["babylonjs", "threejs", "playcanvas"] as const;
const MAX_LIMIT = 50;
const MAX_QUERY_LENGTH = 200;

const input = z.object({
    query: z.string().min(1).max(MAX_QUERY_LENGTH).describe("Keywords, a phrase, or a partial dotted path"),
    engine: z.enum(ENGINES).optional().describe("Only members published for this engine, plus the cloud operations, which run on CAD Cloud rather than in an engine; omit for every engine"),
    limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe("How many results, 10 by default"),
    version: z.string().optional().describe("The API version to search; omit for the version the server holds"),
});

export const searchApi: ToolDefinition<typeof input, DocsContext> = {
    name: "search_api",
    description: DESCRIPTIONS.search_api.description,
    annotations: { title: DESCRIPTIONS.search_api.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    input,
    where: "server",
    handler: async (args, context) => {
        let resolved;
        try {
            resolved = await context.resolve(args.version);
        } catch (error) {
            return failFor(error);
        }
        const query = args.query.replace(/^bitbybit\./, "");
        const hits = resolved.reader.search(query, { engine: args.engine, limit: args.limit });
        const results = hits.map((hit) => ({
            path: hit.member.path,
            kind: hit.member.kind,
            tier: hit.member.tier,
            summary: hit.member.summary,
            engines: hit.member.engines,
            onApi3d: hit.member.onApi3d,
        }));
        const text = hits.length === 0
            ? `No member of the Bitbybit API ${resolved.version} matches "${args.query}". Try other words, or list_namespace to browse.`
            : [`${hits.length} result(s) for "${args.query}" in Bitbybit API ${resolved.version}:`, ...hits.map((hit) => renderLine(hit.member))].join("\n");
        return ok(text, { version: resolved.version, query: args.query, results });
    },
};
