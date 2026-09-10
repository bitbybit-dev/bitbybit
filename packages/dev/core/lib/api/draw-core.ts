import * as Inputs from "./inputs";

/**
 * Base interface for draw options - engine-specific implementations extend this
 */
export interface DrawOptionsBase {
    updatable?: boolean | undefined;
    hidden?: boolean | undefined;
    opacity?: number | undefined;
    colours?: string | string[] | undefined;
    size?: number | undefined;
}

/**
 * Base class for Draw implementations across all game engines.
 * Contains entity detection methods and shared validation utilities.
 */
/** Which of the two draw entry points can resolve a kind. */
export type DrawPhase = "sync" | "async";

/**
 * One entry of the ordered table a draw call walks to decide what it was handed.
 *
 * `kind` is the name a renderer registers its handler under, and the name the order is pinned by.
 * `phase` says which entry point can resolve it: a kernel shape has to cross to a worker and back,
 * so it is reachable only from the asynchronous call.
 */
export interface DrawableKind {
    readonly kind: string;
    readonly phase: DrawPhase;
    matches(entity: unknown): boolean;
}

export class DrawCore {

    /**
     * Every kind a draw call can resolve, in the order it tries them.
     *
     * The order is the answer to questions the checks cannot answer alone, and it is one list rather
     * than a chain written out in each renderer because those copies had already drifted. Two cases
     * make it load-bearing. A two-element list of points is also a segment - `Base.Segment3` is
     * `[Point3, Point3]` - so `line` before `points` is what decides that a pair of points draws as
     * a segment. And a JSCAD path carries `points` like a polyline does, so `jscadPath` comes before
     * `polyline`; that one is now decided by the check as well, but the order still states it.
     *
     * A renderer resolves only the kinds it registered a handler for. A renderer with no node concept
     * skips those entries rather than declaring a check it cannot honour.
     * @ignore true
     */
    private cachedDrawableKinds: readonly DrawableKind[] | undefined;

    protected drawableKinds(): readonly DrawableKind[] {
        return this.cachedDrawableKinds ??= [
            { kind: "jscadMesh", phase: "async", matches: (e) => this.detectJscadMesh(e) },
            { kind: "occtShape", phase: "async", matches: (e) => this.detectOcctShape(e) },
            { kind: "occtShapes", phase: "async", matches: (e) => this.detectOcctShapes(e) },
            { kind: "jscadMeshes", phase: "async", matches: (e) => this.detectJscadMeshes(e) },
            { kind: "manifoldShape", phase: "async", matches: (e) => this.detectManifoldShape(e) },
            { kind: "manifoldShapes", phase: "async", matches: (e) => this.detectManifoldShapes(e) },
            { kind: "decomposedMeshes", phase: "async", matches: (e) => this.detectDecomposedMeshes(e) },
            { kind: "decomposedMesh", phase: "async", matches: (e) => this.detectDecomposedMesh(e) },
            { kind: "line", phase: "sync", matches: (e) => this.detectLine(e) },
            { kind: "point", phase: "sync", matches: (e) => this.detectPoint(e) },
            { kind: "jscadPath", phase: "sync", matches: (e) => this.detectJscadPath(e) },
            { kind: "polyline", phase: "sync", matches: (e) => this.detectPolyline(e) },
            { kind: "node", phase: "sync", matches: (e) => this.detectNode(e) },
            { kind: "verbCurve", phase: "sync", matches: (e) => this.detectVerbCurve(e) },
            { kind: "verbSurface", phase: "sync", matches: (e) => this.detectVerbSurface(e) },
            { kind: "jscadPaths", phase: "sync", matches: (e) => this.detectJscadPaths(e) },
            { kind: "polylines", phase: "sync", matches: (e) => this.detectPolylines(e) },
            { kind: "lines", phase: "sync", matches: (e) => this.detectLines(e) },
            { kind: "points", phase: "sync", matches: (e) => this.detectPoints(e) },
            { kind: "nodes", phase: "sync", matches: (e) => this.detectNodes(e) },
            { kind: "verbCurves", phase: "sync", matches: (e) => this.detectVerbCurves(e) },
            { kind: "verbSurfaces", phase: "sync", matches: (e) => this.detectVerbSurfaces(e) },
            { kind: "tag", phase: "sync", matches: (e) => this.detectTag(e) },
            { kind: "tags", phase: "sync", matches: (e) => this.detectTags(e) },
        ];
    }

    /**
     * The first kind of the given phase that matches, among those a handler was registered for.
     *
     * The handler is looked up before the check runs, so a renderer that does not draw a kind never
     * asks about it - which is what the hand-written chains achieved by simply not having the branch.
     * @ignore true
     */
    protected resolveDrawableKind(entity: unknown, phase: DrawPhase, handled: (kind: string) => boolean): string | undefined {
        const found = this.drawableKinds().find((k) => k.phase === phase && handled(k.kind) && k.matches(entity));
        return found?.kind;
    }


    detectPoint(entity: unknown): entity is Inputs.Base.Point3 {
        return (Array.isArray(entity) && entity.length === 3 && this.checkIfElementsInArrayAreNumbers(entity));
    }

    detectPoints(entity: unknown): entity is Inputs.Base.Point3[] {
        return Array.isArray(entity) &&
            entity.length > 0 &&
            this.checkIfElementsInArrayAreArrays(entity) &&
            this.arraysInChildrenArraysContainNumbers(entity) &&
            this.arraysInChildrenArraysAreOfLength3(entity);
    }

    detectLine(entity: unknown): entity is Inputs.Base.Line3 | Inputs.Base.Segment3 {
        if (!entity || typeof entity !== "object") return false;
        const obj = entity as Record<string, unknown>;
        return !!(obj["start"] && obj["end"] && Array.isArray(obj["start"]) && Array.isArray(obj["end"])) || 
               (Array.isArray(entity) && entity.length === 2 && 
                Array.isArray(entity[0]) && Array.isArray(entity[1]) && 
                this.checkIfElementsInArrayAreNumbers(entity[0]) && entity[0].length === 3 && 
                this.checkIfElementsInArrayAreNumbers(entity[1]) && entity[1].length === 3);
    }

    detectLines(entity: unknown): entity is (Inputs.Base.Line3 | Inputs.Base.Segment3)[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectLine(el));
    }

    /**
     * The three-dimensional points a JSCAD path draws as.
     *
     * A `Path2` is two-dimensional and its points are `[x, y]` pairs, so drawing one through a
     * polyline primitive - which is what every renderer here does - needs the third component
     * supplied rather than left off the end: a two-element point read as a three-element one takes
     * the next point's x as its own z and the whole line skews. A closed path also has to be closed
     * explicitly, because its final segment back to the start is implied by `isClosed` rather than
     * by a repeated point.
     *
     * The path's transforms are applied here rather than assumed already applied. JSCAD accumulates
     * a translate or a rotate into `transforms` and leaves `points` untouched until something asks
     * for them, so a moved path still carries the coordinates it was built at - and reading `points`
     * straight off draws it back at its original pose while the solid built from the same path draws
     * where it was moved to. The matrix is column-major and the path is flat, so only the four terms
     * that touch x and y are worth multiplying.
     */
    protected pathToPolylinePoints(path: Inputs.JSCAD.JSCADPath2): Inputs.Base.Point3[] {
        const points = path.points ?? [];
        const m = path.transforms;
        const transformed = Array.isArray(m) && m.length === 16;
        const drawn: Inputs.Base.Point3[] = points.map(p => transformed
            ? [m[0] * p[0] + m[4] * p[1] + m[12], m[1] * p[0] + m[5] * p[1] + m[13], 0]
            : [p[0], p[1], 0]);
        if (path.isClosed && drawn.length > 0) {
            drawn.push(drawn[0]!);
        }
        return drawn;
    }

    /**
     * Whether the entity is a JSCAD 2D path.
     *
     * It matters because a path also carries `points`, so without this check it is drawn as a
     * three-dimensional polyline built from two-dimensional points - which draws, and draws the
     * wrong thing.
     *
     * Both fields are load-bearing. `isClosed` is what tells a path from JSCAD's other two kinds,
     * and is the test the kernel's own narrowing uses - but it is not enough here, because this
     * repository's own polyline DTO carries `isClosed` too, and matching on it alone flattens every
     * closed polyline to z = 0. `transforms` is what every JSCAD entity carries and no polyline
     * does, so the pair identifies a path and nothing else.
     */
    detectJscadPath(entity: unknown): entity is Inputs.JSCAD.JSCADPath2 {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        return "isClosed" in entity
            && "transforms" in entity
            && Array.isArray((entity as Record<string, unknown>)["points"]);
    }

    detectJscadPaths(entity: unknown): entity is Inputs.JSCAD.JSCADPath2[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectJscadPath(el));
    }

    /**
     * Whether the entity is a polyline: an object carrying a `points` array.
     *
     * A JSCAD `Path2` also carries `points`, so it is excluded here rather than left to the dispatch
     * order to catch - a path has its own handler, and a check that decides what something is should
     * not depend on what was asked first.
     *
     * Still not a type predicate: `points` is a shape many objects have, so asserting
     * `Base.Polyline3` would be a claim this check cannot support, and a predicate that is wrong is
     * worse than a boolean that is wrong, because the compiler believes it.
     */
    detectPolyline(entity: unknown): boolean {
        if (!entity || typeof entity !== "object") return false;
        if (this.detectJscadPath(entity)) return false;
        const obj = entity as Record<string, unknown>;
        return obj["points"] !== undefined && Array.isArray(obj["points"]);
    }

    detectPolylines(entity: unknown): boolean {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectPolyline(el));
    }

    /**
     * Whether the entity looks like a scene node.
     *
     * Deliberately not a type predicate: the check is that `id` is a string containing "node", which
     * any object can satisfy, so it cannot honestly assert a renderer's node type. Nodes are also a
     * single renderer's concept, which is why the honest version of this check belongs beside that
     * renderer rather than here.
     */
    detectNode(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        return typeof obj["id"] === "string" && obj["id"].includes("node");
    }

    detectNodes(entity: unknown): boolean {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectNode(el));
    }

    /**
     * Whether the entity is a Verb NURBS curve, by the degree and knots on its `_data`.
     *
     * Deliberately not a type predicate: `Base.VerbCurve` and `Base.VerbSurface` are both the
     * structural `{ tessellate }`, so `entity is Base.VerbCurve` would be true of a surface as well
     * and would narrow nothing. That identity is intentional - it is what keeps drawing independent
     * of the verb library - and `bitbybit.verb` is deprecated, so this stays a boolean rather than
     * growing types for an area that comes out in the next major.
     */
    detectVerbCurve(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        const data = obj["_data"] as Record<string, unknown> | undefined;
        return data !== undefined && data["controlPoints"] !== undefined && data["knots"] !== undefined && data["degree"] !== undefined;
    }

    /**
     * Whether the entity is a Verb NURBS surface, by the U and V degrees and knots on its `_data`.
     *
     * Deliberately not a type predicate, for the reason given on the curve check above.
     */
    detectVerbSurface(entity: unknown): boolean {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        const data = obj["_data"] as Record<string, unknown> | undefined;
        return data !== undefined && data["controlPoints"] !== undefined && 
               data["degreeU"] !== undefined && data["degreeV"] !== undefined && 
               data["knotsU"] !== undefined && data["knotsV"] !== undefined;
    }

    detectVerbCurves(entity: unknown): boolean {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectVerbCurve(el));
    }

    detectVerbSurfaces(entity: unknown): boolean {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectVerbSurface(el));
    }

    detectJscadMesh(entity: unknown): entity is Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3 {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        return obj["sides"] !== undefined || obj["polygons"] !== undefined;
    }

    detectJscadMeshes(entity: unknown): entity is (Inputs.JSCAD.JSCADGeom2 | Inputs.JSCAD.JSCADGeom3)[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectJscadMesh(el));
    }

    detectOcctShape(entity: unknown): entity is Inputs.OCCT.TopoDSShapePointer {
        if (!entity || typeof entity !== "object") return false;
        const obj = entity as Record<string, unknown>;
        return obj["type"] === "occ-shape";
    }

    detectOcctShapes(entity: unknown): entity is Inputs.OCCT.TopoDSShapePointer[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectOcctShape(el));
    }

    detectManifoldShape(entity: unknown): entity is Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer {
        if (!entity || typeof entity !== "object") return false;
        const obj = entity as Record<string, unknown>;
        return obj["type"] === "manifold-shape";
    }

    detectManifoldShapes(entity: unknown): entity is (Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer)[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectManifoldShape(el));
    }

    detectDecomposedMesh(entity: unknown): entity is Inputs.OCCT.DecomposedMeshDto {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        if (obj["type"] === "occ-shape" || obj["type"] === "manifold-shape") return false;
        return Array.isArray(obj["faceList"]) || Array.isArray(obj["edgeList"]) || Array.isArray(obj["pointsList"]);
    }

    detectDecomposedMeshes(entity: unknown): entity is Inputs.OCCT.DecomposedMeshDto[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectDecomposedMesh(el));
    }

    detectTag(entity: unknown): entity is Inputs.Tag.TagDto {
        if (!entity || typeof entity !== "object" || Array.isArray(entity)) return false;
        const obj = entity as Record<string, unknown>;
        return obj["text"] !== undefined;
    }

    detectTags(entity: unknown): entity is Inputs.Tag.TagDto[] {
        return Array.isArray(entity) && entity.length > 0 && !entity.some(el => !this.detectTag(el));
    }

    checkIfElementsInArrayAreNumbers(array: unknown[]): boolean {
        return !array.some(el => typeof el !== "number" || isNaN(el));
    }

    checkIfElementsInArrayAreArrays(array: unknown[]): boolean {
        return !array.some(el => !Array.isArray(el));
    }

    arraysInChildrenArraysContainNumbers(array: unknown[][]): boolean {
        return !array.some(el => !this.checkIfElementsInArrayAreNumbers(el));
    }

    arraysInChildrenArraysAreOfLength3(array: unknown[][]): boolean {
        return !array.some(el => el.length !== 3);
    }

    /**
     * Validate if draw input contains valid entity data
     * @param entity - Entity to validate
     * @returns True if valid, false otherwise
     */
    protected isValidDrawInput(entity: unknown): boolean {
        if (entity === null || entity === undefined) {
            return false;
        }
        
        if (Array.isArray(entity) && entity.length === 0) {
            return false;
        }
        
        return true;
    }

    /**
     * Type guard for Tag DTO
     * @param value - Value to check
     * @returns True if value has text property (TagDto)
     */
    protected isTagDto(value: unknown): value is Inputs.Tag.TagDto {
        return value !== null && 
               value !== undefined && 
               typeof value === "object" && 
               "text" in (value);
    }

    /**
     * Type guard for Tag DTO array
     * @param value - Value to check
     * @returns True if value is array of TagDtos
     */
    protected isTagDtoArray(value: unknown): value is Inputs.Tag.TagDto[] {
        return Array.isArray(value) && 
               value.length > 0 && 
               this.isTagDto(value[0]);
    }
}