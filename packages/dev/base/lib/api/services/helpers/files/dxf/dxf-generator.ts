import * as Inputs from "../../../../inputs";
import type * as Resolved from "../../../../resolved-inputs";
import { InputError } from "../../../../kernel-calls";
import { checkedUnitOfLength } from "../../geometry/lengths";
import { drawingBounds, drawingSize, patternUnitOf } from "../drawing/drawing-geometry";
import { writerBudgetOf } from "../drawing/drawing-budget";
import { drawingPartsOf, positiveNumber } from "../drawing/drawing-model";
import type { DrawingPart } from "../drawing/drawing-types";
import { DEFAULT_LAYER, LEAST_TOLERANCE_SHARE, SPACE_AXES } from "../drawing/drawing.constants";
import { writeSegment } from "./dxf-entities";
import type { DxfEntityStyle } from "./dxf-entities";
import { writeBlocks, writeClasses, writeHeader, writeObjects, writeTables } from "./dxf-tables";
import type { DxfLayerRow, DxfLayout, DxfVersion } from "./dxf-tables";
import { DxfText } from "./dxf-text";
import { DXF_FIRST_HANDLE } from "./dxf.constants";

const VERSIONS = new Set<string>(["AC1009", "AC1015"]);
const COLOR_FORMATS = new Set<string>(["aci", "truecolor"]);

const layersOf = (parts: readonly DrawingPart[]): Map<string, DxfLayerRow> => {
    const rows = new Map<string, DxfLayerRow>([[DEFAULT_LAYER, { name: DEFAULT_LAYER, color: "#ffffff", lineType: Inputs.IO.lineTypeEnum.continuous }]]);
    let zeroTaken = false;
    for (const part of parts) {
        const key = part.layer.toUpperCase();
        if (!rows.has(key) || (key === DEFAULT_LAYER && !zeroTaken)) {
            rows.set(key, { name: part.layer, color: part.color, lineType: part.lineType });
        }
        zeroTaken = zeroTaken || key === DEFAULT_LAYER;
    }
    return rows;
};

const entityStyleOf = (part: DrawingPart, layers: ReadonlyMap<string, DxfLayerRow>): DxfEntityStyle => {
    const continuous = Inputs.IO.lineTypeEnum.continuous;
    const byLayer = part.lineType === continuous && layers.get(part.layer.toUpperCase())!.lineType === continuous;
    return { layer: part.layer, color: part.color, lineType: byLayer ? undefined : part.lineType };
};

const lineTypesOf = (parts: readonly DrawingPart[]): Inputs.IO.lineTypeEnum[] =>
    [...new Set(parts.map(part => part.lineType))].filter(lineType => lineType !== Inputs.IO.lineTypeEnum.continuous);

const versionOf = (value: unknown): DxfVersion => {
    if (typeof value !== "string" || !VERSIONS.has(value)) {
        throw new InputError("`acadVersion` must be AC1009 or AC1015.", "acadVersion");
    }
    return value as DxfVersion;
};

const colorFormatOf = (value: unknown): "aci" | "truecolor" => {
    if (typeof value !== "string" || !COLOR_FORMATS.has(value)) {
        throw new InputError("`colorFormat` must be aci or truecolor.", "colorFormat");
    }
    return value as "aci" | "truecolor";
};

const unitOf = (value: Inputs.Base.unitOfLengthEnum | undefined, version: DxfVersion): string | undefined => {
    if (value === undefined) {
        return undefined;
    }
    const unit = checkedUnitOfLength(value, "unit");
    if (version === "AC1009") {
        throw new InputError("`unit` is given, but an AC1009 (R12) file has no place for a drawing's unit: write AC1015 to state it.", "unit");
    }
    return unit;
};

export class DxfGenerator {

    generateDxf(model: Resolved.IO.DxfModelDto): string {
        const version = versionOf(model.acadVersion);
        const colorFormat = colorFormatOf(model.colorFormat);
        const unit = unitOf(model.unit, version);
        const givenTolerance = positiveNumber(model.curveTolerance, "curveTolerance");
        const parts = drawingPartsOf(model.dxfPathsParts, "dxfPathsParts");
        const text = new DxfText(DXF_FIRST_HANDLE, { budget: writerBudgetOf(parts), property: "dxfPathsParts" });
        const bounds = drawingBounds(parts, givenTolerance, text.budget);
        text.refuseWhenSpent();
        const curveTolerance = Math.max(givenTolerance, LEAST_TOLERANCE_SHARE * drawingSize(bounds, SPACE_AXES));
        const layers = layersOf(parts);
        const layout: DxfLayout = { version, colorFormat, unit, bounds, layers: [...layers.values()], lineTypes: lineTypesOf(parts), patternUnit: patternUnitOf(bounds) };
        const handseed = writeHeader(text, layout);
        writeClasses(text, layout);
        const owners = writeTables(text, layout);
        writeBlocks(text, layout, owners);
        text.pair("0", "SECTION");
        text.pair("2", "ENTITIES");
        const context = { text, version, owner: owners.modelSpace, colorFormat, curveTolerance };
        for (const part of parts) {
            const style = entityStyleOf(part, layers);
            for (const path of part.paths) {
                for (const segment of path.segments) {
                    writeSegment(context, segment, style);
                }
            }
        }
        text.pair("0", "ENDSEC");
        writeObjects(text, layout);
        text.pair("0", "EOF");
        if (handseed !== undefined) {
            text.fill(handseed, text.peekHandle());
        }
        return text.joined();
    }

}
