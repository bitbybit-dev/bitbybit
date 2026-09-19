import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import type { DocsContext } from "../context.js";
import { DESCRIPTIONS } from "../descriptions.js";
import { ok, failFor } from "../results.js";

const RESULT_LIMIT = 10;
const MAX_QUERY_LENGTH = 200;

const input = z.object({
    query: z.string().min(1).max(MAX_QUERY_LENGTH).describe("Search terms"),
});

export const search: ToolDefinition<typeof input, DocsContext> = {
    name: "search",
    description: DESCRIPTIONS.search.description,
    annotations: { title: DESCRIPTIONS.search.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    input,
    where: "server",
    handler: async (args, context) => {
        let resolved;
        try {
            resolved = await context.resolve();
        } catch (error) {
            return failFor(error);
        }
        const results = resolved.reader.search(args.query, { limit: RESULT_LIMIT }).map((hit) => ({
            id: hit.member.path,
            title: `${hit.member.path}${hit.member.summary ? ` - ${hit.member.summary}` : ""}`,
            url: hit.member.docUrl ?? `${context.guideUrl}`,
        }));
        return ok(JSON.stringify({ results }), { results });
    },
};
