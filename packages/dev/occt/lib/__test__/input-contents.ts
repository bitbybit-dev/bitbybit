import type { BitbybitOcctModule, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { KernelHandle } from "../../../__test__/embind-ledger-types";
import { isHandle, namesOf } from "./kernel-ledger";
import type { InputContents, KernelReading } from "./lifetime-cases-types";

const WITHOUT_TRIANGULATIONS = false;
const TSHAPES_SECTION = "\nTShapes ";
const FREE_MODIFIED_AND_CHECKED_THEN_THE_SHAPE_FLAGS = /\n\n[01]{3}([01]{4})\n/g;
const THE_SHAPE_FLAGS_ALONE = "\n\n...$1\n";
const FRACTIONS_ALONG_A_CURVE = [0, 0.25, 0.5, 0.75, 1];
const PARAMETERS_ON_AN_UNBOUNDED_CURVE = [-1, 0, 1];
const PARAMETERS_ACROSS_A_SURFACE = [0, 0.5, 1];
const COORDINATES = ["X", "Y", "Z"];
const PLACEMENT_PARTS = ["Location", "Direction", "XDirection", "YDirection"];
const CURVE_FLAGS = ["IsClosed", "IsPeriodic"];
const SURFACE_FLAGS = ["IsUClosed", "IsVClosed", "IsUPeriodic", "IsVPeriodic"];

const readingOf = (value: object, name: string): KernelReading | undefined => {
    const method: unknown = Reflect.get(value, name);
    return typeof method === "function" ? (...args: number[]): unknown => Reflect.apply(method, value, args) : undefined;
};

const readsAll = (value: object, names: readonly string[]): boolean => names.every(name => readingOf(value, name) !== undefined);

const valuesOf = (value: object, names: readonly string[]): string[] => names.flatMap(name => {
    const read = readingOf(value, name);
    return read === undefined ? [] : [`${name} ${String(read())}`];
});

const pointMadeFor = (made: unknown): string => {
    if (!isHandle(made)) {
        return String(made);
    }
    try {
        return valuesOf(made, COORDINATES).join(" ");
    } finally {
        made.delete();
    }
};

const shapeContent = (kernel: BitbybitOcctModule, shape: TopoDS_Shape): string => {
    if (shape.IsNull()) {
        return "a null shape";
    }
    const dump = kernel.WriteBREPToString(shape, WITHOUT_TRIANGULATIONS);
    const shapes = dump.indexOf(TSHAPES_SECTION);
    return `${dump.slice(0, shapes)}${dump.slice(shapes).replace(FREE_MODIFIED_AND_CHECKED_THEN_THE_SHAPE_FLAGS, THE_SHAPE_FLAGS_ALONE)}`;
};

const curveContent = (curve: object): string => {
    if (readingOf(curve, "IsNull")?.() === true) {
        return "a null curve";
    }
    const first = Number(readingOf(curve, "FirstParameter")?.());
    const last = Number(readingOf(curve, "LastParameter")?.());
    const value = readingOf(curve, "Value")!;
    const parameters = Number.isFinite(first) && Number.isFinite(last) ? FRACTIONS_ALONG_A_CURVE.map(fraction => first + (last - first) * fraction) : PARAMETERS_ON_AN_UNBOUNDED_CURVE;
    return [`from ${first} to ${last}`, ...valuesOf(curve, CURVE_FLAGS), ...parameters.map(parameter => pointMadeFor(value(parameter)))].join("\n");
};

const surfaceContent = (surface: object): string => {
    const value = readingOf(surface, "Value")!;
    const points = PARAMETERS_ACROSS_A_SURFACE.flatMap(u => PARAMETERS_ACROSS_A_SURFACE.map(v => pointMadeFor(value(u, v))));
    return [...valuesOf(surface, SURFACE_FLAGS), ...points].join("\n");
};

const placementContent = (value: object): string => [
    ...valuesOf(value, COORDINATES),
    ...PLACEMENT_PARTS.flatMap(name => {
        const read = readingOf(value, name);
        return read === undefined ? [] : [`${name} ${pointMadeFor(read())}`];
    }),
].join("\n");

export function contentOf(kernel: BitbybitOcctModule, handle: KernelHandle): string {
    if (handle instanceof kernel.TopoDS_Shape) {
        return shapeContent(kernel, handle);
    }
    if (readsAll(handle, ["Value", "FirstParameter", "LastParameter"])) {
        return curveContent(handle);
    }
    if (readsAll(handle, ["Value", ...SURFACE_FLAGS])) {
        return surfaceContent(handle);
    }
    if (readsAll(handle, ["X", "Y"]) || readsAll(handle, ["Location"])) {
        return placementContent(handle);
    }
    throw new Error(`the lifetime harness cannot read a ${namesOf([handle])[0]!}, so it cannot tell whether a call changed it`);
}

export function contentsOf(kernel: BitbybitOcctModule, handles: readonly KernelHandle[]): InputContents {
    return new Map(handles.map(handle => [handle, contentOf(kernel, handle)]));
}

export function changedSince(kernel: BitbybitOcctModule, contents: InputContents): KernelHandle[] {
    return [...contents].filter(([handle, content]) => !handle.isDeleted() && contentOf(kernel, handle) !== content).map(([handle]) => handle);
}
