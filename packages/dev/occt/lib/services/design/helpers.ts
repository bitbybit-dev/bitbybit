import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { give, nameOf } from "./names";
import { DesignProblem, pointer } from "./problems";
import { release } from "./cache";
import type { ResolveContext } from "./references";
import { resolveEdges, resolveFaces } from "./references";
import type { BodyState, DesignRun } from "./state";
import { directionOf, pointOf } from "./values";
import { squaredFrame, tripleOf, unitVector } from "./placement";

export function faceCount(shape: TopoDS_Shape, run: DesignRun): number {
    return run.occ.CountSubShapes(shape, run.occ.TopAbs_ShapeEnum.FACE, false);
}

export function contextOf(body: BodyState, run: DesignRun): ResolveContext {
    return { shape: body.shape, names: body.names, occt: run.occt, base: run.base, suppressed: run.suppressed, rebinding: run.rebinding };
}

export function bodyOf(name: string, run: DesignRun): BodyState {
    return run.bodies.get(name)!;
}

export function ownerOf(feature: string, path: string, run: DesignRun): string {
    const owner = run.owners.get(feature);
    if (owner === undefined) {
        throw new DesignProblem(path, `"${feature}" made no faces of a body`);
    }
    return owner;
}

const signaturesByShape = new WeakMap<TopoDS_Shape, Models.OCCT.ShapeSignatures["faces"]>();

/** The signatures of a body's faces, worked out once per shape however many frames are placed on it. */
export function faceSignatures(shape: TopoDS_Shape, run: DesignRun): Models.OCCT.ShapeSignatures["faces"] {
    let faces = signaturesByShape.get(shape);
    if (faces === undefined) {
        faces = run.occt.analysis.signatures({ shape }).faces;
        signaturesByShape.set(shape, faces);
    }
    return faces;
}

const SQUARE_TOLERANCE = 1e-9;

const SQUARE = 1 - SQUARE_TOLERANCE;

const DISTINCT_SHARE_OF_SIZE = 1e-7;

const ALONG_SINE = 1e-9;

/**
 * The frame on the one flat face `reference` names on `body`, as CAD tools place a sketch on a face:
 * its outward normal; its origin where `origin`, or the document's origin when it is left out, meets
 * the face's plane square on, so it stays on the face wherever a parameter moves the face; and its x
 * axis along `direction` laid into the face. A face square to a world axis may leave the direction
 * out: X on a face facing along Y or Z, Y on one facing along X. Any other face needs one, since no
 * default turns smoothly with every face. `faceKey` is the property of `path` the reference sits under.
 */
export function faceFrame(reference: Models.OCCT.DesignFaceReference, origin: Models.OCCT.DesignPoint | undefined, direction: Models.OCCT.DesignPoint | undefined, body: BodyState, path: string, faceKey: string, run: DesignRun): Inputs.Base.Frame {
    const facePath = pointer(path, faceKey);
    const faces = resolveFaces(reference, contextOf(body, run), facePath);
    if (faces.length !== 1) {
        throw new DesignProblem(facePath, `one face is needed here, and the reference finds ${faces.length}`);
    }
    const signature = faceSignatures(body.shape, run)[faces[0]!]!;
    if (signature.type !== Inputs.OCCT.surfaceTypeEnum.plane) {
        throw new DesignProblem(facePath, `a flat face is needed here, and this one is a ${signature.type}`);
    }
    const normal = tripleOf(unitVector(signature.normal, facePath, run.base).map(component => component + 0));
    const point = origin === undefined ? [0, 0, 0] : pointOf(origin, run.parameters, pointer(path, "origin"));
    const height = run.base.vector.dot({ first: run.base.vector.sub({ first: point, second: signature.centre }), second: normal });
    const placed = tripleOf(run.base.vector.sub({ first: point, second: run.base.vector.mul({ vector: normal, scalar: height }) }));
    if (direction === undefined) {
        return { origin: placed, normal, direction: defaultDirection(normal, path) };
    }
    const squared = squaredFrame(placed, normal, directionOf(direction, run.parameters, pointer(path, "direction")), run.base);
    if (squared === undefined) {
        throw new DesignProblem(pointer(path, "direction"), "the direction runs along the face's normal");
    }
    return { origin: placed, normal, direction: squared.direction };
}

interface FoundFace {
    index: number;
    signature: Models.OCCT.FaceSignature;
}

function oneFace(reference: Models.OCCT.DesignFaceReference, body: BodyState, path: string, run: DesignRun): FoundFace {
    const faces = resolveFaces(reference, contextOf(body, run), path);
    if (faces.length !== 1) {
        throw new DesignProblem(path, `one face is needed here, and the reference finds ${faces.length}`);
    }
    return { index: faces[0]!, signature: faceSignatures(body.shape, run)[faces[0]!]! };
}

function crossingOf(index: number, plane: Models.OCCT.FaceSignature, body: BodyState, path: string, run: DesignRun): Inputs.Base.Point3 {
    const signature = faceSignatures(body.shape, run)[index]!;
    const face = run.occt.shapes.face.getFace({ shape: body.shape, index });
    const owned: TopoDS_Shape[] = [face];
    let centres: Inputs.Base.Point3[];
    try {
        const edges = run.occt.shapes.edge.getEdges({ shape: face });
        owned.push(...edges);
        centres = edges.filter(edge => run.occt.analysis.curves.curveType({ shape: edge }) === Inputs.OCCT.curveTypeEnum.circle).map(edge => run.occt.shapes.edge.getCircularEdgeCenterPoint({ shape: edge }));
    } finally {
        owned.forEach(release);
    }
    const vector = run.base.vector;
    const size = vector.dist({ first: signature.box.min, second: signature.box.max });
    const first = centres[0];
    const second = centres.find(centre => first !== undefined && vector.dist({ first, second: centre }) > DISTINCT_SHARE_OF_SIZE * size);
    if (first === undefined || second === undefined) {
        throw new DesignProblem(path, "the face is not bounded by circles at two places along its axis, so its axis cannot be told");
    }
    const along = unitVector(vector.sub({ first: second, second: first }), path, run.base);
    const normal = unitVector(plane.normal, path, run.base);
    if (Math.abs(vector.dot({ first: along, second: normal })) < ALONG_SINE) {
        throw new DesignProblem(path, "the axis runs along the face it should cross");
    }
    const distance = vector.dot({ first: normal, second: vector.sub({ first: plane.centre, second: first }) }) / vector.dot({ first: normal, second: along });
    return tripleOf(vector.add({ first, second: vector.mul({ vector: along, scalar: distance }) }));
}

/**
 * Where the axis of the cylindrical faces `reference` names crosses the plane of the flat face `on`
 * names. A hole's wall name also marks its counterbore, countersink and tip, so the faces found may
 * be several: those that are cylinders must share one axis, and other faces are passed over.
 */
export function axisCrossing(reference: Models.OCCT.DesignFaceReference, on: Models.OCCT.DesignFaceReference, body: BodyState, path: string, onPath: string, run: DesignRun): Inputs.Base.Point3 {
    const plane = oneFace(on, body, onPath, run).signature;
    const found = resolveFaces(reference, contextOf(body, run), path);
    const signatures = faceSignatures(body.shape, run);
    const cylinders = found.filter(index => signatures[index]!.type === Inputs.OCCT.surfaceTypeEnum.cylinder);
    if (cylinders.length === 0) {
        throw new DesignProblem(path, found.length === 1 ? `a cylindrical face is needed here, and this one is a ${signatures[found[0]!]!.type}` : "a cylindrical face is needed here, and the reference finds none");
    }
    const crossings = cylinders.map(index => crossingOf(index, plane, body, path, run));
    const size = run.base.vector.dist({ first: signatures[cylinders[0]!]!.box.min, second: signatures[cylinders[0]!]!.box.max });
    if (crossings.some(crossing => run.base.vector.dist({ first: crossings[0]!, second: crossing }) > DISTINCT_SHARE_OF_SIZE * size)) {
        throw new DesignProblem(path, "the cylindrical faces the reference finds are not on one axis");
    }
    return crossings[0]!;
}

/** The centre of the one circular edge `reference` names on `body`. */
export function circleCentre(reference: Models.OCCT.DesignEdgeReference, body: BodyState, path: string, run: DesignRun): Inputs.Base.Point3 {
    const edges = resolveEdges(reference, contextOf(body, run), path);
    if (edges.length !== 1) {
        throw new DesignProblem(path, `one edge is needed here, and the reference finds ${edges.length}`);
    }
    const edge = run.occt.shapes.edge.getEdge({ shape: body.shape, index: edges[0]! });
    try {
        if (run.occt.analysis.curves.curveType({ shape: edge }) !== Inputs.OCCT.curveTypeEnum.circle) {
            throw new DesignProblem(path, "a circular edge is needed here");
        }
        const centre = run.occt.shapes.edge.getCircularEdgeCenterPoint({ shape: edge });
        return [centre[0], centre[1], centre[2]];
    } finally {
        release(edge);
    }
}

/**
 * The frame a connector names: on its flat face `on`, with its origin from `origin`, from where the
 * axis of the cylindrical face `axis` crosses the face, or from the centre of the circular edge
 * `centre`, each met with the face square on.
 */
export function connectorFrame(connector: Models.OCCT.DesignConnector, body: BodyState, path: string, run: DesignRun): Inputs.Base.Frame {
    const origin = connector.axis !== undefined
        ? axisCrossing(connector.axis, connector.on, body, pointer(path, "axis"), pointer(path, "on"), run)
        : connector.centre !== undefined ? circleCentre(connector.centre, body, pointer(path, "centre"), run) : connector.origin;
    return faceFrame(connector.on, origin, connector.direction, body, path, "on", run);
}

function defaultDirection(normal: Inputs.Base.Vector3, path: string): Inputs.Base.Vector3 {
    if (Math.abs(normal[1]) >= SQUARE || Math.abs(normal[2]) >= SQUARE) {
        return [1, 0, 0];
    }
    if (Math.abs(normal[0]) >= SQUARE) {
        return [0, 1, 0];
    }
    throw new DesignProblem(pointer(path, "direction"), "the face is not square to a world axis, so its frame needs a direction");
}

export interface ProfileHistory {
    history: Models.OCCT.ShapeHistory;
    commands: readonly (string | undefined)[];
}

/**
 * The names a sweep, loft, boss or pocket gives the faces it made: `start` where the first profile
 * starts it, `end` where the last ends it, and `side` along each profile edge, with the sketch
 * command that drew the edge.
 */
export function profileNames(feature: string, profiles: readonly ProfileHistory[]): Map<number, string[]> {
    const given = new Map<number, string[]>();
    give(given, profiles[0]!.history.firstFaces, nameOf(feature, "start"));
    give(given, profiles[profiles.length - 1]!.history.lastFaces, nameOf(feature, "end"));
    for (const { history, commands } of profiles) {
        history.facesFromEdges.forEach((faces, edge) => {
            const command = commands[edge];
            give(given, faces, nameOf(feature, "side"), ...(command === undefined ? [] : [nameOf(feature, "side", command)]));
        });
    }
    return given;
}
