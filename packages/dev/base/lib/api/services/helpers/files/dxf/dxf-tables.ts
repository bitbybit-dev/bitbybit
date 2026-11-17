import type * as Inputs from "../../../../inputs";
import type { DrawingBounds } from "../drawing/drawing-types";
import { LINE_TYPE_PATTERNS } from "../drawing/drawing.constants";
import { nearestAciIndex, trueColorOf } from "./dxf-colors";
import type { DxfText } from "./dxf-text";
import {
    DXF_GRID_SPACING_CODES, DXF_IMPERIAL_MEASUREMENT, DXF_INSUNITS, DXF_LENS_LENGTH, DXF_METRIC_MEASUREMENT, DXF_OTHER_POINT_CODES, DXF_POINT_CODES, DXF_SNAP_BASE_CODES,
    DXF_SNAP_SPACING_CODES, DXF_VIEW_ASPECT, DXF_VIEW_CENTER_CODES, DXF_VIEW_DIRECTION_CODES, DXF_VIEW_MARGIN, DXF_VIEW_TARGET_CODES,
} from "./dxf.constants";

export type DxfVersion = "AC1009" | "AC1015";

export interface DxfLayerRow {
    readonly name: string;
    readonly color: string;
    readonly lineType: Inputs.IO.lineTypeEnum;
}

export interface DxfLayout {
    readonly version: DxfVersion;
    readonly colorFormat: "aci" | "truecolor";
    readonly unit: string | undefined;
    readonly bounds: DrawingBounds | undefined;
    readonly layers: readonly DxfLayerRow[];
    readonly lineTypes: readonly Inputs.IO.lineTypeEnum[];
    readonly patternUnit: number;
}

export interface DxfOwners {
    readonly modelSpace: string;
    readonly paperSpace: string;
}

const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];

const isModern = (layout: DxfLayout): boolean => layout.version === "AC1015";

const variable = (text: DxfText, name: string): void => text.pair("9", name);

export const writeHeader = (text: DxfText, layout: DxfLayout): number | undefined => {
    text.pair("0", "SECTION");
    text.pair("2", "HEADER");
    variable(text, "$ACADVER");
    text.pair("1", layout.version);
    if (isModern(layout)) {
        variable(text, "$DWGCODEPAGE");
        text.pair("3", "ANSI_1252");
    }
    variable(text, "$INSBASE");
    text.point(DXF_POINT_CODES, ORIGIN);
    variable(text, "$EXTMIN");
    text.point(DXF_POINT_CODES, layout.bounds?.min ?? ORIGIN);
    variable(text, "$EXTMAX");
    text.point(DXF_POINT_CODES, layout.bounds?.max ?? ORIGIN);
    let handseed: number | undefined;
    if (isModern(layout)) {
        if (layout.unit !== undefined) {
            variable(text, "$INSUNITS");
            text.pair("70", DXF_INSUNITS[layout.unit]!);
            variable(text, "$MEASUREMENT");
            text.pair("70", layout.unit === "in" ? DXF_IMPERIAL_MEASUREMENT : DXF_METRIC_MEASUREMENT);
        }
        variable(text, "$HANDSEED");
        handseed = text.reserve("5");
    }
    text.pair("0", "ENDSEC");
    return handseed;
};

export const writeClasses = (text: DxfText, layout: DxfLayout): void => {
    if (isModern(layout)) {
        text.pair("0", "SECTION");
        text.pair("2", "CLASSES");
        text.pair("0", "ENDSEC");
    }
};

const openTable = (text: DxfText, layout: DxfLayout, name: string, count: number): string => {
    text.pair("0", "TABLE");
    text.pair("2", name);
    const handle = isModern(layout) ? text.nextHandle() : "";
    if (isModern(layout)) {
        text.pair("5", handle);
        text.pair("330", "0");
        text.pair("100", "AcDbSymbolTable");
    }
    text.pair("70", String(count));
    return handle;
};

const openRecord = (text: DxfText, layout: DxfLayout, kind: string, table: string, subclass: string, handleCode = "5"): string => {
    text.pair("0", kind);
    const handle = isModern(layout) ? text.nextHandle() : "";
    if (isModern(layout)) {
        text.pair(handleCode, handle);
        text.pair("330", table);
        text.pair("100", "AcDbSymbolTableRecord");
        text.pair("100", subclass);
    }
    return handle;
};

const closeTable = (text: DxfText): void => text.pair("0", "ENDTAB");

const writeViewports = (text: DxfText, layout: DxfLayout): void => {
    const table = openTable(text, layout, "VPORT", 1);
    openRecord(text, layout, "VPORT", table, "AcDbViewportTableRecord");
    const min = layout.bounds?.min ?? ORIGIN;
    const max = layout.bounds?.max ?? ORIGIN;
    const width = Math.max(max[0] - min[0], 1);
    const height = Math.max(max[1] - min[1], width / DXF_VIEW_ASPECT);
    text.pair("2", "*ACTIVE");
    text.pair("70", "0");
    text.point(DXF_POINT_CODES, ORIGIN);
    text.point(DXF_OTHER_POINT_CODES, [1, 1, 0]);
    text.point(DXF_VIEW_CENTER_CODES, [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, 0]);
    text.point(DXF_SNAP_BASE_CODES, ORIGIN);
    text.point(DXF_SNAP_SPACING_CODES, [1, 1, 0]);
    text.point(DXF_GRID_SPACING_CODES, [1, 1, 0]);
    text.point(DXF_VIEW_DIRECTION_CODES, [0, 0, 1]);
    text.point(DXF_VIEW_TARGET_CODES, ORIGIN);
    text.real("40", height * DXF_VIEW_MARGIN);
    text.real("41", DXF_VIEW_ASPECT);
    text.real("42", DXF_LENS_LENGTH);
    text.real("43", 0);
    text.real("44", 0);
    text.real("50", 0);
    text.real("51", 0);
    for (const [code, value] of [["71", "0"], ["72", "100"], ["73", "1"], ["74", "3"], ["75", "0"], ["76", "0"], ["77", "0"], ["78", "0"]] as const) {
        text.pair(code, value);
    }
    closeTable(text);
};

const writeLineTypeRecord = (text: DxfText, layout: DxfLayout, table: string, name: string, description: string, elements: readonly number[]): void => {
    openRecord(text, layout, "LTYPE", table, "AcDbLinetypeTableRecord");
    text.name("2", name);
    text.pair("70", "0");
    text.pair("3", description);
    text.pair("72", "65");
    text.pair("73", String(elements.length));
    text.real("40", elements.reduce((total, element) => total + Math.abs(element), 0) * layout.patternUnit);
    for (const element of elements) {
        text.real("49", element * layout.patternUnit);
        if (isModern(layout)) {
            text.pair("74", "0");
        }
    }
};

const writeLineTypes = (text: DxfText, layout: DxfLayout): void => {
    const extra = isModern(layout) ? ["ByBlock", "ByLayer"] : [];
    const table = openTable(text, layout, "LTYPE", extra.length + 1 + layout.lineTypes.length);
    for (const name of extra) {
        writeLineTypeRecord(text, layout, table, name, "", []);
    }
    writeLineTypeRecord(text, layout, table, LINE_TYPE_PATTERNS["continuous"]!.name, LINE_TYPE_PATTERNS["continuous"]!.description, []);
    for (const lineType of layout.lineTypes) {
        const pattern = LINE_TYPE_PATTERNS[lineType]!;
        writeLineTypeRecord(text, layout, table, pattern.name, pattern.description, pattern.elements);
    }
    closeTable(text);
};

const writeLayers = (text: DxfText, layout: DxfLayout): void => {
    const table = openTable(text, layout, "LAYER", layout.layers.length);
    for (const layer of layout.layers) {
        openRecord(text, layout, "LAYER", table, "AcDbLayerTableRecord");
        text.name("2", layer.name);
        text.pair("70", "0");
        text.pair("62", String(nearestAciIndex(layer.color)));
        if (isModern(layout) && layout.colorFormat === "truecolor") {
            text.pair("420", String(trueColorOf(layer.color)));
        }
        text.pair("6", LINE_TYPE_PATTERNS[layer.lineType]!.name);
        if (isModern(layout)) {
            text.pair("370", "-3");
        }
    }
    closeTable(text);
};

const writeStyles = (text: DxfText, layout: DxfLayout): void => {
    const table = openTable(text, layout, "STYLE", 1);
    openRecord(text, layout, "STYLE", table, "AcDbTextStyleTableRecord");
    for (const [code, value] of [["2", "Standard"], ["70", "0"], ["40", "0.0"], ["41", "1.0"], ["50", "0.0"], ["71", "0"], ["42", "2.5"], ["3", "txt"], ["4", ""]] as const) {
        text.pair(code, value);
    }
    closeTable(text);
};

const writeEmptyTable = (text: DxfText, layout: DxfLayout, name: string): void => {
    openTable(text, layout, name, 0);
    closeTable(text);
};

const writeApplications = (text: DxfText, layout: DxfLayout): void => {
    const table = openTable(text, layout, "APPID", 1);
    openRecord(text, layout, "APPID", table, "AcDbRegAppTableRecord");
    text.pair("2", "ACAD");
    text.pair("70", "0");
    closeTable(text);
};

const writeDimensionStyles = (text: DxfText, layout: DxfLayout): void => {
    const table = openTable(text, layout, "DIMSTYLE", 1);
    if (isModern(layout)) {
        text.pair("100", "AcDbDimStyleTable");
        text.pair("71", "1");
        text.pair("340", text.peekHandle());
    }
    openRecord(text, layout, "DIMSTYLE", table, "AcDbDimStyleTableRecord", "105");
    text.pair("2", "Standard");
    text.pair("70", "0");
    closeTable(text);
};

const writeBlockRecords = (text: DxfText, layout: DxfLayout): DxfOwners => {
    const table = openTable(text, layout, "BLOCK_RECORD", 2);
    const modelSpace = openRecord(text, layout, "BLOCK_RECORD", table, "AcDbBlockTableRecord");
    text.pair("2", "*Model_Space");
    const paperSpace = openRecord(text, layout, "BLOCK_RECORD", table, "AcDbBlockTableRecord");
    text.pair("2", "*Paper_Space");
    closeTable(text);
    return { modelSpace, paperSpace };
};

export const writeTables = (text: DxfText, layout: DxfLayout): DxfOwners => {
    text.pair("0", "SECTION");
    text.pair("2", "TABLES");
    writeViewports(text, layout);
    writeLineTypes(text, layout);
    writeLayers(text, layout);
    writeStyles(text, layout);
    writeEmptyTable(text, layout, "VIEW");
    writeEmptyTable(text, layout, "UCS");
    writeApplications(text, layout);
    writeDimensionStyles(text, layout);
    const owners = isModern(layout) ? writeBlockRecords(text, layout) : { modelSpace: "", paperSpace: "" };
    text.pair("0", "ENDSEC");
    return owners;
};

const writeBlock = (text: DxfText, owner: string, name: string, paper: boolean): void => {
    text.pair("0", "BLOCK");
    text.pair("5", text.nextHandle());
    text.pair("330", owner);
    text.pair("100", "AcDbEntity");
    if (paper) {
        text.pair("67", "1");
    }
    text.pair("8", "0");
    text.pair("100", "AcDbBlockBegin");
    text.pair("2", name);
    text.pair("70", "0");
    text.point(DXF_POINT_CODES, ORIGIN);
    text.pair("3", name);
    text.pair("1", "");
    text.pair("0", "ENDBLK");
    text.pair("5", text.nextHandle());
    text.pair("330", owner);
    text.pair("100", "AcDbEntity");
    if (paper) {
        text.pair("67", "1");
    }
    text.pair("8", "0");
    text.pair("100", "AcDbBlockEnd");
};

export const writeBlocks = (text: DxfText, layout: DxfLayout, owners: DxfOwners): void => {
    text.pair("0", "SECTION");
    text.pair("2", "BLOCKS");
    if (isModern(layout)) {
        writeBlock(text, owners.modelSpace, "*Model_Space", false);
        writeBlock(text, owners.paperSpace, "*Paper_Space", true);
    }
    text.pair("0", "ENDSEC");
};

export const writeObjects = (text: DxfText, layout: DxfLayout): void => {
    if (!isModern(layout)) {
        return;
    }
    const root = text.nextHandle();
    const groups = text.nextHandle();
    text.pair("0", "SECTION");
    text.pair("2", "OBJECTS");
    for (const [code, value] of [["0", "DICTIONARY"], ["5", root], ["330", "0"], ["100", "AcDbDictionary"], ["281", "1"], ["3", "ACAD_GROUP"], ["350", groups]] as const) {
        text.pair(code, value);
    }
    for (const [code, value] of [["0", "DICTIONARY"], ["5", groups], ["330", root], ["100", "AcDbDictionary"], ["281", "1"]] as const) {
        text.pair(code, value);
    }
    text.pair("0", "ENDSEC");
};
