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
    "design-mistakes": "mistakes-to-avoid",
    geometry: "geometry-in-bitbybit",
    cad: "geometry-in-bitbybit",
    occt: "how-the-bitbybit-occt-kernel-thinks",
    kernels: "which-kernel-to-use",
    manifold: "manifold-and-jscad",
    jscad: "manifold-and-jscad",
    "part-order": "the-order-to-build-a-part-in",
    part: "a-part-to-start-from",
    edges: "choosing-edges-and-faces",
    fillets: "choosing-edges-and-faces",
    check: "checking-a-shape",
    export: "drawing-and-exporting-a-part",
    step: "drawing-and-exporting-a-part",
    mistakes: "mistakes-to-avoid-in-geometry-code",
    "geometry-mistakes": "mistakes-to-avoid-in-geometry-code",
    ifc: "ifc-models-in-bitbybit",
    bim: "ifc-models-in-bitbybit",
    building: "ifc-models-in-bitbybit",
    buildings: "ifc-models-in-bitbybit",
    "ifc-node": "two-ways-to-call-the-ifc-api",
    "ifc-worker": "two-ways-to-call-the-ifc-api",
    "ifc-order": "the-order-to-write-a-building-in",
    "ifc-house": "a-house-to-start-from",
    "ifc-example": "a-house-to-start-from",
    "ifc-check": "checking-an-ifc-model",
    "ifc-validate": "checking-an-ifc-model",
    "ifc-read": "reading-and-changing-ifc-files",
    "ifc-edit": "reading-and-changing-ifc-files",
    "ifc-draw": "drawing-an-ifc-model-and-exporting-step",
    "ifc-step": "drawing-an-ifc-model-and-exporting-step",
    "ifc-mistakes": "mistakes-to-avoid-in-ifc-models",
};

const MAX_TOPIC_LENGTH = 128;

const input = z.object({
    topic: z.string().max(MAX_TOPIC_LENGTH).optional().describe("A section id or a short name such as integrate, browser, backend, server-side, pro, start, geometry, part-order, geometry-mistakes, design, references, assembly, ifc, ifc-order, ifc-mistakes; omit to list the sections"),
});

function findSection(guides: readonly GuideSection[], topic: string): GuideSection | undefined {
    const wanted = topic.trim().toLowerCase();
    const alias = Object.hasOwn(GUIDE_ALIASES, wanted) ? GUIDE_ALIASES[wanted] : undefined;
    const byId = guides.find((section) => section.id === (alias ?? wanted));
    if (byId) {
        return byId;
    }
    const words = new Set(tokenize(wanted));
    let best: { section: GuideSection; overlap: number } | undefined;
    for (const section of guides) {
        const overlap = tokenize(section.title).filter((word) => words.has(word)).length;
        if (overlap > 0 && (!best || overlap > best.overlap)) {
            best = { section, overlap };
        }
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
