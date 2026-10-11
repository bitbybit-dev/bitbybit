import React from "react";
import showcases from "@site/src/data/designer-showcases.json";

const links = showcases as Record<string, string | null>;
const DESIGNER_EDITOR = "editor=designer";

/**
 * The button that opens a Designer showcase's public project on bitbybit.dev, where it arrives with its geometry
 * kept and opens at once: to change, for Gold members, and to view, for everyone else. The link of each showcase lives in src/data/designer-showcases.json and
 * is filled in when the project is published; until then the button is left out. A showcase the file does not
 * name fails the build.
 *
 * Usage in MDX files: <OpenInDesigner showcase="robot-arm" />
 */
export default function OpenInDesigner({ showcase }: { showcase: string }): React.JSX.Element | null {
    if (!(showcase in links)) {
        throw new Error(`src/data/designer-showcases.json has no showcase "${showcase}"`);
    }
    const link = links[showcase];
    if (link === null || link === undefined || link === "") {
        return null;
    }
    const url = new URL(link);
    if (url.hostname !== "bitbybit.dev" || !url.pathname.startsWith("/app/") || !url.search.includes(DESIGNER_EDITOR)) {
        throw new Error(`the link of the showcase "${showcase}" must open a bitbybit.dev project in the Designer (/app/...?${DESIGNER_EDITOR}), not ${link}`);
    }
    return (
        <a className="button button--primary button--md margin-right--sm margin-bottom--sm" href={link}>
            Open in the Designer
        </a>
    );
}
