import type { Inputs } from "@bitbybit-dev/occt";

export type AsyncFunctionConstructor = new (...parameters: string[]) => (...values: unknown[]) => Promise<unknown>;

export type Pointer = Inputs.OCCT.TopoDSShapePointer;

export type CountedPointer = Pointer & { answers: number };
