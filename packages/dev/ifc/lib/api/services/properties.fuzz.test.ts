import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { IFCService } from "../ifc-service";
import type * as Inputs from "../inputs";
import type { IfcModel } from "../../model/model-types";
import { groundFloor } from "../../__test__/build-setup";

const SEED = 1215;
const RUNS = 120;
const ifc = new IFCService();
const TIME_STAMP = "2026-10-18T12:00:00";
const STOREYS = ["ground", "first", "second"];

type Value = string | number | boolean;

const text = fc.string({ unit: "grapheme", maxLength: 24 });
const value: fc.Arbitrary<Value> = fc.oneof(
    text,
    fc.boolean(),
    fc.integer({ min: -1_000_000, max: 1_000_000 }),
    fc.double({ noNaN: true, noDefaultInfinity: true }).filter((number) => !Object.is(number, -0)),
);
const properties = fc.uniqueArray(fc.tuple(fc.string({ unit: "grapheme", minLength: 1, maxLength: 16 }), value), { minLength: 1, maxLength: 6, selector: ([name]) => name });
const setName = fc.string({ unit: "grapheme", minLength: 1, maxLength: 20 });

function asProperties(pairs: readonly (readonly [string, Value])[]): Inputs.IFC.PropertyDto[] {
    return pairs.map(([name, held]) => ({ name, value: held }));
}

function rewritten(model: IfcModel): IfcModel {
    return ifc.model.read({ data: ifc.model.write({ model, timeStamp: TIME_STAMP }) });
}

function setsOf(model: IfcModel, element: string): Record<string, Record<string, Value>> {
    return Object.fromEntries(ifc.properties.getSets({ model, element }).map((set) => [set.name, set.properties]));
}

function sameValues(read: Record<string, Value> | undefined, written: readonly (readonly [string, Value])[]): boolean {
    return read !== undefined && Object.keys(read).length === written.length && written.every(([name, held]) => read[name] === held);
}

function storeyed(): IfcModel {
    const { model } = groundFloor("properties-fuzz");
    return STOREYS.slice(1).reduce((built, id, index) => ifc.spatial.addStorey({ model: built, id, elevation: (index + 1) * 3000 }), model);
}

describe("property sets of any names and values, written and read back", () => {
    const floors = storeyed();
    const walled = ifc.walls.add({ model: ifc.walls.add({ model: floors, storey: "ground", id: "a", start: [0, 0], end: [5000, 0] }), storey: "ground", id: "b", start: [0, 1000], end: [5000, 1000] });

    it("should read every property set back from the file it writes with the names and values it was given", () => {
        // Arrange
        const property = fc.property(setName, properties, (name, pairs) => {
            const model = ifc.properties.addSet({ model: walled, elements: ["a"], name, properties: asProperties(pairs) });
            return sameValues(setsOf(model, "a")[name], pairs) && sameValues(setsOf(rewritten(model), "a")[name], pairs);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });

    it("should give one object of a shared set its own copy when its values change, leaving the other's values as they were, in the file too", () => {
        // Arrange
        const property = fc.property(setName, properties, properties, (name, shared, changed) => {
            const model = ifc.properties.addSet({ model: walled, elements: ["a", "b"], name, properties: asProperties(shared) });
            const edited = rewritten(ifc.properties.setValues({ model, element: "a", name, properties: asProperties(changed) }));
            const expectedForA = new Map<string, Value>([...shared, ...changed]);
            const readA = setsOf(edited, "a")[name];
            return sameValues(setsOf(edited, "b")[name], shared)
                && readA !== undefined
                && Object.keys(readA).length === expectedForA.size
                && [...expectedForA].every(([key, held]) => readA[key] === held);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});

describe("a property set read from a file holding an empty text", () => {
    it("should write back the values it reads from a file, an empty text included, when they are set again", () => {
        // Arrange
        const { model: floor } = groundFloor("empty-text");
        const walled = ifc.walls.add({ model: floor, storey: "ground", id: "a", start: [0, 0], end: [5000, 0] });
        const written = ifc.model.write({ model: ifc.properties.addSet({ model: walled, elements: ["a"], name: "Data", properties: [{ name: "Reference", value: "placeholder" }] }), timeStamp: TIME_STAMP });
        const read = ifc.model.read({ data: written.replace("IFCLABEL('placeholder')", "IFCLABEL('')") });
        const values = setsOf(read, "a")["Data"]!;

        // Act
        const setAgain = (): IfcModel => ifc.properties.setValues({ model: read, element: "a", name: "Data", properties: asProperties(Object.entries(values)) });

        // Assert
        expect(values).toEqual({ Reference: "" });
        expect(setsOf(setAgain(), "a")["Data"]).toEqual({ Reference: "" });
    });
});

describe("elements contained in storeys, written and read back", () => {
    const floors = storeyed();
    const placement = fc.record({ kind: fc.constantFrom("wall", "column", "slab", "beam"), storey: fc.constantFrom(...STOREYS), x: fc.double({ min: -1e5, max: 1e5, noNaN: true }), y: fc.double({ min: -1e5, max: 1e5, noNaN: true }) });

    function withElements(placements: readonly { kind: string; storey: string; x: number; y: number }[]): IfcModel {
        return placements.reduce((model, { kind, storey, x, y }, index) => {
            const id = `element-${index}`;
            if (kind === "wall") {
                return ifc.walls.add({ model, storey, id, start: [x, y], end: [x + 3000, y] });
            }
            if (kind === "column") {
                return ifc.columns.add({ model, storey, id, position: [x, y] });
            }
            if (kind === "slab") {
                return ifc.slabs.add({ model, storey, id, outline: [[x, y], [x + 2000, y], [x + 2000, y + 1000], [x, y + 1000]] });
            }
            return ifc.beams.add({ model, storey, id, start: [x, y, 2800], end: [x + 4000, y, 2800] });
        }, floors);
    }

    it("should list every element on the storey it was added to, the same before and after the file is written and read", () => {
        // Arrange
        const property = fc.property(fc.array(placement, { minLength: 1, maxLength: 8 }), (placements) => {
            const model = withElements(placements);
            const storeyOf = (key: string): string => ifc.model.element({ model, element: key }).globalId;
            const listed = ifc.model.elements({ model });
            const byId = (list: Inputs.IFC.ElementInfoDto[]): string => JSON.stringify([...list].sort((a, b) => a.globalId.localeCompare(b.globalId)));
            return placements.every((drawn, index) => ifc.model.element({ model, element: `element-${index}` }).storey === storeyOf(drawn.storey))
                && byId(ifc.model.elements({ model: rewritten(model) })) === byId(listed);
        });

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});
