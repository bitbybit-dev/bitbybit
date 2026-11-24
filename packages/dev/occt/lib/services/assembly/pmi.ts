import type { BitbybitOcctModule, ClassHandle, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../api/inputs";
import type * as Resolved from "../../api/resolved-inputs";
import { readKernelException } from "../../kernel-exception";
import { checkedDocument } from "../base/file-data";
import { withKernelRefusals } from "../base/kernel-refusals";
import { kernelObjects } from "../base/release";
import { asHeldDatums, checkDatumLetters, namesDatums, withoutRepeats } from "./pmi-datum-letters";
import { PmiShapeNamer } from "./pmi-shape-refs";
import type { HeldDatum, KernelPmiDatum, KernelPmiDimension, KernelPmiInput, KernelPmiPlace, KernelPmiPresentation, KernelPmiTolerance, KernelReadPmi, PartSubShapes, PmiPicturePlane } from "./pmi-types";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;
type Vector3 = Inputs.Base.Vector3;
type Own = <T extends ClassHandle>(object: T) => T;

const DIMENSION = Inputs.OCCT.pmiDimensionTypeEnum;
const SHAPE_KINDS = Object.values(Inputs.OCCT.pmiShapeKindEnum);
const DIMENSION_TYPES = Object.values(DIMENSION);
const TOLERANCE_TYPES = Object.values(Inputs.OCCT.pmiToleranceTypeEnum);
const MATERIALS = Object.values(Inputs.OCCT.pmiMaterialConditionEnum);
const POINT_SIZE = 3;
const PICTURE_KINDS: Readonly<Record<Inputs.OCCT.pmiDimensionTypeEnum, Inputs.IO.dimensionKindEnum>> = {
    [DIMENSION.linearDistance]: Inputs.IO.dimensionKindEnum.linear,
    [DIMENSION.curveLength]: Inputs.IO.dimensionKindEnum.linear,
    [DIMENSION.angle]: Inputs.IO.dimensionKindEnum.angular,
    [DIMENSION.diameter]: Inputs.IO.dimensionKindEnum.diameter,
    [DIMENSION.radius]: Inputs.IO.dimensionKindEnum.radius,
};
const UP: Vector3 = [0, 0, 1];
const FRONT: Vector3 = [0, -1, 0];
const PARALLEL_SINE = 1e-9;
const FULL_TURN_DEGREES = 360;
const REFUSAL = /AddDocumentPmiJson: (?:((?:dimensions|datums|tolerances)\[\d+\][^:]*): )?(.+)$/;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

const isTriple = (value: unknown): value is Point3 => Array.isArray(value) && value.length === POINT_SIZE && value.every(entry => typeof entry === "number" && Number.isFinite(entry));

const tripleOf = (value: unknown, property: string): Point3 => {
    if (!isTriple(value)) {
        throw new InputError(`\`${property}\` must be three finite numbers.`, property);
    }
    return value;
};

const valueOf = (value: unknown, property: string): number => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new InputError(`\`${property}\` must be a finite number.`, property);
    }
    return value;
};

const listOf = (value: unknown, property: string): unknown[] => {
    if (value === undefined) {
        return [];
    }
    if (!Array.isArray(value)) {
        throw new InputError(`\`${property}\` must be a list.`, property);
    }
    return value;
};

const recordOf = (value: unknown, property: string): Record<string, unknown> => {
    if (!isRecord(value)) {
        throw new InputError(`\`${property}\` must be an object.`, property);
    }
    return value;
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], property: string): T => {
    const found = allowed.find(entry => entry === value);
    if (found === undefined) {
        throw new InputError(`\`${property}\` must be one of ${allowed.join(", ")}.`, property);
    }
    return found;
};

const dtoPathOf = (where: string): string => where
    .replace(/\.otherShapes\b/, ".otherShapeRefs")
    .replace(/\.shapes\b/, ".shapeRefs")
    .replace(/^(tolerances\[\d+\])\.datums\b/, "$1.datumLetters");

const refusalOf = (message: string): InputError | undefined => {
    const refusal = REFUSAL.exec(message);
    if (refusal === null) {
        return undefined;
    }
    const [, where, reason] = refusal;
    if (where === undefined) {
        return new InputError(`The PMI was refused: ${reason!}.`);
    }
    const path = dtoPathOf(where);
    return new InputError(`\`${path}\` was refused: ${reason!}.`, path);
};

const shapeText = (ref: Resolved.OCCT.PmiShapeDto): string => ref.kind === Inputs.OCCT.pmiShapeKindEnum.part ? `part ${ref.part}` : `${ref.kind} ${ref.index} of part ${ref.part}`;

const isEmptyList = (value: unknown): boolean => value === undefined || (Array.isArray(value) && value.length === 0);

const drawsNothing = (presentation: unknown): boolean =>
    presentation === undefined || (isRecord(presentation) && isEmptyList(presentation["lines"]) && isEmptyList(presentation["fills"]));

const pathsOf = (paths: readonly (readonly Point3[])[] | undefined, property: string): number[][] | undefined => {
    if (paths === undefined) {
        return undefined;
    }
    if (!Array.isArray(paths)) {
        throw new InputError(`\`${property}\` must be a list of polylines.`, property);
    }
    return paths.map((path, at) => {
        if (!Array.isArray(path)) {
            throw new InputError(`\`${property}[${at}]\` must be a list of points.`, `${property}[${at}]`);
        }
        return path.flatMap((point, index) => tripleOf(point, `${property}[${at}][${index}]`));
    });
};

class PartPlaces {
    private readonly shapes = new Map<string, TopoDS_Shape | undefined>();
    private readonly subShapes = new Map<string, PartSubShapes | undefined>();

    constructor(private readonly occ: BitbybitOcctModule, private readonly document: Handle_TDocStd_Document, private readonly own: Own) { }

    placeOf(value: unknown, property: string): KernelPmiPlace {
        const shape = resolveDto(Inputs.OCCT.PmiShapeDto, recordOf(value, property)) as Resolved.OCCT.PmiShapeDto;
        if (typeof shape.part !== "string" || shape.part === "") {
            throw new InputError(`\`${property}.part\` must be the label of a part, such as 0:1:1:1.`, `${property}.part`);
        }
        const kind = oneOf(shape.kind, SHAPE_KINDS, `${property}.kind`);
        if (kind === Inputs.OCCT.pmiShapeKindEnum.part) {
            return { part: shape.part };
        }
        const index = shape.index;
        if (!Number.isInteger(index) || index < 0) {
            throw new InputError(`\`${property}.index\` must be a whole number from 0; it is ${String(index)}.`, `${property}.index`);
        }
        if (kind === Inputs.OCCT.pmiShapeKindEnum.edge) {
            return { part: shape.part, edge: index };
        }
        const lists = this.subShapesOf(shape.part, kind);
        if (lists === undefined) {
            return kind === Inputs.OCCT.pmiShapeKindEnum.face ? { part: shape.part, face: index } : { part: shape.part, vertex: index };
        }
        if (index >= lists.explored.length) {
            const counted = kind === Inputs.OCCT.pmiShapeKindEnum.face ? "faces" : "vertices";
            throw new InputError(`\`${property}.index\` is ${index}, but part ${shape.part} has ${lists.explored.length} ${counted}.`, `${property}.index`);
        }
        const distinct = lists.distinct.findIndex(candidate => candidate.IsSame(lists.explored[index]!));
        return kind === Inputs.OCCT.pmiShapeKindEnum.face ? { part: shape.part, face: distinct } : { part: shape.part, vertex: distinct };
    }

    private shapeOf(part: string): TopoDS_Shape | undefined {
        if (this.shapes.has(part)) {
            return this.shapes.get(part);
        }
        let shape: TopoDS_Shape | undefined;
        try {
            shape = this.own(this.occ.GetShapeFromDocLabel(this.document, part));
        } catch (thrown) {
            readKernelException(this.occ, thrown);
        }
        const readable = shape === undefined || shape.IsNull() ? undefined : shape;
        this.shapes.set(part, readable);
        return readable;
    }

    private subShapesOf(part: string, kind: Inputs.OCCT.pmiShapeKindEnum): PartSubShapes | undefined {
        const key = `${kind} ${part}`;
        if (this.subShapes.has(key)) {
            return this.subShapes.get(key);
        }
        const shape = this.shapeOf(part);
        const listed = (distinct: boolean): TopoDS_Shape[] => (kind === Inputs.OCCT.pmiShapeKindEnum.face ? this.occ.FacesOf(shape!, distinct) : this.occ.VerticesOf(shape!, distinct)).map(entry => this.own(entry));
        const lists = shape === undefined ? undefined : { explored: listed(false), distinct: listed(true) };
        this.subShapes.set(key, lists);
        return lists;
    }
}

export class DocumentPmiWriter {

    constructor(private readonly occ: BitbybitOcctModule, private readonly base: BaseBitByBit) { }

    add(inputs: Resolved.OCCT.AddDocumentPmiDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const document = checkedDocument(inputs.document, "document");
        const { own, releaseAll } = kernelObjects();
        try {
            const places = new PartPlaces(this.occ, document, own);
            const pmi: KernelPmiInput = {
                dimensions: listOf(inputs.dimensions, "dimensions").map((dimension, at) => this.dimensionOf(dimension, `dimensions[${at}]`, places)),
                datums: listOf(inputs.datums, "datums").map((datum, at) => this.datumOf(datum, `datums[${at}]`, places)),
                tolerances: listOf(inputs.tolerances, "tolerances").map((tolerance, at) => this.toleranceOf(tolerance, `tolerances[${at}]`, places)),
            };
            const held = namesDatums(pmi) ? this.heldDatums(document, places, own) : [];
            checkDatumLetters(pmi, held);
            withKernelRefusals(this.occ, () => this.occ.AddDocumentPmiJson(document, JSON.stringify(asHeldDatums(pmi, held))), refusalOf);
            return document;
        } finally {
            releaseAll();
        }
    }

    remove(inputs: Resolved.OCCT.RemoveDocumentPmiDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const document = checkedDocument(inputs.document, "document");
        this.occ.RemoveDocumentPmiJson(document);
        return document;
    }

    private heldDatums(document: Handle_TDocStd_Document, places: PartPlaces, own: Own): HeldDatum[] {
        const read = JSON.parse(this.occ.DocumentPmiJson(document)) as KernelReadPmi;
        const namer = new PmiShapeNamer(this.occ, document, own);
        return read.datums.map(datum => {
            const refs = namer.refsOf(datum.shapes);
            return {
                entry: datum.entry,
                letter: datum.name,
                places: refs.map(ref => places.placeOf(ref, "datums")),
                where: refs.length === 0 ? datum.shapes.join(", ") : refs.map(shapeText).join(", "),
            };
        });
    }

    private placesOf(value: unknown, property: string, places: PartPlaces): KernelPmiPlace[] {
        if (!Array.isArray(value) || value.length === 0) {
            throw new InputError(`\`${property}\` must be a list of one or more shapes.`, property);
        }
        return value.map((shape, at) => places.placeOf(shape, `${property}[${at}]`));
    }

    private dimensionOf(item: unknown, property: string, places: PartPlaces): KernelPmiDimension {
        const dimension = resolveDto(Inputs.OCCT.PmiDimensionDto, recordOf(item, property)) as Resolved.OCCT.PmiDimensionDto;
        const type = oneOf(dimension.type, DIMENSION_TYPES, `${property}.type`);
        const value = valueOf(dimension.value, `${property}.value`);
        const toleranced = dimension.upperTolerance !== undefined || dimension.lowerTolerance !== undefined;
        const shapes = this.placesOf(dimension.shapeRefs, `${property}.shapeRefs`, places);
        const others = isEmptyList(dimension.otherShapeRefs) ? undefined : dimension.otherShapeRefs;
        const otherShapes = others === undefined ? undefined : this.placesOf(others, `${property}.otherShapeRefs`, places);
        const presentation = drawsNothing(dimension.presentation)
            ? this.pictureOf(dimension, type, property)
            : this.presentationOf(dimension.presentation, dimension.name, `${property}.presentation`);
        return {
            type,
            value,
            ...(toleranced ? { upperTolerance: dimension.upperTolerance ?? 0, lowerTolerance: dimension.lowerTolerance ?? 0 } : {}),
            shapes,
            ...(otherShapes === undefined ? {} : { otherShapes }),
            ...(presentation === undefined ? {} : { presentation }),
        };
    }

    private datumOf(value: unknown, property: string, places: PartPlaces): KernelPmiDatum {
        const datum = resolveDto(Inputs.OCCT.PmiDatumDto, recordOf(value, property)) as Resolved.OCCT.PmiDatumDto;
        return {
            letter: datum.letter,
            shapes: withoutRepeats(this.placesOf(datum.shapeRefs, `${property}.shapeRefs`, places)),
            ...(drawsNothing(datum.presentation) ? {} : { presentation: this.presentationOf(datum.presentation, datum.name, `${property}.presentation`) }),
        };
    }

    private toleranceOf(value: unknown, property: string, places: PartPlaces): KernelPmiTolerance {
        const tolerance = resolveDto(Inputs.OCCT.PmiToleranceDto, recordOf(value, property)) as Resolved.OCCT.PmiToleranceDto;
        const material = oneOf(tolerance.material, MATERIALS, `${property}.material`);
        return {
            type: oneOf(tolerance.type, TOLERANCE_TYPES, `${property}.type`),
            value: valueOf(tolerance.value, `${property}.value`),
            shapes: this.placesOf(tolerance.shapeRefs, `${property}.shapeRefs`, places),
            ...(tolerance.datumLetters === undefined ? {} : { datums: tolerance.datumLetters }),
            ...(tolerance.diameterZone ? { zone: "diameter" as const } : {}),
            ...(material === Inputs.OCCT.pmiMaterialConditionEnum.none ? {} : { material }),
            ...(drawsNothing(tolerance.presentation) ? {} : { presentation: this.presentationOf(tolerance.presentation, tolerance.name, `${property}.presentation`) }),
        };
    }

    private presentationOf(value: unknown, name: string | undefined, property: string): KernelPmiPresentation {
        const presentation = resolveDto(Inputs.OCCT.PmiPresentationDto, recordOf(value, property));
        const plane = presentation.plane === undefined ? undefined : recordOf(presentation.plane, `${property}.plane`);
        const lines = pathsOf(presentation.lines, `${property}.lines`);
        const fills = pathsOf(presentation.fills, `${property}.fills`);
        const label = typeof presentation.name === "string" && presentation.name !== "" ? presentation.name : name;
        return {
            ...(label === undefined ? {} : { label }),
            ...(plane === undefined ? {} : {
                plane: { origin: tripleOf(plane["origin"], `${property}.plane.origin`), normal: tripleOf(plane["normal"], `${property}.plane.normal`), direction: tripleOf(plane["direction"], `${property}.plane.direction`) },
            }),
            ...(presentation.textPoint === undefined ? {} : { textPoint: tripleOf(presentation.textPoint, `${property}.textPoint`) }),
            ...(lines === undefined ? {} : { lines }),
            ...(fills === undefined ? {} : { fills }),
        };
    }

    private pictureOf(dimension: Resolved.OCCT.PmiDimensionDto, type: Inputs.OCCT.pmiDimensionTypeEnum, property: string): KernelPmiPresentation | undefined {
        if (dimension.start === undefined && dimension.end === undefined) {
            return undefined;
        }
        const missing = dimension.start === undefined ? "start" : dimension.end === undefined ? "end" : undefined;
        if (missing !== undefined) {
            throw new InputError(`\`${property}.${missing}\` must be given with \`${missing === "start" ? "end" : "start"}\` to draw the dimension.`, `${property}.${missing}`);
        }
        const kind = PICTURE_KINDS[type];
        if (kind === Inputs.IO.dimensionKindEnum.angular && !(dimension.value > 0 && dimension.value < FULL_TURN_DEGREES)) {
            throw new InputError(`\`${property}.value\` is ${dimension.value}; an angle is drawn between 0 and ${FULL_TURN_DEGREES} degrees, both left out.`, `${property}.value`);
        }
        const plane = this.picturePlaneOf(dimension, type, property);
        let picture: Inputs.IO.DrawingDimensionPictureDto;
        try {
            picture = this.base.io.drawing.dimensionPicture({
                kind,
                start: plane.start,
                end: plane.end,
                direction: kind === Inputs.IO.dimensionKindEnum.linear ? [1, 0] : undefined,
                offset: dimension.offset,
                angle: kind === Inputs.IO.dimensionKindEnum.angular ? dimension.value : undefined,
                value: dimension.value,
                decimalPlaces: dimension.decimalPlaces,
                upperTolerance: dimension.upperTolerance,
                lowerTolerance: dimension.lowerTolerance,
                textHeight: dimension.textHeight,
            });
        } catch (error) {
            if (error instanceof InputError) {
                throw new InputError(`\`${property}\` cannot be drawn: ${error.message}`, error.property === undefined ? property : `${property}.${error.property}`);
            }
            throw error;
        }
        const lift = (points: readonly Point2[]): Point3[] => this.base.frame.pointsToWorld({ frame: plane.frame, points: points.map((point): Point3 => [point[0], point[1], 0]) });
        const textPoint = lift([picture.textPoint])[0]!;
        return {
            ...(dimension.name === undefined ? {} : { label: dimension.name }),
            plane: { origin: textPoint, normal: plane.frame.normal, direction: plane.frame.direction },
            textPoint,
            lines: [...picture.lines, ...picture.textStrokes].map(line => lift(line).flat()),
            fills: picture.fills.map(fill => lift(fill).flat()),
        };
    }

    private picturePlaneOf(dimension: Resolved.OCCT.PmiDimensionDto, type: Inputs.OCCT.pmiDimensionTypeEnum, property: string): PmiPicturePlane {
        const start = tripleOf(dimension.start, `${property}.start`);
        const end = tripleOf(dimension.end, `${property}.end`);
        const given = type === DIMENSION.linearDistance && dimension.direction !== undefined;
        const along = given ? tripleOf(dimension.direction, `${property}.direction`) : this.base.vector.sub({ first: end, second: start }) as Vector3;
        const normal = dimension.normal === undefined ? this.normalAcross(along) : tripleOf(dimension.normal, `${property}.normal`);
        let frame: Inputs.Base.Frame;
        try {
            frame = this.base.frame.create({ origin: start, normal, direction: along });
        } catch (error) {
            if (!(error instanceof InputError)) {
                throw error;
            }
            if (error.property === "normal") {
                throw new InputError(`\`${property}.normal\` has no length, so the dimension has no plane to be drawn in.`, `${property}.normal`);
            }
            throw given
                ? new InputError(`\`${property}.direction\` runs along \`normal\` or has no length, so it gives the dimension no direction in its plane.`, `${property}.direction`)
                : new InputError(`\`${property}.end\` lies on \`start\` or straight along \`normal\` from it, so it gives the dimension no direction in its plane.`, `${property}.end`);
        }
        const [first, second] = this.base.frame.pointsToLocal({ frame, points: [start, end] });
        return { frame, start: [first![0], first![1]], end: [second![0], second![1]] };
    }

    private normalAcross(along: Vector3): Vector3 {
        const across = this.base.vector.length({ vector: this.base.vector.cross({ first: UP, second: along }) as Vector3 });
        return across <= PARALLEL_SINE * this.base.vector.length({ vector: along }) ? FRONT : UP;
    }
}
