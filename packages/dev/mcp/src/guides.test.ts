import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { slugify, splitGuides } from "./guides-split.js";
import { GUIDES, GUIDE_PAGE_URL } from "./guides.generated.js";
import { GUIDE_ALIASES } from "./tools/get-guide.js";

const page = (): string => readFileSync(new URL("../../../../docs/learn/using-ai-with-bitbybit/agentic-cad.md", import.meta.url), "utf8");

describe("splitGuides", () => {
    it("drops the frontmatter and the text before the first heading", () => {
        // Arrange
        const markdown = "---\ntitle: x\n---\n\n# Page\n\nIntro.\n\n## First\n\nBody.\n";

        // Act
        const sections = splitGuides(markdown);

        // Assert
        expect(sections).toEqual([{ id: "first", title: "First", level: 2, body: "Body." }]);
    });

    it("keeps subsections inside their section and also on their own", () => {
        // Arrange
        const markdown = "## Outer\n\nLead.\n\n### Inner\n\nDetail.\n\n## Next\n\nOther.\n";

        // Act
        const sections = splitGuides(markdown);

        // Assert
        expect(sections.map((section) => section.id)).toEqual(["outer", "inner", "next"]);
        expect(sections[0]?.body).toBe("Lead.\n\n### Inner\n\nDetail.");
        expect(sections[1]).toEqual({ id: "inner", title: "Inner", level: 3, body: "Detail." });
    });

    it("slugifies a heading to a stable id", () => {
        // Assert
        expect(slugify("Agentic CAD: how Bitbybit fits AI-driven 3D development")).toBe("agentic-cad-how-bitbybit-fits-ai-driven-3d-development");
    });
});

describe("the generated guides", () => {
    it("equal the sections of the published page", () => {
        // Act
        const fromPage = splitGuides(page());

        // Assert
        expect(GUIDES).toEqual(fromPage);
        expect(GUIDE_PAGE_URL).toBe("https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/agentic-cad");
    });

    it("cover every alias the guide tool offers", () => {
        // Arrange
        const ids = new Set(GUIDES.map((section) => section.id));

        // Assert
        for (const target of Object.values(GUIDE_ALIASES)) expect(ids.has(target), target).toBe(true);
    });
});
