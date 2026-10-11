import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import type { DocsContext } from "../context.js";
import { DESCRIPTIONS } from "../descriptions.js";
import { ok, failFor } from "../results.js";
import { renderLine, renderMember, renderType } from "../render.js";

const MAX_PATH_LENGTH = 256;

const input = z.object({
    path: z.string().min(1).max(MAX_PATH_LENGTH).describe("The dotted path of the member, for example occt.shapes.solid.createBox, or the name of a type a member returns or takes, for example Inputs.IFC.SpaceInfoDto"),
    version: z.string().optional().describe("The API version to describe; omit for the version the server holds"),
});

export const describe: ToolDefinition<typeof input, DocsContext> = {
    name: "describe",
    description: DESCRIPTIONS.describe.description,
    annotations: { title: DESCRIPTIONS.describe.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    input,
    where: "server",
    handler: async (args, context) => {
        let resolved;
        try {
            resolved = await context.resolve(args.version);
        } catch (error) {
            return failFor(error);
        }
        const path = args.path.replace(/^bitbybit\./, "");
        const member = resolved.reader.get(path);
        const named = member ? undefined : resolved.reader.type(path);
        if (named) {
            return ok(renderType(named, resolved.version, resolved.reader.typesUsedByType(named)), { version: resolved.version, type: { key: named.key, ...named.type } });
        }
        const sharing = member ? [] : resolved.reader.typeKeysNamed(path);
        if (sharing.length > 1) {
            const text = [`${path} names ${sharing.length} types in the Bitbybit API ${resolved.version}; describe one by its full name:`, ...sharing.map((key) => `- ${key}`)].join("\n");
            return ok(text, { version: resolved.version, notFound: path, types: sharing });
        }
        if (!member) {
            const nearest = resolved.reader.nearest(path);
            const text = [
                `${path} is not a member of the Bitbybit API ${resolved.version}.`,
                nearest.length > 0 ? "Nearest existing paths:" : "No similar path exists; try search_api with other words.",
                ...nearest.map(renderLine),
            ].join("\n");
            return ok(text, { version: resolved.version, notFound: path, nearest: nearest.map((candidate) => candidate.path) });
        }
        const examples = resolved.reader.examplesOf(path);
        const types = resolved.reader.typesUsedBy(member);
        return ok(renderMember(member, resolved.version, examples, types), { version: resolved.version, member, examples, types: types.map((used) => used.key) });
    },
};
