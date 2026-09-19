/** One section of the integration guide, as `get_guide` serves it. */
export interface GuideSection {
    id: string;
    title: string;
    level: 2 | 3;
    body: string;
}

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;
const HEADING = /^(##|###) (.+)$/;

/** A heading as a stable id: lower case, words joined by dashes, nothing else. */
export function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Splits a guide page into its `##` and `###` sections. A `##` section's body runs to the next
 * `##` and so contains its subsections; a `###` section's body is its own text. Everything before
 * the first heading, and the page's frontmatter, is left out.
 */
export function splitGuides(markdown: string): GuideSection[] {
    const lines = markdown.replace(FRONTMATTER, "").split("\n");
    const sections: GuideSection[] = [];
    const open: { section: GuideSection; lines: string[] }[] = [];
    const close = (minLevel: number): void => {
        while (open.length > 0) {
            const last = open[open.length - 1];
            if (!last || last.section.level < minLevel) break;
            last.section.body = last.lines.join("\n").trim();
            open.pop();
        }
    };
    for (const line of lines) {
        const heading = HEADING.exec(line);
        if (heading) {
            const level = heading[1] === "##" ? 2 : 3;
            const title = (heading[2] ?? "").trim();
            close(level);
            for (const entry of open) entry.lines.push(line);
            const section: GuideSection = { id: slugify(title), title, level, body: "" };
            sections.push(section);
            open.push({ section, lines: [] });
            continue;
        }
        for (const entry of open) entry.lines.push(line);
    }
    close(2);
    return sections;
}
