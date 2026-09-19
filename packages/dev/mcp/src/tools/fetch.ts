import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import type { DocsContext } from "../context.js";
import { DESCRIPTIONS } from "../descriptions.js";
import { ok, fail, failFor } from "../results.js";
import { renderMember } from "../render.js";

const MAX_ID_LENGTH = 256;

const input = z.object({
    id: z.string().min(1).max(MAX_ID_LENGTH).describe("A dotted API path returned by search"),
});

/** The fetch tool in the shape ChatGPT's connectors require: one document with id, title, text, url and metadata. */
export const fetchTool: ToolDefinition<typeof input, DocsContext> = {
    name: "fetch",
    description: DESCRIPTIONS.fetch.description,
    annotations: { title: DESCRIPTIONS.fetch.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    input,
    where: "server",
    handler: async (args, context) => {
        let resolved;
        try {
            resolved = await context.resolve();
        } catch (error) {
            return failFor(error);
        }
        const member = resolved.reader.get(args.id);
        if (!member) return fail(`No document has the id ${args.id}; ids are dotted API paths returned by search.`);
        const document = {
            id: member.path,
            title: member.path,
            text: renderMember(member, resolved.version, resolved.reader.examplesOf(member.path)),
            url: member.docUrl ?? context.guideUrl,
            metadata: { tier: member.tier, kind: member.kind, version: resolved.version, engines: member.engines.join(",") },
        };
        return ok(JSON.stringify(document), document);
    },
};
