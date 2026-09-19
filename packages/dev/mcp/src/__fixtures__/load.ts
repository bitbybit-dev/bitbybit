import { readFileSync } from "node:fs";
import type { ApiIndex } from "../index-types.js";
import type { GuideSection } from "../guides-split.js";
import { contextForIndex } from "../context.js";
import type { DocsContext } from "../context.js";

export const FIXTURE_VERSION = "9.9.9";
export const GUIDE_URL = "https://example.test/guide";

export function fixtureIndex(): ApiIndex {
    return JSON.parse(readFileSync(new URL("./index.sample.json", import.meta.url), "utf8")) as ApiIndex;
}

export const FIXTURE_GUIDES: readonly GuideSection[] = [
    { id: "what-we-believe", title: "What we believe", level: 2, body: "Agents write the code." },
    {
        id: "how-an-agent-should-integrate-bitbybit",
        title: "How an agent should integrate Bitbybit",
        level: 2,
        body: "### The honest default\n\nThe packages are the whole answer.\n\n### Browser apps\n\nThe kernels run in the tab.",
    },
    { id: "the-honest-default", title: "The honest default", level: 3, body: "The packages are the whole answer." },
    { id: "browser-apps", title: "Browser apps", level: 3, body: "The kernels run in the tab." },
    { id: "get-started", title: "Get started", level: 2, body: "Scaffold a project." },
];

export function fixtureContext(): DocsContext {
    return contextForIndex(fixtureIndex(), FIXTURE_GUIDES, GUIDE_URL);
}
