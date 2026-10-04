import type { Base } from "../../inputs";
import type { AssemblyStructureDef } from "../assembly/assembly-structure-def";
import type { DesignJointType, DesignUnits } from "./document";

/**
 * A problem in a design document, with the JSON pointer of the value it is about, such as
 * `/features/2/radius`.
 */
export interface DesignIssue {
    path: string;
    message: string;
}

/**
 * What became of one feature in a build: `ok`, `failed` with why, `suppressed`, `skipped` because a
 * body, profile or face it uses failed or was suppressed first, `rebound` when a reference lost its
 * faces and, in a build with `rebind: "report"`, took the faces most like its hint, or `pending` when
 * its outcome must come from the caller, as a script's does (see `pending` on the result). `ms` is the
 * time it took and `cached` says it was reused from an earlier build of the same inputs. A failed
 * feature whose lost references have hints lists, in `repairs`, the faces most like each.
 */
export interface DesignFeatureReport {
    id: string;
    type: string;
    status: "ok" | "failed" | "skipped" | "suppressed" | "rebound" | "pending";
    ms: number;
    cached: boolean;
    messages: string[];
    repairs?: DesignRepair[];
}

/**
 * The faces most like a lost reference's hint, by the reference's JSON pointer, with the score of
 * the least like of them; `clear` says they stand clear enough of the others that a build with
 * `rebind: "report"` takes them.
 */
export interface DesignRepair {
    path: string;
    faces: number[];
    score: number;
    clear: boolean;
}

/**
 * How built faces look: the faces as `shapes.face.getFaces` numbers them, with the values that
 * apply to them.
 */
export interface DesignBuiltFaceAppearance {
    indexes: number[];
    color?: string;
    metallic?: number;
    roughness?: number;
    opacity?: number;
    emissive?: string;
    emissiveStrength?: number;
}

/**
 * How a built part looks, with every expression evaluated and face and edge references resolved.
 * `edges` is there only when the part's appearance names edges.
 */
export interface DesignBuiltAppearance {
    color?: string;
    metallic?: number;
    roughness?: number;
    opacity?: number;
    emissive?: string;
    emissiveStrength?: number;
    edgeColor?: string;
    faces: DesignBuiltFaceAppearance[];
    edges?: DesignBuiltEdgeAppearance[];
}

/**
 * The colour of built edges: the edges as `shapes.edge.getEdges` numbers them, and their colour.
 */
export interface DesignBuiltEdgeAppearance {
    indexes: number[];
    color?: string;
}

/**
 * The material of a built part, with its density and properties evaluated.
 */
export interface DesignBuiltMaterial {
    id: string;
    name?: string;
    standard?: string;
    density?: number;
    properties: Record<string, string | number | boolean>;
}

/**
 * A part a design built: its `id`, `name` and the `body` it is, its shape and per face the names
 * references find it by, its evaluated properties, material and appearance, its `volume` in the
 * document's length unit cubed when the body is solid, and its `mass` in kilograms when it is solid
 * and its material has a density. `shapeHash` is a digest of the features and values that made the
 * shape: the same in every build that makes the same shape and new when the shape changes, so a
 * viewer keeps a mesh exactly as long as the shape it shows.
 *
 * `itemKey` names the item the part is: 16 hexadecimal digits over its document's id, its part id
 * and `parameters`, the declared values it reads (through its features, material, appearance and
 * properties, and back through the parameters computed from others). A parameter the part never
 * reads, the configuration that set the values and the document's version are not in it, so a
 * revision keeps the key and identical parts share it. `buildKey` adds the document's version, for
 * caches and editors that must tell revisions apart.
 *
 * In an assembly build each item is one entry, from its `document`, and its `id` is the part's own
 * followed by its item key, such as `post-3f9a1c2e5b7d4e8f`: the same item has the same id in every
 * build, whatever order the components are in. When the build is given several versions of the
 * document, the first eight digits of the version follow, so two revisions placed together stay two
 * parts. Tools may show the first eight digits of the key.
 */
export interface DesignBuiltPart<T> {
    id: string;
    itemKey: string;
    buildKey: string;
    name: string;
    body: string;
    shape: T;
    shapeHash: string;
    faceNames: string[][];
    properties: Record<string, string | number | boolean>;
    material?: DesignBuiltMaterial;
    appearance?: DesignBuiltAppearance;
    volume?: number;
    mass?: number;
    connectors: DesignBuiltConnector[];
    document?: string;
    parameters: Record<string, number | string>;
}

/**
 * A connector of a built part: its `id` and the frame it resolved to, in the part's own coordinates.
 */
export interface DesignBuiltConnector {
    id: string;
    frame: Base.Frame;
}

/**
 * One placed occurrence in a built assembly: its `path` of component ids from the top (`frame/bolt`),
 * the `parent` path it sits under, the built `part` it places or `assembly` true for a
 * sub-assembly, its placement `matrix` relative to its parent and `world` from the top, both
 * column-major 4 x 4, and its evaluated properties.
 */
export interface DesignBuiltComponent {
    path: string;
    name: string;
    parent?: string;
    part?: string;
    assembly?: boolean;
    matrix: Base.TransformMatrix;
    world: Base.TransformMatrix;
    properties: Record<string, string | number | boolean>;
}

/**
 * A joint as built: its `path` (the joint's id, below the sub-assembly it belongs to), its type,
 * the `component` path it moves and the one it is joined `to` (none for a frame), its `angle` and
 * `offset`, its limits, and the `frame` of its axis in world coordinates: the joint turns about the
 * frame's normal and slides along it.
 */
export interface DesignBuiltJoint {
    path: string;
    type: DesignJointType;
    component: string;
    to?: string;
    angle: number;
    offset: number;
    limits: { angle?: [number, number]; offset?: [number, number] };
    frame: Base.Frame;
}

/**
 * A line of an assembly's bill of materials: the built `part`, how many times it is placed through
 * every level, and its name and evaluated properties, such as its part number.
 */
export interface DesignBomLine {
    part: string;
    name: string;
    quantity: number;
    properties: Record<string, string | number | boolean>;
}

/**
 * An outcome the caller made, or kept from an earlier build, for the feature whose `hash` it carries: the
 * `shape`, and either the `names` of its faces in `shapes.face.getFaces` order, as a build names them,
 * or the `roles` a script gave its faces by index. A build takes it instead of making the feature.
 */
export interface DesignSuppliedOutcome<T> {
    hash: string;
    shape: T;
    names?: string[][];
    roles?: Record<string, number[]>;
}

/**
 * A feature a build could not make itself, waiting for the caller: the script feature's `id`, its JSON
 * pointer, the asset that holds its code, the `inputs` its script is given (shapes, face and edge
 * indexes, numbers and the values written as they are) and the `hash` its outcome must be supplied
 * under.
 */
export interface DesignPendingScript<T> {
    id: string;
    path: string;
    script: string;
    hash: string;
    inputs: Record<string, T | number | number[] | unknown>;
}

/**
 * What `design.build` made: the parts, a report per feature (per component for an assembly) in
 * document order, the problems found after the features ran (a part whose body failed, a property
 * that could not be evaluated), the configuration used, the value of every parameter, and the
 * `structure` that `assembly.manager.buildAssemblyDocument` turns into a document for STEP and glTF:
 * each part once under the document, or an assembly's placements. An assembly adds its
 * `components`, its `joints` and its bill of materials. `units` and `up`
 * are the built document's, filled in where it leaves them out, for the exports and views that read
 * them. `pending` lists the features whose outcomes the caller has still to make, such as scripts.
 */
export interface DesignBuildResult<T> {
    parts: DesignBuiltPart<T>[];
    report: DesignFeatureReport[];
    issues: DesignIssue[];
    configuration?: string;
    parameters: Record<string, number | string>;
    components?: DesignBuiltComponent[];
    joints?: DesignBuiltJoint[];
    bom?: DesignBomLine[];
    structure?: AssemblyStructureDef<T>;
    properties?: Record<string, string | number | boolean>;
    units: Required<DesignUnits>;
    up: "y" | "z";
    pending?: DesignPendingScript<T>[];
}
