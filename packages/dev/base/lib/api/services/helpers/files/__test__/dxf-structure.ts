import { entitiesOf, headerVariable, numberOf, readDxf, recordsOf, tablesOf, valueOf, valuesOf } from "./dxf-reader";
import type { DxfFile, DxfRecord, DxfTable } from "./dxf-reader";

const R2000_SECTIONS = "HEADER,CLASSES,TABLES,BLOCKS,ENTITIES,OBJECTS";
const R12_SECTIONS = "HEADER,TABLES,BLOCKS,ENTITIES";
const R2000_TABLES = "VPORT,LTYPE,LAYER,STYLE,VIEW,UCS,APPID,DIMSTYLE,BLOCK_RECORD";
const R12_ENTITIES = new Set(["LINE", "ARC", "CIRCLE", "POLYLINE", "VERTEX", "SEQEND"]);
const STANDARD_LINE_TYPES = ["ByBlock", "ByLayer", "CONTINUOUS"];
const NO_RECORD: DxfRecord = { kind: "", pairs: [] };

const handlesOf = (file: DxfFile): string[] =>
    [...file.sections].filter(([name]) => name !== "HEADER").flatMap(([, pairs]) => pairs).filter(pair => pair.code === 5 || pair.code === 105).map(pair => pair.value);

const recordsOfTable = (tables: readonly DxfTable[], name: string): readonly DxfRecord[] => tables.find(table => table.name === name)?.records ?? [];

const tableProblems = (tables: readonly DxfTable[]): string[] => tables.flatMap(table => [
    ...(numberOf(table.head, 70) === table.records.length ? [] : [`${table.name} counts ${numberOf(table.head, 70)} of ${table.records.length}`]),
    ...(valueOf(table.head, 330) === "0" && valuesOf(table.head, 100).includes("AcDbSymbolTable") ? [] : [`${table.name} head`]),
    ...table.records
        .filter(record => valueOf(record, record.kind === "DIMSTYLE" ? 105 : 5) === undefined || valueOf(record, 330) !== valueOf(table.head, 5) || !valuesOf(record, 100).includes("AcDbSymbolTableRecord"))
        .map(record => `${table.name} record ${valueOf(record, 2)}`),
]);

const handleProblems = (file: DxfFile): string[] => {
    const handles = handlesOf(file);
    const seed = parseInt(headerVariable(file, "$HANDSEED")[0]?.value ?? "0", 16);
    const known = new Set(["0", ...handles]);
    return [
        ...(new Set(handles).size === handles.length && handles.every(handle => /^[0-9A-F]+$/.test(handle)) ? [] : ["handles"]),
        ...(handles.every(handle => parseInt(handle, 16) < seed) ? [] : ["handseed"]),
        ...file.pairs.filter(pair => (pair.code === 330 || pair.code === 350 || pair.code === 340) && !known.has(pair.value)).map(pair => `pointer ${pair.code} ${pair.value}`),
    ];
};

const ownerProblems = (file: DxfFile, tables: readonly DxfTable[]): string[] => {
    const records = recordsOfTable(tables, "BLOCK_RECORD");
    const modelSpace = records.find(record => valueOf(record, 2) === "*Model_Space") ?? NO_RECORD;
    const paperSpace = records.find(record => valueOf(record, 2) === "*Paper_Space") ?? NO_RECORD;
    const blocks = recordsOf(file.sections.get("BLOCKS") ?? []);
    const layers = new Set(recordsOfTable(tables, "LAYER").map(record => valueOf(record, 2)));
    const lineTypes = new Set(recordsOfTable(tables, "LTYPE").map(record => valueOf(record, 2)));
    return [
        ...[modelSpace, paperSpace]
            .filter(space => space === NO_RECORD || blocks.filter(block => valueOf(block, 330) === valueOf(space, 5)).map(block => block.kind).join(",") !== "BLOCK,ENDBLK")
            .map(() => "space blocks"),
        ...entitiesOf(file)
            .filter(entity => (valueOf(entity, 330) !== valueOf(modelSpace, 5) && entity.kind !== "VERTEX" && entity.kind !== "SEQEND") || !valuesOf(entity, 100).includes("AcDbEntity") || !layers.has(valueOf(entity, 8)))
            .map(entity => `entity ${entity.kind}`),
        ...entitiesOf(file).map(entity => valueOf(entity, 6)).filter(lineType => lineType !== undefined && !lineTypes.has(lineType)).map(lineType => `line type ${lineType}`),
        ...(STANDARD_LINE_TYPES.every(name => lineTypes.has(name)) && layers.has("0") ? [] : ["standard records"]),
    ];
};

const objectProblems = (file: DxfFile): string[] => {
    const objects = recordsOf(file.sections.get("OBJECTS") ?? []);
    const root = objects[0] ?? NO_RECORD;
    const groups = objects.find(object => valueOf(object, 5) === valueOf(root, 350));
    return root.kind === "DICTIONARY" && valueOf(root, 330) === "0" && valueOf(root, 3) === "ACAD_GROUP" && groups?.kind === "DICTIONARY" ? [] : ["objects"];
};

export const problemsOfR2000 = (text: string): string[] => {
    const file = readDxf(text);
    const tables = tablesOf(file);
    return [
        ...(file.sectionOrder.join(",") === R2000_SECTIONS ? [] : [`sections ${file.sectionOrder.join(",")}`]),
        ...(text.endsWith("0\nEOF\n") ? [] : ["no EOF"]),
        ...(tables.map(table => table.name).join(",") === R2000_TABLES ? [] : [`tables ${tables.map(table => table.name).join(",")}`]),
        ...tableProblems(tables),
        ...handleProblems(file),
        ...ownerProblems(file, tables),
        ...objectProblems(file),
    ];
};

export const problemsOfR12 = (text: string): string[] => {
    const file = readDxf(text);
    const kinds = entitiesOf(file).map(entity => entity.kind);
    return [
        ...(file.sectionOrder.join(",") === R12_SECTIONS ? [] : [`sections ${file.sectionOrder.join(",")}`]),
        ...(file.pairs.some(pair => pair.code === 5 || pair.code === 330 || pair.code === 100 || pair.code === 420) ? ["R2000 codes"] : []),
        ...kinds.filter(kind => !R12_ENTITIES.has(kind)).map(kind => `entity ${kind}`),
        ...(/POLYLINE,(?!VERTEX)|VERTEX,(?!VERTEX|SEQEND)/.test(`${kinds.join(",")},`) ? ["polyline sequence"] : []),
    ];
};
