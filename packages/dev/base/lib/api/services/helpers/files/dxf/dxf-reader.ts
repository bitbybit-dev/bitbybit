import * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { hexOfChannels } from "../../color/color-forms";
import { composeAxes, WORLD_AXES } from "../../geometry/frame-axes";
import type { FrameAxes } from "../../geometry/frame-axes";
import { radiansOf } from "../../geometry/scalars";
import { scale3 } from "../../geometry/vectors";
import { ocsAxesOf } from "../drawing/drawing-geometry";
import { WorkBudget } from "../work-budget";
import { ACI_PALETTE } from "./dxf-colors";
import { placedHatch, placedText, planarTurnOf, readHatchOf, readTextOf } from "./dxf-reader-annotations";
import { mappedSegments, rotationAboutZ, scaling, translation } from "./dxf-reader-geometry";
import { readSegmentsOf, recordNormalOf, recordPointOf, segmentWork } from "./dxf-reader-segments";
import type { DxfEntityRecord, DxfGroup, OwnSegments, ReadDrawing, ReadEntity, ReadHatch, ReadLayer, ReadStyle, ReadText } from "./dxf-reader-types";
import {
    ANNOTATED_ENTITIES, BLACK, BY_BLOCK, BY_LAYER, BYTE, COPY_WORK, DRAWN_ENTITIES, ENTITY_WORK, FROZEN_FLAG, GREEN_SHIFT, GROUP, IMPERIAL_UNIT_CODES, INSERT_WORK_CEILING,
    INSERT_WORK_FLOOR, INSERT_WORK_PER_CHARACTER, MAX_INSERT_DEPTH, MAX_LISTED_NAMES, PAPER_SPACE, RED_SHIFT, UNIT_CODES, UNIT_NAMES, XREF_FLAGS,
} from "./dxf-reader.constants";
import type { DxfMeasurement } from "./dxf-tables";
import { DXF_IMPERIAL_MEASUREMENT, DXF_MAX_NAME_LENGTH, DXF_POINT_CODES, DXF_WHITE_OR_BLACK } from "./dxf.constants";
import { decodedText, dxfGroupsOf, headerGroupOf, numberIn, numberOf, recordsOf, sectionsOf, textOf } from "./dxf-tokens";

type Point3 = Inputs.Base.Point3;

interface Block {
    readonly base: Point3;
    readonly entities: readonly DxfEntityRecord[];
    readonly external: boolean;
}

interface OpenBlock {
    readonly name: string;
    readonly base: Point3;
    readonly entities: DxfEntityRecord[];
    readonly external: boolean;
}

interface Context {
    readonly map: FrameAxes;
    readonly inherited: ReadStyle | undefined;
    readonly depth: number;
}

interface OwnStyle {
    readonly layer: string;
    readonly trueColor: string | undefined;
    readonly aci: number;
    readonly lineTypeName: string;
    readonly lineType: Inputs.IO.lineTypeEnum;
}

interface OwnAnnotation {
    readonly text: ReadText | undefined;
    readonly hatch: ReadHatch | undefined;
    readonly work: number;
    readonly flaw: string | undefined;
}

interface Placement {
    readonly oriented: FrameAxes;
    readonly scaled: FrameAxes;
    readonly rows: number;
    readonly columns: number;
    readonly columnStep: number;
    readonly rowStep: number;
}

interface InsertPlan {
    readonly name: string;
    readonly block: Block | undefined;
    readonly placement: Placement | undefined;
}

const HIGH_SURROGATES = /[\uD800-\uDBFF]$/;
const DEEP_INSERTS_NOTE = `Block inserts nested deeper than ${MAX_INSERT_DEPTH} were left out.`;

const hexOfRgb = (rgb: number): string => hexOfChannels([(rgb >> RED_SHIFT) & BYTE, (rgb >> GREEN_SHIFT) & BYTE, rgb & BYTE]);

const hexOfAci = (index: number): string => {
    if (index === DXF_WHITE_OR_BLACK) {
        return BLACK;
    }
    const rgb = ACI_PALETTE[index - 1];
    if (rgb === undefined) {
        return BLACK;
    }
    const byteOf = (channel: number): number => Math.min(BYTE, Math.round(channel));
    return hexOfChannels([byteOf(rgb[0]), byteOf(rgb[1]), byteOf(rgb[2])]);
};

const hatchWork = (hatch: ReadHatch): number => hatch.boundaries.reduce((total, loop) => loop.reduce((sum, segment) => sum + segmentWork(segment), total), 0);

const ownAnnotation = (type: string, read: ReadText | ReadHatch | string | undefined): OwnAnnotation => {
    if (typeof read === "string") {
        return { text: undefined, hatch: undefined, work: 0, flaw: `${type}\n${read}` };
    }
    if (read === undefined) {
        return { text: undefined, hatch: undefined, work: 0, flaw: undefined };
    }
    return "value" in read ? { text: read, hatch: undefined, work: read.value.length, flaw: undefined } : { text: undefined, hatch: read, work: hatchWork(read), flaw: undefined };
};

const lineTypeOf = (name: string): Inputs.IO.lineTypeEnum => {
    const upper = name.toUpperCase();
    if (upper.startsWith("HIDDEN")) {
        return Inputs.IO.lineTypeEnum.hidden;
    }
    if (upper.startsWith("CENTER")) {
        return Inputs.IO.lineTypeEnum.center;
    }
    if (upper.startsWith("DOT")) {
        return Inputs.IO.lineTypeEnum.dotted;
    }
    if (upper.startsWith("DASH")) {
        return Inputs.IO.lineTypeEnum.dashed;
    }
    return Inputs.IO.lineTypeEnum.continuous;
};

const shownName = (name: string): string => name.slice(0, DXF_MAX_NAME_LENGTH);

const plural = (count: number, one: string, many: string): string => (count === 1 ? one : many);

const measurementOf = (stated: DxfGroup | undefined, unitCode: number): DxfMeasurement => {
    if (stated !== undefined) {
        return numberIn(stated) === Number(DXF_IMPERIAL_MEASUREMENT) ? "imperial" : "metric";
    }
    return IMPERIAL_UNIT_CODES.has(unitCode) ? "imperial" : "metric";
};

class DxfReading {
    private readonly layers = new Map<string, ReadLayer>();
    private readonly blocks = new Map<string, Block>();
    private readonly entities: ReadEntity[] = [];
    private readonly skipped = new Map<string, number>();
    private readonly flawed = new Map<string, number>();
    private readonly notes = new Set<string>();
    private readonly missingBlocks = new Set<string>();
    private readonly externalBlocks = new Set<string>();
    private readonly ownStyles = new Map<DxfEntityRecord, OwnStyle>();
    private readonly styles = new Map<DxfEntityRecord, Map<ReadStyle | undefined, ReadStyle | undefined>>();
    private readonly ownSegments = new Map<DxfEntityRecord, OwnSegments>();
    private readonly ownAnnotations = new Map<DxfEntityRecord, OwnAnnotation>();
    private readonly inserts = new Map<DxfEntityRecord, InsertPlan>();
    private readonly contentWork = new Map<Block, number[]>();
    private readonly budget: WorkBudget;
    private hiddenCount = 0;
    private leftOutInserts = 0;
    private cutNames = 0;
    private measurement: DxfMeasurement = "metric";

    constructor(private readonly includeHidden: boolean, inputSize: number, private readonly annotated: boolean) {
        this.budget = WorkBudget.forInput(inputSize, INSERT_WORK_PER_CHARACTER, INSERT_WORK_FLOOR, INSERT_WORK_CEILING);
    }

    read(text: string): ReadDrawing {
        const sections = sectionsOf(dxfGroupsOf(text));
        const header = sections.get("HEADER") ?? [];
        const unitGroup = headerGroupOf(header, "$INSUNITS");
        const unitCode = unitGroup === undefined ? 0 : numberIn(unitGroup);
        this.measurement = measurementOf(headerGroupOf(header, "$MEASUREMENT"), unitCode);
        this.readLayers(sections.get("TABLES") ?? []);
        this.readBlocks(sections.get("BLOCKS") ?? []);
        if (!sections.has("ENTITIES")) {
            throw new InputError("`dxf` has no ENTITIES section, so it is not a DXF drawing.", "dxf");
        }
        const records = recordsOf(sections.get("ENTITIES")!);
        const modelSpace = records.filter(record => textOf(record, GROUP.space) !== PAPER_SPACE);
        const paperSpace = records.length - modelSpace.length;
        for (const record of modelSpace) {
            this.readEntity(record, { map: WORLD_AXES, inherited: undefined, depth: 0 });
        }
        const unit = UNIT_CODES.get(unitCode);
        const unitName = UNIT_NAMES.get(unitCode);
        if (unit === undefined && unitName !== undefined) {
            this.notes.add(`The file states its unit as ${unitName}, which is not one of mm, cm, m or in; it is read as drawn, with no unit.`);
        }
        const paperSpaceWarning = `${paperSpace} ${paperSpace === 1 ? "entity in paper space was" : "entities in paper space were"} left out: only model space is drawn.`;
        const hiddenWarning = this.hiddenCount === 1
            ? "1 entity on a layer switched off or frozen was left out: set includeHiddenLayers to read it."
            : `${this.hiddenCount} entities on layers switched off or frozen were left out: set includeHiddenLayers to read them.`;
        return {
            version: headerGroupOf(header, "$ACADVER")?.value.trim() ?? "",
            unit,
            layers: [...this.layers.values()],
            entities: this.entities,
            warnings: [
                ...this.skippedWarnings(),
                ...(paperSpace === 0 ? [] : [paperSpaceWarning]),
                ...(this.hiddenCount === 0 ? [] : [hiddenWarning]),
                ...[...this.flawed].map(([flaw, count]) => `${count} ${flaw.replace("\n", count === 1 ? " entity could not be drawn: " : " entities could not be drawn: ")}.`),
                ...this.notes,
                ...this.unlistedBlockWarnings(),
                ...(this.leftOutInserts === 0 ? [] : [this.leftOutInsertsWarning(text.length)]),
                ...(this.cutNames === 0 ? [] : [this.cutNamesWarning()]),
            ],
        };
    }

    private skippedWarnings(): string[] {
        const kinds = [...this.skipped];
        const listed = kinds.slice(0, MAX_LISTED_NAMES).map(([type, count]) =>
            `${count} ${shownName(type)} ${plural(count, "entity was", "entities were")} left out: only lines, arcs, circles, ellipses, polylines, splines${this.annotated ? ", texts, hatches" : ""} and block inserts are drawn.`);
        const rest = kinds.slice(MAX_LISTED_NAMES);
        if (rest.length === 0) {
            return listed;
        }
        const count = rest.reduce((total, [, each]) => total + each, 0);
        return [...listed, `${count} more ${plural(count, "entity", "entities")} of ${rest.length} other ${plural(rest.length, "kind was", "kinds were")} left out as well.`];
    }

    private unlistedBlockWarnings(): string[] {
        const missing = this.missingBlocks.size - MAX_LISTED_NAMES;
        const external = this.externalBlocks.size - MAX_LISTED_NAMES;
        return [
            ...(missing > 0 ? [`Block inserts name ${missing} more ${plural(missing, "block", "blocks")} the file does not define; ${plural(missing, "it was", "they were")} left out.`] : []),
            ...(external > 0 ? [`${external} more ${plural(external, "block is an external reference", "blocks are external references")} to another file; ${plural(external, "it was", "they were")} left out.`] : []),
        ];
    }

    private leftOutInsertsWarning(size: number): string {
        const count = this.leftOutInserts;
        return `${count} block ${plural(count, "insert was", "inserts were")} left out: with the inserts read before ${plural(count, "it", "them")}, `
            + `${plural(count, "it places", "they place")} more entities, points and copies than the ${this.budget.capacity} a file of ${size} characters may expand to.`;
    }

    private cutNamesWarning(): string {
        const count = this.cutNames;
        return `${count} layer, block or line type ${plural(count, "name was", "names were")} longer than ${DXF_MAX_NAME_LENGTH} characters, the most AutoCAD allows, and ${plural(count, "was", "were")} cut to ${plural(count, "its", "their")} first ${DXF_MAX_NAME_LENGTH}.`;
    }

    private nameOf(value: string): string {
        if (value.length <= DXF_MAX_NAME_LENGTH) {
            return value;
        }
        this.cutNames++;
        const cut = value.slice(0, DXF_MAX_NAME_LENGTH);
        return HIGH_SURROGATES.test(cut) ? cut.slice(0, -1) : cut;
    }

    private readLayers(tables: readonly DxfGroup[]): void {
        for (const record of recordsOf(tables).filter(candidate => candidate.type === "LAYER")) {
            const name = this.nameOf(decodedText(textOf(record, GROUP.name, "0")));
            const aci = numberOf(record, GROUP.color, DXF_WHITE_OR_BLACK);
            const trueColor = textOf(record, GROUP.trueColor);
            this.layers.set(name.toUpperCase(), {
                name,
                color: trueColor === "" ? hexOfAci(Math.abs(aci)) : hexOfRgb(Number(trueColor)),
                lineType: lineTypeOf(this.nameOf(textOf(record, GROUP.lineType, "CONTINUOUS"))),
                hidden: aci < 0 || (numberOf(record, GROUP.flags, 0) & FROZEN_FLAG) !== 0,
            });
        }
    }

    private readBlocks(blocks: readonly DxfGroup[]): void {
        let open: OpenBlock | undefined;
        for (const record of recordsOf(blocks)) {
            if (record.type === "BLOCK") {
                open = { name: this.nameOf(decodedText(textOf(record, GROUP.name))), base: recordPointOf(record, DXF_POINT_CODES), entities: [], external: (numberOf(record, GROUP.flags, 0) & XREF_FLAGS) !== 0 };
            } else if (record.type === "ENDBLK") {
                if (open !== undefined) {
                    this.blocks.set(open.name.toUpperCase(), { base: open.base, entities: open.entities, external: open.external });
                }
                open = undefined;
            } else {
                open?.entities.push(record);
            }
        }
    }

    private remembered<T>(memo: Map<DxfEntityRecord, T>, record: DxfEntityRecord, keep: boolean, make: () => T): T {
        const known = memo.get(record);
        if (known !== undefined) {
            return known;
        }
        const made = make();
        if (keep) {
            memo.set(record, made);
        }
        return made;
    }

    private ownStyleOf(record: DxfEntityRecord, keep: boolean): OwnStyle {
        return this.remembered(this.ownStyles, record, keep, () => {
            const trueColor = textOf(record, GROUP.trueColor);
            const lineTypeName = this.nameOf(textOf(record, GROUP.lineType, "BYLAYER")).toUpperCase();
            return {
                layer: this.nameOf(decodedText(textOf(record, GROUP.layer, "0"))),
                trueColor: trueColor === "" ? undefined : hexOfRgb(Number(trueColor)),
                aci: numberOf(record, GROUP.color, BY_LAYER),
                lineTypeName,
                lineType: lineTypeOf(lineTypeName),
            };
        });
    }

    private styleOf(record: DxfEntityRecord, context: Context): ReadStyle | undefined {
        if (context.depth === 0) {
            return this.styleFrom(this.ownStyleOf(record, false), context.inherited);
        }
        const known = this.styles.get(record) ?? new Map<ReadStyle | undefined, ReadStyle | undefined>();
        this.styles.set(record, known);
        if (known.has(context.inherited)) {
            return known.get(context.inherited);
        }
        const style = this.styleFrom(this.ownStyleOf(record, true), context.inherited);
        known.set(context.inherited, style);
        return style;
    }

    private styleFrom(own: OwnStyle, inherited: ReadStyle | undefined): ReadStyle | undefined {
        const layerName = own.layer === "0" && inherited !== undefined ? inherited.layer : own.layer;
        const layer = this.layers.get(layerName.toUpperCase());
        if (layer?.hidden === true && !this.includeHidden) {
            return undefined;
        }
        let color: string;
        if (own.trueColor !== undefined) {
            color = own.trueColor;
        } else if (own.aci === BY_BLOCK) {
            color = inherited?.color ?? BLACK;
        } else if (own.aci === BY_LAYER) {
            color = layer?.color ?? BLACK;
        } else {
            color = hexOfAci(Math.abs(own.aci));
        }
        let lineType: Inputs.IO.lineTypeEnum;
        if (own.lineTypeName === "BYLAYER") {
            lineType = layer?.lineType ?? Inputs.IO.lineTypeEnum.continuous;
        } else if (own.lineTypeName === "BYBLOCK") {
            lineType = inherited?.lineType ?? Inputs.IO.lineTypeEnum.continuous;
        } else {
            lineType = own.lineType;
        }
        return { layer: layer?.name ?? layerName, color, lineType };
    }

    private skip(type: string): void {
        this.skipped.set(type, (this.skipped.get(type) ?? 0) + 1);
    }

    private flaw(flaw: string): void {
        this.flawed.set(flaw, (this.flawed.get(flaw) ?? 0) + 1);
    }

    private ownAnnotationOf(record: DxfEntityRecord, keep: boolean): OwnAnnotation {
        return this.remembered(this.ownAnnotations, record, keep, () => ownAnnotation(record.type, record.type === "TEXT" ? readTextOf(record) : readHatchOf(record, this.measurement)));
    }

    private readAnnotation(record: DxfEntityRecord, context: Context): void {
        const style = this.styleOf(record, context);
        if (style === undefined) {
            this.hiddenCount++;
            return;
        }
        const turn = planarTurnOf(context.map);
        if (turn === undefined) {
            this.flaw(`${record.type}\nit sits in a mirrored or unevenly scaled block insert`);
            return;
        }
        const own = this.ownAnnotationOf(record, context.depth > 0);
        if (own.flaw !== undefined) {
            this.flaw(own.flaw);
        } else if (own.text !== undefined) {
            this.entities.push({ style, segments: [], text: placedText(own.text, turn, context.map) });
        } else if (own.hatch !== undefined) {
            this.entities.push({ style, segments: [], hatch: placedHatch(own.hatch, turn, context.map, context.map !== WORLD_AXES) });
        }
    }

    private readEntity(record: DxfEntityRecord, context: Context): void {
        if (this.annotated && ANNOTATED_ENTITIES.has(record.type)) {
            this.readAnnotation(record, context);
            return;
        }
        if (!DRAWN_ENTITIES.has(record.type)) {
            this.skip(record.type);
            return;
        }
        const style = this.styleOf(record, context);
        if (style === undefined) {
            this.hiddenCount++;
            return;
        }
        if (record.type === "INSERT") {
            this.readInsert(record, style, context);
            return;
        }
        const own = this.ownSegmentsOf(record, context.depth > 0);
        if (own.flaw !== undefined) {
            this.flaw(own.flaw);
        }
        if (own.skipped !== undefined) {
            this.skip(own.skipped);
        }
        if (own.segments.length === 0) {
            return;
        }
        const segments = context.map === WORLD_AXES ? own.segments : own.segments.flatMap(segment => mappedSegments(context.map, segment));
        this.entities.push({ style, segments });
    }

    private insertPlanOf(record: DxfEntityRecord, keep: boolean): InsertPlan {
        return this.remembered(this.inserts, record, keep, () => {
            const name = this.nameOf(decodedText(textOf(record, GROUP.name)));
            const block = this.blocks.get(name.toUpperCase());
            if (block === undefined || block.external) {
                return { name, block, placement: undefined };
            }
            const placed = composeAxes(ocsAxesOf(recordNormalOf(record)), translation(recordPointOf(record, DXF_POINT_CODES)));
            const turned = rotationAboutZ(radiansOf(numberOf(record, GROUP.rotation, 0)));
            return {
                name,
                block,
                placement: {
                    oriented: composeAxes(placed, turned),
                    scaled: composeAxes(scaling(numberOf(record, GROUP.scaleX, 1), numberOf(record, GROUP.scaleY, 1), numberOf(record, GROUP.scaleZ, 1)), translation(scale3(block.base, -1))),
                    rows: Math.max(1, Math.floor(numberOf(record, GROUP.rows, 1))),
                    columns: Math.max(1, Math.floor(numberOf(record, GROUP.columns, 1))),
                    columnStep: numberOf(record, GROUP.columnStep, 0),
                    rowStep: numberOf(record, GROUP.rowStep, 0),
                },
            };
        });
    }

    private capped(work: number): number {
        return Math.min(work, this.budget.capacity + 1);
    }

    private entityWork(record: DxfEntityRecord, depth: number): number {
        if (record.type === "INSERT") {
            return this.capped(ENTITY_WORK + this.copiesWork(this.insertPlanOf(record, true), depth));
        }
        if (this.annotated && ANNOTATED_ENTITIES.has(record.type)) {
            return ENTITY_WORK + this.ownAnnotationOf(record, true).work;
        }
        if (!DRAWN_ENTITIES.has(record.type)) {
            return ENTITY_WORK;
        }
        return ENTITY_WORK + this.ownSegmentsOf(record, true).work;
    }

    private copiesWork(plan: InsertPlan, depth: number): number {
        if (plan.block === undefined || plan.placement === undefined || depth >= MAX_INSERT_DEPTH || plan.block.entities.length === 0) {
            return 0;
        }
        return this.capped(plan.placement.rows * plan.placement.columns * (COPY_WORK + this.contentsWork(plan.block, depth + 1)));
    }

    private contentsWork(block: Block, depth: number): number {
        const known = this.contentWork.get(block) ?? [];
        this.contentWork.set(block, known);
        const remembered = known[depth];
        if (remembered !== undefined) {
            return remembered;
        }
        let total = 0;
        for (const entity of block.entities) {
            total = this.capped(total + this.entityWork(entity, depth));
            if (total > this.budget.capacity) {
                break;
            }
        }
        known[depth] = total;
        return total;
    }

    private leaveOutBlock(names: Set<string>, name: string, note: () => string): void {
        if (!names.has(name)) {
            names.add(name);
            if (names.size <= MAX_LISTED_NAMES) {
                this.notes.add(note());
            }
        }
    }

    private readInsert(record: DxfEntityRecord, style: ReadStyle, context: Context): void {
        const plan = this.insertPlanOf(record, context.depth > 0);
        const { name, block, placement } = plan;
        if (block === undefined) {
            this.leaveOutBlock(this.missingBlocks, name, () => `A block insert names the block "${name}", which the file does not define; it was left out.`);
            return;
        }
        if (placement === undefined) {
            this.leaveOutBlock(this.externalBlocks, name, () => `The block "${name}" is an external reference to another file; it was left out.`);
            return;
        }
        if (context.depth >= MAX_INSERT_DEPTH) {
            this.notes.add(DEEP_INSERTS_NOTE);
            return;
        }
        if (block.entities.length === 0) {
            return;
        }
        if (context.depth === 0) {
            const work = this.copiesWork(plan, 0);
            if (!this.budget.affords(work)) {
                this.leftOutInserts++;
                return;
            }
            this.budget.spend(work);
        }
        const { oriented, scaled, rows, columns, columnStep, rowStep } = placement;
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const map = composeAxes(context.map, composeAxes(oriented, composeAxes(translation([column * columnStep, row * rowStep, 0]), scaled)));
                for (const entity of block.entities) {
                    this.readEntity(entity, { map, inherited: style, depth: context.depth + 1 });
                }
            }
        }
    }

    private ownSegmentsOf(record: DxfEntityRecord, keep: boolean): OwnSegments {
        return this.remembered(this.ownSegments, record, keep, () => readSegmentsOf(record));
    }
}

export const readDxfDrawing = (text: string, includeHidden: boolean, annotated = false): ReadDrawing => {
    if (typeof includeHidden !== "boolean") {
        throw new InputError(`\`includeHiddenLayers\` must be true or false, and is of type ${typeof includeHidden}.`, "includeHiddenLayers");
    }
    return new DxfReading(includeHidden, typeof text === "string" ? text.length : 0, annotated).read(text);
};
