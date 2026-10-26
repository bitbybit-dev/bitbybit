/** A line of a flat drawing, as the x and y of its points in the drawing's plane. */
export type DrawingLine = readonly (readonly [number, number])[];

export type SvgLength = { readonly unit: string; readonly factor: number };

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };
