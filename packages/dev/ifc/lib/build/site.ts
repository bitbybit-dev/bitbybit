import { WORLD_AXES } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { frustum, icosphere } from "@bitbybit-dev/base/lib/api/services/helpers/mesh-primitives";
import { isInsidePolygon2, wound2 } from "@bitbybit-dev/base/lib/api/services/helpers/polygons";
import type { MeshArrays } from "@bitbybit-dev/base/lib/api/services/helpers/helper-types";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcTransaction } from "../model/transaction";
import { enumValue, ref } from "../step/values";
import type { CrownMesh, TerrainSpec, TreeSpec } from "./build-types";
import { POINT3_SIZE, TRIANGLE_CORNERS } from "./constants";
import { bodyContext } from "./contexts";
import type { EntityWriter } from "./entity-writer";
import { associateNewMaterial, dressParts, materialsOfParts, requireMaterial } from "./materials";
import { cleanOutline } from "./outlines";
import { objectPlacementOf } from "./placement";
import { containIn } from "./spatial";

const GEOGRAPHIC_ELEMENT = "IfcGeographicElement";
const CROWN_DETAIL = 1;
const CROWN_STRETCH = 1.25;
const CROWN_SHARE_OF_HEIGHT = 0.45;
const CROWN_RIPPLE = 0.07;
const CROWN_LOBES = 3;
const TRUNK_SIDES = 8;
const TRUNK_TOP_SHARE = 0.6;
const TRUNK_INTO_CROWN = 0.35;

export function onlySite(model: ModelSnapshot | IfcTransaction): number {
    const sites = model.byType("IfcSite");
    if (sites.length !== 1) {
        throw new Error(`Site elements are added to the model's one site, and it has ${sites.length}`);
    }
    return sites[0]!.id;
}

function triangulatedFaceSet(writer: EntityWriter, mesh: MeshArrays, origin: readonly number[]): number {
    const points: number[][] = [];
    for (let at = 0; at < mesh.positions.length; at += POINT3_SIZE) {
        points.push([mesh.positions[at]! + origin[0]!, mesh.positions[at + 1]! + origin[1]!, mesh.positions[at + 2]! + origin[2]!]);
    }
    const triangles: number[][] = [];
    for (let at = 0; at < mesh.indices.length; at += TRIANGLE_CORNERS) {
        triangles.push([mesh.indices[at]! + 1, mesh.indices[at + 1]! + 1, mesh.indices[at + 2]! + 1]);
    }
    const coordinates = writer.create("IfcCartesianPointList3D", { CoordList: points });
    return writer.create("IfcTriangulatedFaceSet", { Coordinates: ref(coordinates), Closed: true, CoordIndex: triangles });
}

function crownMesh(spec: TreeSpec): CrownMesh {
    const upward = Math.min(spec.crownRadius * CROWN_STRETCH, spec.height * CROWN_SHARE_OF_HEIGHT);
    const sphere = icosphere(CROWN_DETAIL);
    const positions = sphere.positions.slice();
    for (let at = 0; at < positions.length; at += POINT3_SIZE) {
        const [x, y, z] = [positions[at]!, positions[at + 1]!, positions[at + 2]!];
        const ripple = 1 + CROWN_RIPPLE * Math.sin(CROWN_LOBES * Math.atan2(y, x) + 2 * z);
        positions[at] = x * spec.crownRadius * ripple;
        positions[at + 1] = y * spec.crownRadius * ripple;
        positions[at + 2] = z * upward * ripple;
    }
    return { mesh: { positions, indices: sphere.indices }, centre: spec.height - upward * (1 + CROWN_RIPPLE) };
}

export function createTerrain(tx: IfcTransaction, writer: EntityWriter, spec: TerrainSpec, tolerance: number): number {
    if (!(spec.depth > 0)) {
        throw new Error(`The terrain's depth must be more than zero, got ${spec.depth}`);
    }
    const site = onlySite(tx);
    const material = spec.material === undefined ? undefined : requireMaterial(tx, spec.material);
    const outer = wound2(cleanOutline(spec.outline, tolerance, "outline"), true);
    const holes = spec.holes.map((hole, index) => {
        const cleaned = cleanOutline(hole, tolerance, `hole ${index}`);
        if (!cleaned.every((point) => isInsidePolygon2(point, outer))) {
            throw new Error(`Hole ${index} reaches outside the terrain's outline`);
        }
        return wound2(cleaned, false);
    });
    const placement = writer.localPlacement(objectPlacementOf(tx, site), { ...WORLD_AXES, origin: [0, 0, spec.elevation] });
    const solid = writer.extrusion(writer.profile({ outer, holes }), WORLD_AXES, spec.depth, [0, 0, -1]);
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "SweptSolid", [solid]);
    const terrain = writer.create(GEOGRAPHIC_ELEMENT, {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([body])),
        PredefinedType: enumValue("TERRAIN"),
    });
    containIn(tx, writer, site, terrain);
    if (material !== undefined) {
        associateNewMaterial(tx, writer, [terrain], material);
    }
    return terrain;
}

export function createTree(tx: IfcTransaction, writer: EntityWriter, spec: TreeSpec): number {
    for (const [what, value] of [["height", spec.height], ["crown radius", spec.crownRadius], ["trunk radius", spec.trunkRadius]] as const) {
        if (!(value > 0) || !Number.isFinite(value)) {
            throw new Error(`The tree's ${what} must be more than zero, got ${value}`);
        }
    }
    if (spec.trunkRadius >= spec.crownRadius) {
        throw new Error("A tree's trunk must be narrower than its crown");
    }
    const site = onlySite(tx);
    const { mesh, centre } = crownMesh(spec);
    const trunkTop = centre + (spec.height - centre) * TRUNK_INTO_CROWN;
    const parts = [
        { name: "Foliage", items: [triangulatedFaceSet(writer, mesh, [0, 0, centre])], material: spec.crownMaterial },
        { name: "Trunk", items: [triangulatedFaceSet(writer, frustum(TRUNK_SIDES, spec.trunkRadius, spec.trunkRadius * TRUNK_TOP_SHARE, trunkTop), [0, 0, 0])], material: spec.trunkMaterial },
    ];
    const materials = materialsOfParts(tx, parts);
    const placement = writer.localPlacement(objectPlacementOf(tx, site), { ...WORLD_AXES, origin: [spec.position[0], spec.position[1], spec.elevation] });
    const body = writer.shapeRepresentation(bodyContext(tx, writer), "Body", "Tessellation", parts.flatMap((part) => part.items));
    const tree = writer.create(GEOGRAPHIC_ELEMENT, {
        GlobalId: tx.globalId(spec.id),
        Name: spec.name,
        ObjectPlacement: ref(placement),
        Representation: ref(writer.productShape([body])),
        ObjectType: spec.species,
        PredefinedType: enumValue("USERDEFINED"),
    });
    containIn(tx, writer, site, tree);
    dressParts(tx, writer, tree, parts, materials);
    return tree;
}
