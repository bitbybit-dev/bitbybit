import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import type { DocsContext } from "../context.js";
import type { IndexExample } from "../index-types.js";
import { DESCRIPTIONS } from "../descriptions.js";
import { ok, fail, failFor } from "../results.js";

const ENGINES = ["babylonjs", "threejs", "playcanvas"] as const;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;
const MAX_PATH_LENGTH = 256;
const MAX_TOPIC_LENGTH = 200;

const input = z
    .object({
        path: z.string().max(MAX_PATH_LENGTH).optional().describe("A member or namespace path, for example occt.shapes.solid.createBox or occt.fillets"),
        topic: z.string().max(MAX_TOPIC_LENGTH).optional().describe("Keywords to find examples by, when no path is known"),
        engine: z.enum(ENGINES).optional().describe("Prefer members published for this engine when searching by topic"),
        limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe("How many examples, 5 by default"),
        version: z.string().optional().describe("The API version; omit for the version the server holds"),
    })
    .refine((value) => value.path !== undefined || value.topic !== undefined, { message: "Give a path or a topic" });

export const getExamples: ToolDefinition<typeof input, DocsContext> = {
    name: "get_examples",
    description: DESCRIPTIONS.get_examples.description,
    annotations: { title: DESCRIPTIONS.get_examples.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    input,
    where: "server",
    handler: async (args, context) => {
        let resolved;
        try {
            resolved = await context.resolve(args.version);
        } catch (error) {
            return failFor(error);
        }
        const limit = args.limit ?? DEFAULT_LIMIT;
        const { reader } = resolved;
        let examples: IndexExample[] = [];
        if (args.path !== undefined) {
            const path = args.path.replace(/^bitbybit\./, "");
            if (!reader.get(path) && reader.children(path).length === 0) return fail(`${path} is not a member of the Bitbybit API ${resolved.version}; call describe to see the nearest paths.`);
            examples = reader.examplesOf(path);
            if (examples.length < limit) examples = [...examples, ...reader.examplesUnder(path, limit - examples.length)];
        } else if (args.topic !== undefined) {
            for (const hit of reader.search(args.topic, { engine: args.engine, limit: MAX_LIMIT })) {
                for (const example of reader.examplesOf(hit.member.path)) {
                    if (examples.length >= limit) break;
                    examples.push(example);
                }
            }
        }
        examples = examples.slice(0, limit);
        const rows = examples.map((example) => ({ path: example.path, code: example.code, url: reader.get(example.path)?.docUrl ?? null }));
        if (rows.length === 0) return ok(`No example matches in the Bitbybit API ${resolved.version}. Try describe on a path: its parameters and defaults are enough to write a call.`, { version: resolved.version, examples: [] });
        const text = rows.map((row) => `// ${row.path}${row.url ? ` (${row.url})` : ""}\n${row.code}`).join("\n\n");
        return ok(text, { version: resolved.version, examples: rows });
    },
};
