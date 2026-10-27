import type { Base } from "@bitbybit-dev/base";
import { WORLD_AXES, axesToMatrix, vectorToLocal } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/frame-axes";
import { add3, length3, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/polygons";
import { PARALLEL_TOLERANCE } from "../build/constants";
import { axisPlacementFrame, directionOf } from "../build/placement";
import type { ModelSnapshot } from "../model/snapshot";
import { isEnumeration, isList, isReference } from "../step/values";
import { CurveSampler } from "./curves";
import { UnsupportedGeometryError } from "./errors";
import { INWARD, MeshCollector, OUTWARD, UNORIENTED, concatenated } from "./faceted";
import { itemColour } from "./colours";
import type { PartEntry, PartGroup, ProfileRegion, RecipePart, TriangleMesh } from "./geometry-types";
import { operatorMatrix } from "./operators";
import { profileRegion } from "./profiles";
import { regionSolid } from "./regions";
import { SweptSolids } from "./swept-solids";
import { ExactBreps } from "./exact-brep";
import type { RecipeBuilder } from "./recipe-builder";

const IDENTITY = axesToMatrix(WORLD_AXES);
const Z_AXIS: Base.Vector3 = [0, 0, 1];
const PLAIN_HALF_SPACES: ReadonlySet<string> = new Set(["IfcHalfSpaceSolid", "IfcBoxedHalfSpace"]);
const CLOSED_SHELL = "IfcClosedShell";
const MAPPED_ITEM = "IfcMappedItem";
const SURFACE_MODEL_FACES: Readonly<Record<string, string>> = { IfcFaceBasedSurfaceModel: "FbsmFaces", IfcShellBasedSurfaceModel: "SbsmBoundary" };
const MESH_ITEMS: ReadonlySet<string> = new Set([
    "IfcTriangulatedFaceSet", "IfcPolygonalFaceSet", "IfcFacetedBrep", "IfcFacetedBrepWithVoids", "IfcAdvancedBrep", "IfcAdvancedBrepWithVoids", "IfcFaceBasedSurfaceModel", "IfcShellBasedSurfaceModel",
]);
const BREPS_WITH_VOIDS: ReadonlySet<string> = new Set(["IfcFacetedBrepWithVoids", "IfcAdvancedBrepWithVoids"]);
const ADVANCED_BREPS: ReadonlySet<string> = new Set(["IfcAdvancedBrep", "IfcAdvancedBrepWithVoids"]);

function isIdentity(matrix: readonly number[]): boolean {
    return matrix.every((value, index) => value === IDENTITY[index]);
}

function flat(points: readonly Base.Point2[]): number[] {
    return points.flatMap(([x, y]) => [x, y]);
}

export class ItemConverter {
    private readonly model: ModelSnapshot;
    private readonly builder: RecipeBuilder;
    private readonly curves: CurveSampler;
    private readonly reach: number;
    private readonly items = new Map<number, number>();
    private readonly maps = new Map<number, readonly RecipePart[]>();
    private readonly representations = new Map<number, readonly RecipePart[]>();
    private readonly itemColours = new Map<number, number[] | undefined>();
    private readonly solids: SweptSolids;
    private exact: ExactBreps | undefined;

    constructor(model: ModelSnapshot, builder: RecipeBuilder, reach: number) {
        this.model = model;
        this.builder = builder;
        this.curves = new CurveSampler(model);
        this.reach = reach;
        this.solids = new SweptSolids(model, builder, this.curves);
    }

    representation(representation: number): number {
        return this.joined(this.parts(representation).map((part) => part.node));
    }

    parts(representation: number): readonly RecipePart[] {
        const known = this.representations.get(representation);
        if (known) {
            return known;
        }
        const items = this.model.attribute(representation, "Items");
        const ids = (isList(items) ? items : []).filter(isReference).map((item) => item.ref);
        if (!ids.length) {
            throw new UnsupportedGeometryError(`#${representation} holds no items`);
        }
        const groups = new Map<string, PartGroup>();
        const groupOf = (rgba: readonly number[] | undefined): PartGroup => {
            const key = rgba ? rgba.join(",") : "";
            let group = groups.get(key);
            if (!group) {
                group = { rgba, entries: [] };
                groups.set(key, group);
            }
            return group;
        };
        for (const item of ids) {
            const own = itemColour(this.model, this.itemColours, item);
            if (this.model.typeOf(item) === MAPPED_ITEM) {
                this.mappedParts(item).forEach((part) => groupOf(part.rgba ?? own).entries.push({ node: part.node }));
            } else {
                groupOf(own).entries.push({ item });
            }
        }
        const parts = [...groups.values()].map((group) => ({ rgba: group.rgba, node: this.groupNode(representation, group.entries) }));
        this.representations.set(representation, parts);
        return parts;
    }

    item(item: number): number {
        const known = this.items.get(item);
        if (known !== undefined) {
            return known;
        }
        const node = this.convert(item);
        this.items.set(item, node);
        return node;
    }

    private convert(item: number): number {
        const type = this.model.entity(item).type;
        switch (type) {
            case "IfcExtrudedAreaSolid":
                return this.extrusion(item);
            case "IfcBooleanClippingResult":
            case "IfcBooleanResult":
                return this.boolean(item);
            case "IfcMappedItem":
                return this.mapped(item);
            case "IfcRevolvedAreaSolid":
                return this.solids.revolved(item);
            case "IfcExtrudedAreaSolidTapered":
                return this.solids.tapered(item);
            case "IfcSweptDiskSolid":
            case "IfcSweptDiskSolidPolygonal":
                return this.solids.sweptDisk(item, type === "IfcSweptDiskSolidPolygonal");
            case "IfcSurfaceCurveSweptAreaSolid":
            case "IfcFixedReferenceSweptAreaSolid":
                return this.solids.areaSweep(item, type === "IfcFixedReferenceSweptAreaSolid");
            case "IfcBlock":
            case "IfcRightCircularCylinder":
            case "IfcRightCircularCone":
            case "IfcSphere":
            case "IfcRectangularPyramid":
                return this.solids.primitive(item, type);
            case "IfcCsgSolid": {
                const root = this.model.attribute(item, "TreeRootExpression");
                if (!isReference(root)) {
                    throw new UnsupportedGeometryError(`#${item} has no tree root expression`);
                }
                return this.item(root.ref);
            }
            case "IfcTriangulatedFaceSet":
            case "IfcPolygonalFaceSet":
            case "IfcFacetedBrep":
            case "IfcFacetedBrepWithVoids":
            case "IfcFaceBasedSurfaceModel":
            case "IfcShellBasedSurfaceModel":
                return this.meshNode(item, this.meshOf(item));
            case "IfcAdvancedBrep":
            case "IfcAdvancedBrepWithVoids":
                return this.advancedBreps(item, [item]);
            default:
                throw new UnsupportedGeometryError(`An ${type} is not supported yet`);
        }
    }

    private placedBy(node: number, placement: number | undefined): number {
        if (placement === undefined) {
            return node;
        }
        const matrix = axesToMatrix(axisPlacementFrame(this.model, placement));
        return isIdentity(matrix) ? node : this.builder.node({ op: "transform", of: node, matrix });
    }

    private extrusion(item: number): number {
        const area = this.model.attribute(item, "SweptArea");
        if (!isReference(area)) {
            throw new UnsupportedGeometryError(`#${item} has no swept area`);
        }
        const region = profileRegion(this.model, area.ref, this.curves);
        const direction = directionOf(this.model, this.model.attribute(item, "ExtrudedDirection"), Z_AXIS);
        const depth = this.model.attribute(item, "Depth");
        if (typeof depth !== "number" || !Number.isFinite(depth) || depth === 0) {
            throw new UnsupportedGeometryError(`#${item} has no depth`);
        }
        const solid = this.extruded(region, scale3(direction, Math.sign(depth) / length3(direction)), Math.abs(depth));
        const position = this.model.attribute(item, "Position");
        return this.placedBy(solid, isReference(position) ? position.ref : undefined);
    }

    private extruded(region: ProfileRegion, direction: Base.Vector3, depth: number): number {
        return regionSolid(this.builder, region, (profile, part) => {
            if (part.kind !== "polygon" || part.plane === undefined) {
                return this.builder.node({ op: "extrude", profile, direction, depth });
            }
            const across = vectorToLocal(part.plane, direction);
            if (!(Math.abs(across[2]) > PARALLEL_TOLERANCE)) {
                throw new UnsupportedGeometryError("An extrusion runs along the plane of its outline");
            }
            const solid = this.builder.node({ op: "extrude", profile, direction: across, depth });
            return this.builder.node({ op: "transform", of: solid, matrix: axesToMatrix(part.plane) });
        });
    }

    private boolean(item: number): number {
        const operator = this.model.attribute(item, "Operator");
        const first = this.model.attribute(item, "FirstOperand");
        const second = this.model.attribute(item, "SecondOperand");
        if (!isReference(first) || !isReference(second)) {
            throw new UnsupportedGeometryError(`#${item} lacks an operand`);
        }
        const solid = this.item(first.ref);
        const plain = PLAIN_HALF_SPACES.has(this.model.typeOf(second.ref) ?? "");
        switch (isEnumeration(operator) ? operator.enum : undefined) {
            case "DIFFERENCE":
                return this.builder.node({ op: "difference", of: solid, tools: [this.tool(second.ref)] });
            case "UNION":
                if (plain) {
                    throw new UnsupportedGeometryError(`#${item} unites a solid with a half-space, which has no bounds`);
                }
                return this.builder.node({ op: "union", of: [solid, this.tool(second.ref)] });
            case "INTERSECTION": {
                if (plain) {
                    const space = this.halfSpace(second.ref);
                    return this.builder.node({ op: "difference", of: solid, tools: [this.builder.node({ ...space, normal: scale3(space.normal, -1) })] });
                }
                return this.builder.node({ op: "intersection", of: [solid, this.tool(second.ref)] });
            }
            default:
                throw new UnsupportedGeometryError(`#${item} has no boolean operator`);
        }
    }

    private tool(operand: number): number {
        switch (this.model.entity(operand).type) {
            case "IfcHalfSpaceSolid":
            case "IfcBoxedHalfSpace":
                return this.builder.node(this.halfSpace(operand));
            case "IfcPolygonalBoundedHalfSpace":
                return this.boundedHalfSpace(operand);
            default:
                return this.item(operand);
        }
    }

    private boundedHalfSpace(solid: number): number {
        const position = this.model.attribute(solid, "Position");
        const boundary = this.model.attribute(solid, "PolygonalBoundary");
        if (!isReference(position) || !isReference(boundary)) {
            throw new UnsupportedGeometryError(`#${solid} lacks its position or its boundary`);
        }
        const outline = wound2(this.curves.outline(boundary.ref), true);
        const profile = this.builder.node({ op: "polygon", points: this.builder.numbers(flat(outline)), holes: [] });
        const prism = this.builder.node({ op: "extrude", profile, direction: Z_AXIS, depth: 2 * this.reach });
        const frame = axisPlacementFrame(this.model, position.ref);
        const placed = this.builder.node({ op: "transform", of: prism, matrix: axesToMatrix({ ...frame, origin: add3(frame.origin, scale3(frame.z, -this.reach)) }) });
        const space = this.halfSpace(solid);
        const outside = this.builder.node({ ...space, normal: scale3(space.normal, -1) });
        return this.builder.node({ op: "difference", of: placed, tools: [outside] });
    }

    private halfSpace(solid: number): Base.RecipeHalfSpaceNode {
        const surface = this.model.attribute(solid, "BaseSurface");
        if (!isReference(surface) || this.model.entity(surface.ref).type !== "IfcPlane") {
            throw new UnsupportedGeometryError("Only half-spaces bounded by a plane are supported yet");
        }
        const position = this.model.attribute(surface.ref, "Position");
        if (!isReference(position)) {
            throw new UnsupportedGeometryError(`#${surface.ref} has no position`);
        }
        const frame = axisPlacementFrame(this.model, position.ref);
        const agreement = this.model.attribute(solid, "AgreementFlag");
        const normal = agreement === true ? scale3(frame.z, -1) : frame.z;
        return { op: "halfSpace", origin: frame.origin, normal };
    }

    private joined(nodes: readonly number[]): number {
        return nodes.length === 1 ? nodes[0]! : this.builder.node({ op: "compound", of: [...nodes] });
    }

    private groupNode(representation: number, entries: readonly PartEntry[]): number {
        const meshes = entries.flatMap((entry) => ("item" in entry && MESH_ITEMS.has(this.model.typeOf(entry.item) ?? "") ? [entry.item] : []));
        if (entries.length > 1 && meshes.length === entries.length) {
            if (meshes.every((item) => ADVANCED_BREPS.has(this.model.typeOf(item) ?? ""))) {
                return this.advancedBreps(representation, meshes);
            }
            return this.meshNode(representation, concatenated(meshes.map((item) => this.meshOf(item))));
        }
        return this.joined(entries.map((entry) => ("item" in entry ? this.item(entry.item) : entry.node)));
    }

    private mapped(item: number): number {
        return this.joined(this.mappedParts(item).map((part) => part.node));
    }

    private mappedParts(item: number): readonly RecipePart[] {
        const source = this.model.attribute(item, "MappingSource");
        const target = this.model.attribute(item, "MappingTarget");
        if (!isReference(source) || !isReference(target)) {
            throw new UnsupportedGeometryError(`#${item} lacks its source or target`);
        }
        let shared = this.maps.get(source.ref);
        if (shared === undefined) {
            const representation = this.model.attribute(source.ref, "MappedRepresentation");
            if (!isReference(representation)) {
                throw new UnsupportedGeometryError(`#${source.ref} maps no representation`);
            }
            const origin = this.model.attribute(source.ref, "MappingOrigin");
            const placement = isReference(origin) ? origin.ref : undefined;
            shared = this.parts(representation.ref).map((part) => ({ rgba: part.rgba, node: this.placedBy(part.node, placement) }));
            this.maps.set(source.ref, shared);
        }
        const matrix = operatorMatrix(this.model, target.ref);
        return isIdentity(matrix) ? shared : shared.map((part) => ({ rgba: part.rgba, node: this.builder.node({ op: "transform", of: part.node, matrix }) }));
    }

    private advancedBreps(owner: number, items: readonly number[]): number {
        let fallback: number | undefined;
        let meshFailure: UnsupportedGeometryError | undefined;
        try {
            fallback = this.meshNode(owner, concatenated(items.map((item) => this.meshOf(item))));
        } catch (thrown) {
            if (!(thrown instanceof UnsupportedGeometryError)) {
                throw thrown;
            }
            meshFailure = thrown;
        }
        this.exact ??= new ExactBreps(this.model, this.builder, this.curves);
        const exact = this.exact.describe(items);
        if (exact === undefined) {
            if (fallback === undefined) {
                throw meshFailure!;
            }
            return fallback;
        }
        return this.builder.node(fallback === undefined ? exact : { ...exact, fallback });
    }

    private meshNode(item: number, mesh: TriangleMesh): number {
        if (!mesh.indices.length) {
            throw new UnsupportedGeometryError(`#${item} holds no faces with an area`);
        }
        return this.builder.node({ op: "triangles", positions: this.builder.numbers(mesh.positions), indices: this.builder.indices(mesh.indices) });
    }

    private meshOf(item: number): TriangleMesh {
        const collector = new MeshCollector(this.model);
        const type = this.model.entity(item).type;
        switch (type) {
            case "IfcTriangulatedFaceSet":
                collector.triangulatedFaces(item);
                break;
            case "IfcPolygonalFaceSet":
                collector.polygonalFaces(item);
                break;
            case "IfcFaceBasedSurfaceModel":
            case "IfcShellBasedSurfaceModel":
                this.surfaceModel(collector, item, type);
                break;
            default:
                this.facetedBrep(collector, item, type);
        }
        return collector.mesh;
    }

    private facetedBrep(collector: MeshCollector, item: number, type: string): void {
        const outer = this.model.attribute(item, "Outer");
        if (!isReference(outer)) {
            throw new UnsupportedGeometryError(`#${item} has no outer shell`);
        }
        collector.shell(outer.ref, OUTWARD);
        const voids = BREPS_WITH_VOIDS.has(type) ? this.model.attribute(item, "Voids") : null;
        for (const shell of (isList(voids) ? voids : []).filter(isReference)) {
            collector.shell(shell.ref, INWARD);
        }
    }

    private surfaceModel(collector: MeshCollector, item: number, type: string): void {
        const sets = this.model.attribute(item, SURFACE_MODEL_FACES[type]!);
        for (const set of (isList(sets) ? sets : []).filter(isReference)) {
            collector.shell(set.ref, this.model.typeOf(set.ref) === CLOSED_SHELL ? OUTWARD : UNORIENTED);
        }
    }
}
