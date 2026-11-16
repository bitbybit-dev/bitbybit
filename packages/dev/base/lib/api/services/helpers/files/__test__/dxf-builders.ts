export const dxfOf = (sections: readonly (readonly string[])[]): string =>
    [...sections.flatMap(([name, ...body]) => ["0", "SECTION", "2", name!, ...body, "0", "ENDSEC"]), "0", "EOF"].join("\n");

export const entitiesDxf = (...body: readonly (readonly string[])[]): string => dxfOf([["ENTITIES", ...body.flat()]]);

export const lineDxf = (x1: number, y1: number, x2: number, y2: number, layer = "0"): string[] =>
    ["0", "LINE", "8", layer, "10", String(x1), "20", String(y1), "11", String(x2), "21", String(y2)];

export const blockDxf = (name: string, ...body: readonly (readonly string[])[]): string[] =>
    ["0", "BLOCK", "8", "0", "2", name, "70", "0", "10", "0", "20", "0", "30", "0", ...body.flat(), "0", "ENDBLK"];

export const insertDxf = (name: string, columns = 1, rows = 1, extra: readonly string[] = []): string[] =>
    ["0", "INSERT", "8", "0", "2", name, "10", "0", "20", "0", "30", "0", "70", String(columns), "71", String(rows), "44", "2", "45", "2", ...extra];

export const lightPolylineDxf = (points: readonly (readonly number[])[], extra: readonly string[] = []): string[] =>
    ["0", "LWPOLYLINE", "8", "0", "90", String(points.length), "70", "0", ...extra, ...points.flatMap(([x, y, bulge]) => ["10", String(x), "20", String(y), ...(bulge === undefined ? [] : ["42", String(bulge)])])];

export const layerTableDxf = (...layers: readonly (readonly string[])[]): string[] =>
    ["TABLES", "0", "TABLE", "2", "LAYER", ...layers.flatMap(layer => ["0", "LAYER", ...layer]), "0", "ENDTAB"];

export const elapsedMs = (act: () => unknown): number => {
    const start = performance.now();
    act();
    return performance.now() - start;
};
