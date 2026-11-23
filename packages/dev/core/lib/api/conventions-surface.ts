import type { ConventionChange } from "@bitbybit-dev/base";

const ROOT = "bitbybit.";
const WORD = "[A-Za-z0-9_$]";

/**
 * What each conventions level changes, in words, and the operations it changes it in. Every
 * operation whose results depend on the level is in exactly one change of each level that changes
 * it, so the words can be shown for any of them: to a person deciding whether to move content to a
 * newer level, or beside the operation's own documentation.
 */
export const CONVENTION_CHANGES: readonly ConventionChange[] = [
    {
        level: 1,
        entries: [
            "occt.io.", "occt.svg.", "occt.assembly.query.getDocumentAnnotations", "jscad.downloadSolidSTL", "jscad.downloadSolidsSTL", "jscad.downloadGeometryDxf", "jscad.downloadGeometry3MF",
            "babylon.io.exportMeshToStl", "babylon.io.exportMeshesToStl", "babylon.io.loadAssetIntoScene", "babylon.io.loadAssetIntoSceneNoReturn",
            "babylon.io.loadAssetIntoSceneFromRootUrl", "babylon.io.loadAssetIntoSceneFromRootUrlNoReturn",
        ],
        change: "Files you import and export: a file holds what the screen shows, the right way round and the right way up.",
    },
    {
        level: 1,
        entries: ["occt.shapes.wire.createHelixWire", "occt.shapes.wire.createHelixWireByTurns", "occt.shapes.wire.createTaperedHelixWire", "occt.shapes.wire.createFlatSpiralWire", "occt.parts."],
        change: "Helices, threads and helical gears: clockwise and right-hand look the way they are named.",
    },
    {
        level: 1,
        entries: ["occt.recipes.", "occt.design.", "manifold.recipes.", "ifc.", "recipes.surfaceMeshes"],
        change: "IFC models, recipes and design documents: built the way their data describes them, no longer mirrored.",
    },
    {
        level: 1,
        entries: [
            "occt.shapes.wire.textWires", "occt.shapes.wire.textWiresWithData", "occt.shapes.wire.hexagonsInGrid", "occt.shapes.face.hexagonsInGrid",
            "occt.operations.hiddenLines", "occt.operations.hiddenLinesByKind", "text.vectorText", "text.vectorChar", "point.hexGrid", "point.hexGridScaledToFit",
        ],
        change: "Text, grids and view drawings laid on the ground: the same in a left-handed scene, Babylon.js's default, and no longer mirrored in a right-handed one.",
    },
    {
        level: 1,
        entries: ["occt.shapeToMesh", "occt.shapesToMeshes", "occt.shapeFacesToPolygonPoints", "occt.docToMesh", "occt.docToMeshes"],
        change: "Meshes made for a tool with Z up: turned, not mirrored, in a right-handed engine.",
    },
    {
        level: 1,
        entries: ["babylon.meshBuilder.createCapsule", "babylon.meshBuilder.createGround"],
        change: "Capsules and grounds: front side and back side show the side they name.",
    },
    {
        level: 1,
        entries: ["babylon.scene.clearAllDrawn", "babylon.scene.useRightHandedSystem"],
        change: "Right-handed scenes: switching the scene changes only the scene. Files, text and hands keep the coordinate system they were set up with unless the code also sets it with bitbybit.setSettings, and clearing returns the scene to that system.",
    },
];

/**
 * The operations whose results depend on the conventions level content runs by: every one that
 * reads or writes a file or a drawing, lays text or a grid on the ground, names a hand, places a
 * recipe, or meshes for a tool with another up axis. An entry is a dotted path as a script writes
 * it after `bitbybit.`, and one that ends in a dot stands for everything under it. They are the
 * entries of `CONVENTION_CHANGES`, each once.
 *
 * Content that uses none of them runs the same at every level, so it can be moved to the newest
 * one as it is; content that uses one is best moved by its author.
 */
export const CONVENTIONS_SURFACE: readonly string[] = [...new Set(CONVENTION_CHANGES.flatMap((change) => change.entries))];

function covers(entry: string, path: string): boolean {
    return entry.endsWith(".") ? path.startsWith(entry) : path === entry;
}

function lastNameOf(entry: string): string {
    const names = entry.split(".").filter((name) => name !== "");
    return names[names.length - 1] ?? "";
}

/**
 * Whether an operation's results depend on the conventions level, by its dotted path with or
 * without the leading `bitbybit.`. `more` adds an application's own entries, for operations it adds on
 * top of these libraries.
 * @param path - The dotted path of the operation, such as `occt.io.saveShapeSTEP`
 * @param more - Further entries, in the form `CONVENTIONS_SURFACE` takes
 * @returns True when the operation is on the surface
 */
export function isConventionSensitive(path: string, more: readonly string[] = []): boolean {
    const bare = path.startsWith(ROOT) ? path.slice(ROOT.length) : path;
    return [...CONVENTIONS_SURFACE, ...more].some((entry) => covers(entry, bare));
}

/**
 * The entries of the surface that a piece of script code may reach, found by the last name of
 * each entry standing in the code as a whole word. It errs on the side of naming an entry: a
 * variable that happens to be called `io` counts, so no use is ever missed through an alias or a
 * destructured service, and code that names none of them uses none of them.
 * @param code - The script's source text
 * @param more - Further entries, in the form `CONVENTIONS_SURFACE` takes
 * @returns The entries the code may reach, in the surface's order
 */
export function conventionSensitiveMentions(code: string, more: readonly string[] = []): string[] {
    return [...CONVENTIONS_SURFACE, ...more].filter((entry) => {
        const name = lastNameOf(entry).replace(/[$]/g, "\\$");
        return name !== "" && new RegExp(`(?<!${WORD})${name}(?!${WORD})`).test(code);
    });
}
