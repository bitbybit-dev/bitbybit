const ROOT = "bitbybit.";
const WORD = "[A-Za-z0-9_$]";

/**
 * The operations whose results depend on the conventions level content runs by: every one that
 * reads or writes a file or a drawing, lays text or a grid on the ground, names a hand, places a
 * recipe, or meshes for a tool with another up axis. An entry is a dotted path as a script writes
 * it after `bitbybit.`, and one that ends in a dot stands for everything under it.
 *
 * Content that uses none of them runs the same at every level, so it can be moved to the newest
 * one as it is; content that uses one is best moved by its author.
 */
export const CONVENTIONS_SURFACE: readonly string[] = [
    "occt.io.",
    "occt.svg.",
    "occt.recipes.",
    "occt.design.",
    "occt.parts.",
    "occt.shapes.wire.createHelixWire",
    "occt.shapes.wire.createHelixWireByTurns",
    "occt.shapes.wire.createTaperedHelixWire",
    "occt.shapes.wire.createFlatSpiralWire",
    "occt.shapes.wire.textWires",
    "occt.shapes.wire.textWiresWithData",
    "occt.shapes.wire.hexagonsInGrid",
    "occt.shapes.face.hexagonsInGrid",
    "occt.operations.hiddenLines",
    "occt.shapeToMesh",
    "occt.shapesToMeshes",
    "occt.shapeFacesToPolygonPoints",
    "occt.docToMesh",
    "occt.docToMeshes",
    "text.vectorText",
    "text.vectorChar",
    "point.hexGrid",
    "point.hexGridScaledToFit",
    "recipes.surfaceMeshes",
    "jscad.downloadSolidSTL",
    "jscad.downloadSolidsSTL",
    "jscad.downloadGeometryDxf",
    "jscad.downloadGeometry3MF",
    "manifold.recipes.",
    "ifc.",
    "babylon.io.exportMeshToStl",
    "babylon.io.exportMeshesToStl",
    "babylon.io.loadAssetIntoScene",
    "babylon.io.loadAssetIntoSceneNoReturn",
    "babylon.io.loadAssetIntoSceneFromRootUrl",
    "babylon.io.loadAssetIntoSceneFromRootUrlNoReturn",
    "babylon.meshBuilder.createCapsule",
    "babylon.meshBuilder.createGround",
    "babylon.scene.clearAllDrawn",
    "babylon.scene.useRightHandedSystem",
];

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
