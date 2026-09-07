/**
 * Which inputs namespaces are assembled from fragments, and in what order.
 *
 * Each kernel's parameter objects are one `export namespace`, and TypeScript cannot merge a
 * namespace across modules - so however many DTOs it holds, it has to stay one compilation unit.
 * What is split is the authoring: the namespace body lives as a directory of ordinary modules and
 * `scripts/gen-inputs.mjs` writes them back into the namespace.
 *
 * `order` is the assembled order, and it is explicit on purpose. The emitted .d.ts follows it, so it
 * is part of what consumers read; leaving it to the file system would mean a rename silently
 * reordering a published declaration file.
 *
 * A fragment named here must exist and a fragment in the directory must be named here - the
 * generator fails on either, so a new file cannot be quietly left out of the namespace.
 */

/** The comment every fragment carries, so a reader who opens one knows it is not the whole story. */
const fragmentNote = (dir) => [
    `// A fragment of the inputs namespace: scripts/gen-inputs.mjs assembles every file in this`,
    `// directory, in the order set by scripts/inputs.config.mjs, into ../${dir}. Edit here, then regenerate.`,
];

export const targets = [
    {
        namespace: "OCCT",
        dir: "packages/dev/occt/lib/api/inputs/occt",
        out: "packages/dev/occt/lib/api/inputs/occ-inputs.ts",
        header: [
            "/* eslint-disable @typescript-eslint/no-namespace */",
            "import { Base } from \"@bitbybit-dev/base\";",
            "import { IO } from \"@bitbybit-dev/base/lib/api/inputs/io-inputs\";",
            "import * as Models from \"../models\";",
        ],
        order: [
            "pointers",
            "enums",
            "meshes-points-and-constraints",
            "face-subdivision",
            "wires-along-params-and-base-geometry",
            "profiles-and-primitive-solids",
            "lines-arcs-and-cylinders",
            "fillets-and-chamfers",
            "curves-interpolation-and-parametrization",
            "division-projection-and-points",
            "lofts-pipes-booleans-and-repair",
            "thick-solids-and-transforms",
            "brep-graph-corners-and-draft",
            "meshing-and-file-io",
            "assembly-documents",
            "faces-2d-curves-and-decorative-wires",
            "dimensions-and-shaped-solids",
            "paths-and-svg",
        ],
    },
    {
        namespace: "JSCAD",
        dir: "packages/dev/jscad/lib/api/inputs/jscad",
        out: "packages/dev/jscad/lib/api/inputs/jscad-inputs.ts",
        header: [
            "/* eslint-disable @typescript-eslint/no-namespace */",
            "import { Base } from \"./base-inputs\";",
        ],
        order: [
            "entities-and-enums",
            "meshes-and-drawing",
            "transforms-and-downloads",
            "booleans",
            "expansions-and-extrusions",
            "paths",
            "shapes-2d",
            "solids",
            "text",
        ],
    },
    {
        namespace: "Manifold",
        dir: "packages/dev/manifold/lib/api/inputs/manifold",
        out: "packages/dev/manifold/lib/api/inputs/manifold-inputs.ts",
        header: [
            "/* eslint-disable @typescript-eslint/no-namespace */",
            "import { Base } from \"./base-inputs\";",
        ],
        order: [
            "pointers-and-enums",
            "drawing",
            "creation",
            "manifold-queries",
            "refinement",
            "hulls-slices-and-meshes",
            "cross-sections",
            "transforms",
            "booleans-and-splits",
            "conversions",
        ],
    },
    {
        namespace: "Verb",
        dir: "packages/dev/core/lib/api/inputs/verb",
        out: "packages/dev/core/lib/api/inputs/verb-inputs.ts",
        header: [
            "/* eslint-disable @typescript-eslint/no-namespace */",
            "",
            "import { BaseTypes } from \"../bitbybit/base-types\";",
            "import { Base } from \"./base-inputs\";",
        ],
        order: [
            "curves",
            "curve-drawing",
            "curve-operations",
            "curves-drawing-and-data",
            "conics",
            "surfaces",
            "surface-drawing",
            "primitives",
            "intersections",
        ],
    },
];

export { fragmentNote };
