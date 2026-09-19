import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import type { DocsContext } from "../context.js";
import { DESCRIPTIONS } from "../descriptions.js";
import { ok, failFor } from "../results.js";
import { renderLine } from "../render.js";

const MAX_PATH_LENGTH = 256;

const input = z.object({
    path: z.string().max(MAX_PATH_LENGTH).optional().describe("A namespace path such as occt or occt.shapes; omit for the top level"),
    version: z.string().optional().describe("The API version to list; omit for the version the server holds"),
});

export const listNamespace: ToolDefinition<typeof input, DocsContext> = {
    name: "list_namespace",
    description: DESCRIPTIONS.list_namespace.description,
    annotations: { title: DESCRIPTIONS.list_namespace.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    input,
    where: "server",
    handler: async (args, context) => {
        let resolved;
        try {
            resolved = await context.resolve(args.version);
        } catch (error) {
            return failFor(error);
        }
        const path = args.path?.replace(/^bitbybit\./, "");
        const parent = path ? resolved.reader.get(path) : undefined;
        if (path && !parent && resolved.reader.children(path).length === 0) {
            const nearest = resolved.reader.nearest(path);
            return ok(
                [`${path} is not a namespace of the Bitbybit API ${resolved.version}.`, ...nearest.map(renderLine)].join("\n"),
                { version: resolved.version, notFound: path, nearest: nearest.map((candidate) => candidate.path) },
            );
        }
        if (path && parent && parent.kind !== "namespace") {
            const siblings = path.split(".").slice(0, -1).join(".");
            return ok(
                `${path} is a ${parent.kind} of the Bitbybit API ${resolved.version}, not a namespace; describe it with describe, or list ${siblings} for its siblings.`,
                { version: resolved.version, notNamespace: path, kind: parent.kind },
            );
        }
        const children = resolved.reader.children(path);
        const members = children.map((member) => ({ path: member.path, kind: member.kind, tier: member.tier, summary: member.summary, engines: member.engines }));
        const heading = path ? `${path}${parent?.summary ? `: ${parent.summary}` : ""}` : `Top-level namespaces of the Bitbybit API ${resolved.version}`;
        const text = [heading, ...children.map(renderLine)].join("\n");
        return ok(text, { version: resolved.version, path: path ?? null, members });
    },
};
