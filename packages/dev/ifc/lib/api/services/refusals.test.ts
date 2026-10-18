import { describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import { IFCService } from "../ifc-service";
import type { IfcModel } from "../../model/model-types";
import { IfcValueError } from "../../step/errors";
import { errorFrom, groundFloor } from "../../__test__/build-setup";

const ifc = new IFCService();
const OUTLINE: Base.Point2[] = [[0, 0], [5000, 0], [5000, 4000], [0, 4000]];
const NOT_FINITE = [Infinity, -Infinity, Number.NaN];
const NOT_A_SIZE = [...NOT_FINITE, 0, -1];

interface Refusable {
    readonly input: string;
    readonly names: RegExp;
    readonly bad: readonly number[];
    readonly call: (value: number) => unknown;
}

function refusables(): Refusable[] {
    const { model: floor } = groundFloor("refusals");
    const walled = ifc.walls.add({ model: floor, storey: "ground", id: "wall", start: [0, 0], end: [5000, 0] });
    const columned: IfcModel = ifc.columns.add({ model: floor, storey: "ground", id: "column" });
    const opened = ifc.openings.add({ model: walled, wall: "wall", id: "opening" });
    const windowTyped = ifc.windows.addType({ model: walled, id: "window-type" });
    const doorTyped = ifc.doors.addType({ model: walled, id: "door-type" });
    return [
        { input: "walls.add height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.walls.add({ model: floor, storey: "ground", start: [0, 0], end: [5000, 0], height: value }) },
        { input: "walls.add thickness", names: /thickness/, bad: NOT_A_SIZE, call: (value) => ifc.walls.add({ model: floor, storey: "ground", start: [0, 0], end: [5000, 0], thickness: value }) },
        { input: "walls.add baseOffset", names: /base offset/, bad: NOT_FINITE, call: (value) => ifc.walls.add({ model: floor, storey: "ground", start: [0, 0], end: [5000, 0], baseOffset: value }) },
        { input: "walls.edit height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.walls.edit({ model: walled, wall: "wall", height: value }) },
        { input: "walls.edit thickness", names: /thickness/, bad: NOT_A_SIZE, call: (value) => ifc.walls.edit({ model: walled, wall: "wall", thickness: value }) },
        { input: "walls.edit baseOffset", names: /base offset/, bad: NOT_FINITE, call: (value) => ifc.walls.edit({ model: walled, wall: "wall", baseOffset: value }) },
        { input: "walls.clipByPlane origin", names: /origin/, bad: NOT_FINITE, call: (value) => ifc.walls.clipByPlane({ model: walled, wall: "wall", origin: [0, value, 2600] }) },
        { input: "slabs.add thickness", names: /thickness/, bad: NOT_A_SIZE, call: (value) => ifc.slabs.add({ model: floor, storey: "ground", outline: OUTLINE, thickness: value }) },
        { input: "slabs.add topOffset", names: /top offset/, bad: NOT_FINITE, call: (value) => ifc.slabs.add({ model: floor, storey: "ground", outline: OUTLINE, topOffset: value }) },
        { input: "spaces.add height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.spaces.add({ model: floor, storey: "ground", outline: OUTLINE, height: value }) },
        { input: "openings.add width", names: /width|along the wall/, bad: NOT_A_SIZE, call: (value) => ifc.openings.add({ model: walled, wall: "wall", width: value }) },
        { input: "openings.add height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.openings.add({ model: walled, wall: "wall", height: value }) },
        { input: "openings.add offset", names: /offset|along the wall/, bad: NOT_FINITE, call: (value) => ifc.openings.add({ model: walled, wall: "wall", offset: value }) },
        { input: "openings.add sill", names: /sill/, bad: NOT_FINITE, call: (value) => ifc.openings.add({ model: walled, wall: "wall", sill: value }) },
        { input: "openings.edit offset", names: /offset/, bad: NOT_FINITE, call: (value) => ifc.openings.edit({ model: opened, opening: "opening", offset: value }) },
        { input: "openings.edit sill", names: /sill/, bad: NOT_FINITE, call: (value) => ifc.openings.edit({ model: opened, opening: "opening", sill: value }) },
        { input: "openings.edit width", names: /width/, bad: NOT_A_SIZE, call: (value) => ifc.openings.edit({ model: opened, opening: "opening", width: value }) },
        { input: "openings.edit height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.openings.edit({ model: opened, opening: "opening", height: value }) },
        { input: "windows.add offset", names: /offset/, bad: NOT_FINITE, call: (value) => ifc.windows.add({ model: windowTyped, wall: "wall", windowType: "window-type", offset: value }) },
        { input: "windows.add sill", names: /sill/, bad: NOT_FINITE, call: (value) => ifc.windows.add({ model: windowTyped, wall: "wall", windowType: "window-type", sill: value }) },
        { input: "doors.add offset", names: /offset/, bad: NOT_FINITE, call: (value) => ifc.doors.add({ model: doorTyped, wall: "wall", doorType: "door-type", offset: value }) },
        { input: "doors.add sill", names: /sill/, bad: NOT_FINITE, call: (value) => ifc.doors.add({ model: doorTyped, wall: "wall", doorType: "door-type", sill: value }) },
        { input: "columns.add height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.columns.add({ model: floor, storey: "ground", height: value }) },
        { input: "columns.add baseOffset", names: /base offset/, bad: NOT_FINITE, call: (value) => ifc.columns.add({ model: floor, storey: "ground", baseOffset: value }) },
        { input: "columns.add width", names: /width/, bad: NOT_A_SIZE, call: (value) => ifc.columns.add({ model: floor, storey: "ground", width: value }) },
        { input: "beams.add depth", names: /depth/, bad: NOT_A_SIZE, call: (value) => ifc.beams.add({ model: floor, storey: "ground", start: [0, 0, 0], end: [1000, 0, 0], depth: value }) },
        { input: "roofs.add thickness", names: /thickness/, bad: NOT_A_SIZE, call: (value) => ifc.roofs.add({ model: floor, storey: "ground", outline: OUTLINE, thickness: value }) },
        { input: "roofs.add overhang", names: /overhang/, bad: NOT_FINITE, call: (value) => ifc.roofs.add({ model: floor, storey: "ground", outline: OUTLINE, overhang: value }) },
        { input: "roofs.add baseOffset", names: /base offset/, bad: NOT_FINITE, call: (value) => ifc.roofs.add({ model: floor, storey: "ground", outline: OUTLINE, baseOffset: value }) },
        { input: "spatial.addStorey elevation", names: /elevation/, bad: NOT_FINITE, call: (value) => ifc.spatial.addStorey({ model: floor, id: "upper", elevation: value }) },
        { input: "spatial.setElevation elevation", names: /elevation/, bad: NOT_FINITE, call: (value) => ifc.spatial.setElevation({ model: floor, storey: "ground", elevation: value }) },
        { input: "doors.addType width", names: /width/, bad: NOT_A_SIZE, call: (value) => ifc.doors.addType({ model: walled, id: "door", width: value }) },
        { input: "windows.addType height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.windows.addType({ model: walled, id: "window", height: value }) },
        { input: "model.move translation", names: /translation/, bad: NOT_FINITE, call: (value) => ifc.model.move({ model: columned, element: "column", translation: [value, 0, 0] }) },
        { input: "site.addTerrain depth", names: /depth/, bad: NOT_A_SIZE, call: (value) => ifc.site.addTerrain({ model: floor, outline: OUTLINE, depth: value }) },
        { input: "site.addTree height", names: /height/, bad: NOT_A_SIZE, call: (value) => ifc.site.addTree({ model: floor, position: [0, 0], height: value }) },
    ];
}

function unnamedRefusal(refusable: Refusable, value: number): string | undefined {
    const refusal = errorFrom(() => refusable.call(value));
    if (refusal instanceof IfcValueError || !refusable.names.test(refusal.message)) {
        return `${refusable.input} ${value}: ${refusal.name}: ${refusal.message}`;
    }
    return undefined;
}

describe("refusals of sizes and offsets that are not finite or not above zero", () => {
    it("should refuse every such size or offset of every verb naming the input, never with the encoder's error on an entity the caller never saw", () => {
        // Arrange
        const cases = refusables().flatMap((refusable) => refusable.bad.map((value) => ({ refusable, value })));

        // Act
        const unnamed = cases.map(({ refusable, value }) => unnamedRefusal(refusable, value)).filter((problem) => problem !== undefined);

        // Assert
        expect(unnamed).toEqual([]);
    });

    it.each([
        ["walls.add height", Infinity],
        ["walls.add baseOffset", Number.NaN],
        ["walls.edit height", Infinity],
        ["spaces.add height", Infinity],
        ["openings.add height", Infinity],
        ["openings.add offset", Number.NaN],
        ["openings.add sill", Number.NaN],
        ["site.addTerrain depth", Infinity],
        ["openings.edit offset", Number.NaN],
        ["openings.edit sill", Infinity],
        ["openings.edit height", Infinity],
        ["windows.add offset", Number.NaN],
        ["windows.add sill", Number.NaN],
        ["doors.add offset", Number.NaN],
    ])("should refuse %s of %d naming the input, as the other verbs do", (input, value) => {
        // Arrange
        const refusable = refusables().find((candidate) => candidate.input === input)!;

        // Act
        const unnamed = unnamedRefusal(refusable, value);

        // Assert
        expect(unnamed).toBeUndefined();
    });
});
