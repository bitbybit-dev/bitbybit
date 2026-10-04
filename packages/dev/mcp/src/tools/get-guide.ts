import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import type { DocsContext } from "../context.js";
import type { GuideSection } from "../guides-split.js";
import { DESCRIPTIONS } from "../descriptions.js";
import { ok } from "../results.js";
import { tokenize } from "../index-reader.js";

export const GUIDE_ALIASES: Readonly<Record<string, string>> = {
    integrate: "how-an-agent-should-integrate-bitbybit",
    deploy: "how-an-agent-should-integrate-bitbybit",
    deployment: "how-an-agent-should-integrate-bitbybit",
    "server-side": "node-servers-with-headroom",
    server: "node-servers-with-headroom",
    backend: "lightweight-backends",
    serverless: "lightweight-backends",
    edge: "lightweight-backends",
    browser: "browser-apps",
    "large-models": "node-servers-with-headroom",
    editors: "inside-the-bitbybit-editors",
    pro: "pro-algorithms",
    cloud: "pro-algorithms",
    start: "get-started",
    "getting-started": "get-started",
    layers: "three-layers-you-can-use",
    trust: "trust",
    companies: "for-companies",
    design: "what-a-design-document-is",
    "design-document": "what-a-design-document-is",
    "design-documents": "what-a-design-document-is",
    documents: "what-a-design-document-is",
    "build-loop": "the-loop-an-agent-should-follow",
    validate: "the-loop-an-agent-should-follow",
    references: "references-naming-faces-and-edges",
    sketch: "sketches",
    assembly: "assemblies",
    mistakes: "mistakes-to-avoid",
};

const MAX_TOPIC_LENGTH = 128;

const input = z.object({
    topic: z.string().max(MAX_TOPIC_LENGTH).optional().describe("A section id or a short name such as integrate, browser, backend, server-side, pro, start, design, references, assembly; omit to list the sections"),
});

function findSection(guides: readonly GuideSection[], topic: string): GuideSection | undefined {
    const wanted = topic.trim().toLowerCase();
    const alias = Object.hasOwn(GUIDE_ALIASES, wanted) ? GUIDE_ALIASES[wanted] : undefined;
    const byId = guides.find((section) => section.id === (alias ?? wanted));
    if (byId) return byId;
    const words = new Set(tokenize(wanted));
    let best: { section: GuideSection; overlap: number } | undefined;
    for (const section of guides) {
        const overlap = tokenize(section.title).filter((word) => words.has(word)).length;
        if (overlap > 0 && (!best || overlap > best.overlap)) best = { section, overlap };
    }
    return best?.section;
}

export const getGuide: ToolDefinition<typeof input, DocsContext> = {
    name: "get_guide",
    description: DESCRIPTIONS.get_guide.description,
    annotations: { title: DESCRIPTIONS.get_guide.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    input,
    where: "server",
    handler: (args, context) => {
        const pageOf = (section: GuideSection): string => section.page ?? context.guideUrl;
        const sections = context.guides.map((section) => ({ id: section.id, title: section.title, level: section.level, page: pageOf(section) }));
        if (args.topic === undefined) {
            const pages = [...new Set(context.guides.map(pageOf))];
            const text = pages.flatMap((page) => [`Sections of ${page}:`, ...context.guides.filter((section) => pageOf(section) === page).map((section) => `- ${section.id}: ${section.title}`)]).join("\n");
            return ok(text, { url: context.guideUrl, pages, sections });
        }
        const section = findSection(context.guides, args.topic);
        if (!section) {
            return ok(`No guide section matches "${args.topic}". Sections: ${context.guides.map((candidate) => candidate.id).join(", ")}.`, { url: context.guideUrl, notFound: args.topic, sections });
        }
        const url = `${pageOf(section)}#${section.id}`;
        return ok(`${"#".repeat(section.level)} ${section.title}\n\n${section.body}\n\nSource: ${url}`, { url, id: section.id, title: section.title, body: section.body });
    },
};
