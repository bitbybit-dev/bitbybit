import { ORIGIN, transforms, type Occt, type Point3, type Shape, type Transform } from "./kernel";
import type { FinishId, MaterialId } from "./materials";
import * as parts from "./parts";
import { ARM_TOP, CANOPY_TOP, FRAME, GROUND_LIFT, MOTOR_TOP, PLATE_TOP, TOP_PLATE_TOP, armRootWidth } from "./parts";

export type ArmCount = 4 | 6 | 8;

export interface DroneParams {
    arms: ArmCount;
    armLength: number;
    propDiameter: number;
    finish: FinishId;
}

export type PartId =
    | "plate" | "canopy" | "hatch" | "emblem" | "honeycomb" | "standoff" | "bolt-m3x8" | "bolt-m3x12" | "bolt-m3x16"
    | "arm" | "motor" | "stator" | "propeller-cw" | "propeller-ccw" | "nut" | "led"
    | "leg" | "damper" | "spring" | "foot" | "gimbal" | "camera" | "lens" | "battery" | "strap" | "gps" | "antenna";

export interface Part {
    id: PartId;

    key: string;
    name: string;
    material: MaterialId;

    kind: "solid" | "wires";
    shape: Shape;
}

export interface ModuleNode {
    kind: "module";
    id: string;
    name: string;
    parentId?: string;
    placement: Transform;
}

export interface DefinitionNode {
    kind: "definition";
    id: string;
    name: string;
}

export interface ReferenceNode {
    kind: "reference";
    id: string;
    name: string;
    parentId: string;
    definitionId: string;
    placement: Transform;
}

export interface InstanceNode {
    kind: "instance";
    id: string;
    name: string;
    parentId: string;
    partId: PartId;
    placement: Transform;

    material?: MaterialId;
}

export type Node = ModuleNode | DefinitionNode | ReferenceNode | InstanceNode;

export interface Layout {
    params: DroneParams;
    nodes: Node[];
    lift: number;

    counts: { instances: number; bolts: number; modules: number; definitions: number; references: number };
}

export interface DroneModel extends Layout {
    parts: Part[];
}

export const UNITS = "mm";

export const ARM_COUNTS: ArmCount[] = [4, 6, 8];

export const LIMITS = {
    armLength: { min: 120, max: 260, step: 5 },
    propDiameter: { min: 100, max: 300, step: 5 },
} as const;

export const TIP_CLEARANCE = 10;

export const FLIGHT_CEILING = 90;

const CANOPY_REACH = 58;

export const defaultParams: DroneParams = { arms: 4, armLength: 185, propDiameter: 230, finish: "midnight" };

export function armAngles(arms: ArmCount): number[] {
    return Array.from({ length: arms }, (_, i) => (360 / arms) * i + 180 / arms);
}

export function maxPropDiameter(arms: ArmCount, armLength: number): number {
    const neighbours = 2 * armLength * Math.sin(Math.PI / arms) - TIP_CLEARANCE;
    const canopy = 2 * (armLength - CANOPY_REACH - TIP_CLEARANCE);
    return Math.floor(Math.min(neighbours, canopy) / LIMITS.propDiameter.step) * LIMITS.propDiameter.step;
}

export function clampParams(params: DroneParams): DroneParams {
    const clamp = (value: number, limit: { min: number; max: number }): number => Math.min(Math.max(value, limit.min), limit.max);
    const arms = ARM_COUNTS.includes(params.arms) ? params.arms : 4;
    const armLength = clamp(params.armLength, LIMITS.armLength);
    const propDiameter = Math.min(clamp(params.propDiameter, LIMITS.propDiameter), maxPropDiameter(arms, armLength));
    return { ...params, arms, armLength, propDiameter };
}

const direction = (angle: number): Point3 => [Math.cos((angle * Math.PI) / 180), 0, -Math.sin((angle * Math.PI) / 180)];

const onRing = (radius: number, angle: number, y: number): Point3 => {
    const d = direction(angle);
    return [radius * d[0], y, radius * d[2]];
};

const DOWN = transforms.rotationCenterX({ center: ORIGIN, angle: 180 });

export function layout(input: DroneParams, withEmblem = true): Layout {
    const params = clampParams(input);
    const { arms, armLength } = params;
    const lift: Point3 = [0, GROUND_LIFT, 0];
    const nodes: Node[] = [];
    const move = (to: Point3): Transform => transforms.translationXYZ({ translation: to });
    const turnX = (angle: number): Transform => transforms.rotationCenterX({ center: ORIGIN, angle });
    const turnY = (angle: number): Transform => transforms.rotationCenterY({ center: ORIGIN, angle });
    const placed = (at: Point3, rotation: Transform): Transform => [...rotation, ...move(at)];
    const module = (id: string, name: string, placement: Transform): void => { nodes.push({ kind: "module", id, name, placement }); };
    const definition = (id: string, name: string): void => { nodes.push({ kind: "definition", id, name }); };
    const reference = (parentId: string, id: string, name: string, definitionId: string, placement: Transform): void => { nodes.push({ kind: "reference", id, name, parentId, definitionId, placement }); };
    const instance = (parentId: string, id: string, name: string, partId: PartId, placement: Transform, material?: MaterialId): void => {
        nodes.push(material ? { kind: "instance", id, name, parentId, partId, placement, material } : { kind: "instance", id, name, parentId, partId, placement });
    };
    const angles = armAngles(arms);

    module("airframe", "Airframe", move(lift));
    instance("airframe", "plate-bottom", "Bottom plate", "plate", move([0, 0, 0]));
    instance("airframe", "plate-top", "Top plate", "plate", move([0, ARM_TOP, 0]));
    instance("airframe", "canopy", "Canopy", "canopy", move([0, TOP_PLATE_TOP, 0]));
    instance("airframe", "honeycomb", "Canopy honeycomb", "honeycomb", move([0, TOP_PLATE_TOP, 0]));
    instance("airframe", "hatch", "Hatch", "hatch", move([0, CANOPY_TOP, FRAME.canopy.hatchForward]));
    if (withEmblem) instance("airframe", "emblem", "Emblem", "emblem", move([0, CANOPY_TOP, FRAME.canopy.hatchForward]));
    instance("airframe", "gps", "GPS", "gps", move([0, TOP_PLATE_TOP, -FRAME.plate.length / 2 + 5]));
    instance("airframe", "antenna-1", "Antenna 1", "antenna", placed([-14, 0, -FRAME.plate.length / 2 + 8], turnX(225)));
    instance("airframe", "antenna-2", "Antenna 2", "antenna", placed([14, 0, -FRAME.plate.length / 2 + 8], turnX(225)));
    angles.forEach((angle, i) => {
        const between = angle + 180 / arms;
        instance("airframe", `standoff-${i + 1}`, `Standoff ${i + 1}`, "standoff", move(onRing(FRAME.standoff.ring, between, PLATE_TOP)));
        instance("airframe", `standoff-${i + 1}-top-bolt`, `Standoff ${i + 1} top bolt`, "bolt-m3x8", placed(onRing(FRAME.standoff.ring, between, TOP_PLATE_TOP), DOWN));
        instance("airframe", `standoff-${i + 1}-bottom-bolt`, `Standoff ${i + 1} bottom bolt`, "bolt-m3x8", move(onRing(FRAME.standoff.ring, between, 0)));
    });

    angles.forEach((angle, i) => {
        const n = i + 1;
        const id = `arm-${n}`;
        module(id, `Arm ${n}`, placed(lift, turnY(angle)));
        instance(id, `${id}-tube`, `Arm ${n} tube`, "arm", move([0, 0, 0]));
        instance(id, `${id}-clamp-bolt-1`, `Arm ${n} clamp bolt 1`, "bolt-m3x16", placed([FRAME.armRoot + 6, TOP_PLATE_TOP, 0], DOWN));
        instance(id, `${id}-clamp-bolt-2`, `Arm ${n} clamp bolt 2`, "bolt-m3x16", placed([FRAME.armRoot + 16, TOP_PLATE_TOP, 0], DOWN));
        instance(id, `${id}-motor`, `Arm ${n} motor`, "motor", move([armLength, ARM_TOP, 0]));
        instance(id, `${id}-stator`, `Arm ${n} stator`, "stator", move([armLength, ARM_TOP, 0]));
        for (let k = 0; k < 4; k++) {
            const a = ((45 + 90 * k) * Math.PI) / 180;
            instance(id, `${id}-motor-bolt-${k + 1}`, `Arm ${n} motor bolt ${k + 1}`, "bolt-m3x12", move([armLength + FRAME.motor.boltCircle * Math.cos(a), PLATE_TOP, FRAME.motor.boltCircle * Math.sin(a)]));
        }
        const front = direction(angle)[2] > 0;
        const handed = i % 2 === 0 ? "propeller-cw" : "propeller-ccw";
        instance(id, `${id}-propeller`, `Arm ${n} propeller`, handed, placed([armLength, MOTOR_TOP - 6 + FRAME.propeller.hubBelow, 0], turnY(i * 37)));
        instance(id, `${id}-nut`, `Arm ${n} propeller nut`, "nut", move([armLength, MOTOR_TOP - 6 + FRAME.propeller.hubBelow + FRAME.propeller.hubAbove, 0]));
        instance(id, `${id}-led`, `Arm ${n} LED`, "led", move([armLength - 24, PLATE_TOP, 0]), front ? "ledGreen" : "ledRed");
    });

    definition("leg", "Leg");
    instance("leg", "leg-tube", "Leg tube", "leg", move([0, 0, 0]));
    instance("leg", "leg-damper", "Damper", "damper", move([FRAME.leg.reach, -FRAME.leg.drop, 0]));
    instance("leg", "leg-spring", "Damper spring", "spring", move([FRAME.leg.reach, -FRAME.leg.drop, 0]));
    instance("leg", "leg-foot", "Foot", "foot", move([FRAME.leg.reach, -FRAME.leg.drop - FRAME.damper.length, 0]));
    instance("leg", "leg-bolt-1", "Leg bolt 1", "bolt-m3x8", move([-FRAME.leg.boltOffset, -3, 0]));
    instance("leg", "leg-bolt-2", "Leg bolt 2", "bolt-m3x8", move([FRAME.leg.boltOffset, -3, 0]));
    module("gear", "Landing gear", move(lift));
    [45, 135, 225, 315].forEach((angle, i) => {
        reference("gear", `leg-${i + 1}`, `Leg ${i + 1}`, "leg", placed(onRing(FRAME.leg.ring, angle, 0), turnY(angle)));
    });

    module("payload", "Payload", move(lift));
    instance("payload", "gimbal", "Gimbal", "gimbal", move([0, -26, 55]));
    instance("payload", "camera", "Camera", "camera", move([0, -26, 55]));
    instance("payload", "lens", "Lens", "lens", move([0, -26, 55]));
    instance("payload", "battery", "Battery", "battery", move([0, -16, -20]));
    instance("payload", "strap-1", "Battery strap 1", "strap", move([0, -16, -42]));
    instance("payload", "strap-2", "Battery strap 2", "strap", move([0, -16, 2]));

    const references = new Map<string, number>();
    for (const node of nodes) if (node.kind === "reference") references.set(node.definitionId, (references.get(node.definitionId) ?? 0) + 1);
    const definitionIds = new Set(nodes.filter((node) => node.kind === "definition").map((node) => node.id));
    const times = (node: InstanceNode): number => (definitionIds.has(node.parentId) ? references.get(node.parentId) ?? 0 : 1);
    const instances = nodes.filter((node): node is InstanceNode => node.kind === "instance");
    return {
        params,
        nodes,
        lift: GROUND_LIFT,
        counts: {
            instances: instances.reduce((sum, node) => sum + times(node), 0),
            bolts: instances.filter((node) => node.partId.startsWith("bolt")).reduce((sum, node) => sum + times(node), 0),
            modules: nodes.filter((node) => node.kind === "module").length,
            definitions: definitionIds.size,
            references: nodes.filter((node) => node.kind === "reference").length,
        },
    };
}

export function partOf(parts: Part[], id: PartId): Part {
    const part = parts.find((candidate) => candidate.id === id);
    if (!part) throw new Error(`the ${id} part has not been built`);
    return part;
}

interface PartSpec {
    id: PartId;
    material: MaterialId;
    kind: Part["kind"];
    name: (params: DroneParams) => string;
    key: (params: DroneParams) => string;
    build: (occt: Occt, params: DroneParams, logo: Shape | undefined, built: Part[]) => Promise<Shape>;
}

const fixed = (id: PartId, name: string, material: MaterialId, build: (occt: Occt) => Promise<Shape>, kind: Part["kind"] = "solid"): PartSpec => ({ id, material, kind, name: () => name, key: () => id, build: (occt) => build(occt) });

const SPECS: PartSpec[] = [
    fixed("plate", "Carbon plate", "carbon", parts.plate),
    fixed("canopy", "Canopy", "paint", parts.canopy),
    fixed("honeycomb", "Canopy honeycomb", "paint", parts.honeycomb, "wires"),
    { id: "hatch", material: "paint", kind: "solid", name: () => "Hatch", key: () => "hatch", build: (occt, _p, logo) => parts.hatch(occt, logo) },
    fixed("standoff", "Standoff M3x10", "accent", parts.standoff),
    fixed("bolt-m3x8", "Bolt M3x8", "steel", (occt) => parts.bolt(occt, 8)),
    fixed("bolt-m3x12", "Bolt M3x12", "steel", (occt) => parts.bolt(occt, 12)),
    fixed("bolt-m3x16", "Bolt M3x16", "steel", (occt) => parts.bolt(occt, 16)),
    { id: "arm", material: "carbon", kind: "solid", name: (p) => `Arm ${p.armLength} mm`, key: (p) => `arm:${p.armLength}:${p.arms}`, build: (occt, p) => parts.arm(occt, p.armLength, armRootWidth(p.arms)) },
    fixed("motor", "Motor 2806", "aluminium", parts.motor),
    fixed("stator", "Stator", "copper", parts.stator),
    { id: "propeller-cw", material: "accent", kind: "solid", name: (p) => `Propeller ${p.propDiameter} mm CW`, key: (p) => `propeller-cw:${p.propDiameter}`, build: (occt, p) => parts.propeller(occt, p.propDiameter) },
    { id: "propeller-ccw", material: "accent", kind: "solid", name: (p) => `Propeller ${p.propDiameter} mm CCW`, key: (p) => `propeller-ccw:${p.propDiameter}`, build: (occt, _p, _logo, built) => parts.mirrored(occt, partOf(built, "propeller-cw").shape) },
    fixed("nut", "Propeller nut M5", "aluminium", parts.nut),
    fixed("led", "LED", "ledGreen", parts.led),
    fixed("leg", "Landing leg", "carbon", parts.leg),
    fixed("damper", "Landing damper", "aluminium", parts.damper),
    fixed("spring", "Damper spring", "steel", parts.spring),
    fixed("foot", "Rubber foot", "rubber", parts.foot),
    fixed("gimbal", "Gimbal", "aluminium", parts.gimbal),
    fixed("camera", "Camera", "polymer", parts.camera),
    fixed("lens", "Lens", "glass", parts.lens),
    fixed("battery", "Battery 4S", "polymer", parts.battery),
    fixed("strap", "Battery strap", "accent", parts.strap),
    fixed("gps", "GPS", "polymer", parts.gps),
    fixed("antenna", "Antenna", "rubber", parts.antenna),
];

export async function buildParts(occt: Occt, params: DroneParams, logo?: Shape, previous: Part[] = []): Promise<Part[]> {
    const built: Part[] = [];
    for (const spec of SPECS) {
        const key = spec.id === "hatch" ? (logo ? "hatch:logo" : "hatch:plain") : spec.key(params);
        const kept = previous.find((part) => part.id === spec.id && part.key === key);
        built.push(kept ?? { id: spec.id, key, name: spec.name(params), material: spec.material, kind: spec.kind, shape: await spec.build(occt, params, logo, built) });
    }
    if (logo) {
        const kept = previous.find((part) => part.id === "emblem");
        built.push(kept ?? { id: "emblem", key: "emblem", name: "Emblem", material: "emblem", kind: "solid", shape: await parts.emblem(occt, logo, FRAME.emblem.width, FRAME.emblem.thickness) });
    }
    return built;
}

export async function buildModel(occt: Occt, input: DroneParams, logo?: Shape, previous?: DroneModel): Promise<DroneModel> {
    const params = clampParams(input);
    const built = await buildParts(occt, params, logo, previous?.parts);
    return { ...layout(params, logo !== undefined), parts: built };
}
