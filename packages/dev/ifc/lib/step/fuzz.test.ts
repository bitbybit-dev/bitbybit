import { checkRecipe } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { mutated, randomReal, randomText, randomValue, seeded, spelledList, spelledReal, spelledText, whole } from "../__test__/fuzz";
import { OTHER_TOOL_FILE } from "../__test__/other-tool-file";
import { decodeArgumentText } from "../__test__/step-text";
import { IFCService } from "../api/ifc-service";
import { lengthTolerance } from "../api/services/service-support";
import { readModel } from "../model/io";
import type { ModelSnapshot } from "../model/snapshot";
import { IfcValueError, StepSyntaxError } from "./errors";
import { formatReal } from "./numbers";
import { decodeArguments } from "./reader";
import { decodeString, encodeString } from "./strings";

const CASES = 400;
const MUTATIONS = 300;
const SEEDS = [1, 7, 2026];
const ifc = new IFCService();

function described(error: unknown): string {
    return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function decodedSpelling(text: string): unknown[] {
    const bytes = new TextEncoder().encode(text);
    return decodeArguments(bytes, 0, bytes.length, (name) => name.toUpperCase());
}

function fullyRead(bytes: Uint8Array): ModelSnapshot {
    const model = readModel(bytes);
    for (const id of model.ids()) {
        model.entity(id);
    }
    return model;
}

function refusalProblem(bytes: Uint8Array): string | undefined {
    try {
        fullyRead(bytes);
        return undefined;
    } catch (error) {
        if (!(error instanceof StepSyntaxError)) {
            return described(error);
        }
        return error.offset >= 0 && error.offset <= bytes.length ? undefined : `${error.message}, outside a file of ${bytes.length} bytes`;
    }
}

function isRefusal(error: unknown): boolean {
    return error instanceof StepSyntaxError || error instanceof IfcValueError || (error instanceof Error && error.constructor === Error);
}

function queryProblem(bytes: Uint8Array): string | undefined {
    let model: ModelSnapshot;
    try {
        model = fullyRead(bytes);
    } catch {
        return undefined;
    }
    try {
        ifc.model.elements({ model });
        ifc.spatial.storeys({ model });
        lengthTolerance(model);
    } catch (error) {
        return isRefusal(error) ? undefined : described(error);
    }
    try {
        const issues = checkRecipe(ifc.geometry.recipe({ model }));
        return issues.length ? `an invalid recipe: ${JSON.stringify(issues[0])}` : undefined;
    } catch (error) {
        return `the recipe of a model whose units it reads threw ${described(error)}`;
    }
}

function houseBytes(): Uint8Array {
    let model = ifc.model.create({ seed: "fuzz" });
    model = ifc.spatial.addStorey({ model, id: "ground", elevation: 0 });
    model = ifc.walls.add({ model, storey: "ground", id: "a", start: [0, 0], end: [5000, 0] });
    model = ifc.walls.add({ model, storey: "ground", id: "b", start: [5000, 0], end: [5000, 4000] });
    model = ifc.walls.connect({ model, wall: "a", other: "b" });
    model = ifc.doors.addType({ model, id: "door" });
    model = ifc.doors.add({ model, wall: "a", doorType: "door", offset: 1000 });
    model = ifc.properties.addSet({ model, elements: ["a"], name: "Data", properties: [{ name: "Note", value: "Ünïcödé 'quoted' \\ back" }] });
    return new TextEncoder().encode(ifc.model.write({ model, timeStamp: "2026-10-07T12:00:00" }));
}

function brokenFiles(seed: number): Uint8Array[] {
    const random = seeded(seed);
    const sources = [new TextEncoder().encode(OTHER_TOOL_FILE), houseBytes()];
    return Array.from({ length: MUTATIONS }, (_, index) => mutated(random, sources[index % sources.length]!));
}

describe("the reader against values spelled independently of the writer", () => {
    it.each(SEEDS)("should read every string back, however its characters are escaped (seed %i)", (seed) => {
        // Arrange
        const random = seeded(seed);
        const texts = Array.from({ length: CASES }, () => randomText(random));

        // Act
        const read = texts.map((text) => decodedSpelling(spelledText(random, text))[0]);

        // Assert
        expect(read).toEqual(texts);
    });

    it.each(SEEDS)("should read every real back as the same double, however it is spelled (seed %i)", (seed) => {
        // Arrange
        const random = seeded(seed);
        const reals = Array.from({ length: CASES }, () => randomReal(random));

        // Act
        const read = reals.map((real) => decodedSpelling(spelledReal(random, real))[0]);

        // Assert
        expect(read).toEqual(reals);
    });

    it.each(SEEDS)("should read nested arguments of every kind back, whatever their spacing, comments and letter case (seed %i)", (seed) => {
        // Arrange
        const random = seeded(seed);
        const argumentLists = Array.from({ length: CASES }, () => Array.from({ length: 1 + whole(random, 6) }, () => randomValue(random)));

        // Act
        const read = argumentLists.map((args) => decodedSpelling(spelledList(random, args)));

        // Assert
        expect(read).toEqual(argumentLists);
    });
});

describe("the reader against the writer's own encodings", () => {
    it.each(SEEDS)("should read back every string as the writer encodes it (seed %i)", (seed) => {
        // Arrange
        const random = seeded(seed);
        const texts = Array.from({ length: CASES }, () => randomText(random));

        // Act
        const read = texts.map((text) => decodeString(encodeString(text).slice(1, -1)));

        // Assert
        expect(read).toEqual(texts);
    });

    it.each(SEEDS)("should read back every real as the writer formats it (seed %i)", (seed) => {
        // Arrange
        const random = seeded(seed);
        const reals = Array.from({ length: CASES }, () => randomReal(random));

        // Act
        const read = reals.map((real) => decodeArgumentText(formatReal(real))[0]);

        // Assert
        expect(read).toEqual(reals);
    });
});

describe("the reader against broken files", () => {
    it.each(SEEDS)("should read a file with broken bytes or refuse it with a syntax error at a byte inside it, and nothing else (seed %i)", (seed) => {
        // Arrange
        const broken = brokenFiles(seed);

        // Act
        const unexpected = broken.map(refusalProblem).filter((problem) => problem !== undefined);

        // Assert
        expect(unexpected).toEqual([]);
    });

    it.each(SEEDS)("should list the elements and storeys of a broken file it reads or refuse with an error of its own, and describe it as a valid recipe once its units read (seed %i)", (seed) => {
        // Arrange
        const broken = brokenFiles(seed);

        // Act
        const unexpected = broken.map(queryProblem).filter((problem) => problem !== undefined);

        // Assert
        expect(unexpected).toEqual([]);
    });

    it("should refuse values nested deeper than its limit with a syntax error rather than overflow a stack", () => {
        // Arrange
        const depth = 200000;
        const text = `${"(".repeat(depth)}${")".repeat(depth)}`;

        // Act
        const error = ((): unknown => {
            try {
                decodeArgumentText(text);
                return undefined;
            } catch (thrown) {
                return thrown;
            }
        })();

        // Assert
        expect(error).toBeInstanceOf(StepSyntaxError);
    });
});
