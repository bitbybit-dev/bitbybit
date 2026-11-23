import type { Base } from "@bitbybit-dev/base";

/**
 * Which shape of a part a dimension, datum or tolerance refers to: the whole `part`, or one `face`,
 * `edge` or `vertex` of it.
 * @beta
 */
export enum pmiShapeKindEnum {
    part = "part",
    face = "face",
    edge = "edge",
    vertex = "vertex",
}

/**
 * What a dimension states, under the names `assembly.query.getDocumentPmi` reads back:
 * `linearDistance` and `angle` measure from one shape to another, `diameter`, `radius` and
 * `curveLength` the size of one.
 * @beta
 */
export enum pmiDimensionTypeEnum {
    linearDistance = "Location_LinearDistance",
    angle = "Location_Angular",
    diameter = "Size_Diameter",
    radius = "Size_Radius",
    curveLength = "Size_CurveLength",
}

/**
 * What a geometric tolerance controls, under the names `assembly.query.getDocumentPmi` reads back.
 * `flatness`, `circularity` and `cylindricity` refer to no datum, `perpendicularity` and
 * `parallelism` need one, `position` and `profileOfSurface` take either.
 * @beta
 */
export enum pmiToleranceTypeEnum {
    flatness = "Flatness",
    circularity = "CircularityOrRoundness",
    cylindricity = "Cylindricity",
    profileOfSurface = "ProfileOfSurface",
    perpendicularity = "Perpendicularity",
    parallelism = "Parallelism",
    position = "Position",
}

/**
 * The material condition a tolerance applies at: `none`, or at the `maximum` or the `least`
 * material of its feature, the circled M or L after its value.
 * @beta
 */
export enum pmiMaterialConditionEnum {
    none = "none",
    maximum = "maximum",
    least = "least",
}

/**
 * One shape of a part in a document, for the `shapeRefs` of `assembly.manager.createPmiDimension`,
 * `createPmiDatum` and `createPmiTolerance`, and for `createPmiShape`, which describes one;
 * `assembly.query.getDocumentPmi` gives the same form.
 * @beta
 */
export class PmiShapeDto {
    constructor(part?: string, kind?: pmiShapeKindEnum, index?: number) {
        if (part !== undefined) { this.part = part; }
        if (kind !== undefined) { this.kind = kind; }
        if (index !== undefined) { this.index = index; }
    }
    /**
     * The label of the part, such as `0:1:1:1`, as `assembly.query.getDocumentParts` lists it: a
     * part, not an assembly or an instance that places one.
     * @default undefined
     */
    part!: string;
    /**
     * Whether the whole part is meant, or one face, edge or vertex of it.
     * @default face
     */
    kind?: pmiShapeKindEnum | undefined = pmiShapeKindEnum.face;
    /**
     * Which face, edge or vertex, counting from 0 as `shapes.face.getFace`, `shapes.edge.getEdge`
     * and `shapes.vertex.getVertices` count them on the part's shape; the whole part ignores it.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    index?: number | undefined = 0;
}

/**
 * A presentation drawn by the caller, in the part's own axes and units: its name, plane, text point,
 * lines and filled marks. An annotation `assembly.query.getDocumentAnnotations` read is one as it is.
 * @beta
 */
export class PmiPresentationDto {
    constructor(plane?: Base.Frame, textPoint?: Base.Point3, lines?: Base.Point3[][], fills?: Base.Point3[][], name?: string) {
        if (plane !== undefined) { this.plane = plane; }
        if (textPoint !== undefined) { this.textPoint = textPoint; }
        if (lines !== undefined) { this.lines = lines; }
        if (fills !== undefined) { this.fills = fills; }
        if (name !== undefined) { this.name = name; }
    }
    /**
     * The plane it is drawn in: its `origin`, its `normal` facing the reader and its X axis
     * `direction`. A text point and fills need one.
     * @default undefined
     * @optional true
     */
    plane?: Base.Frame | undefined;
    /**
     * Where its text is attached, inside the box of its lines and fills: a STEP file keeps this
     * point as the plane's origin. Left out, it is the plane's origin.
     * @default undefined
     * @optional true
     */
    textPoint?: Base.Point3 | undefined;
    /**
     * Its lines, each a polyline of two or more points, no two neighbours in one place.
     * @default undefined
     * @optional true
     */
    lines?: Base.Point3[][] | undefined;
    /**
     * Its filled marks: closed loops of three or more points in the plane, the first not repeated; a
     * loop inside another is a hole, and loops never cross.
     * @default undefined
     * @optional true
     */
    fills?: Base.Point3[][] | undefined;
    /**
     * The name readers show for it; left out, the item's own `name`.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
}

/**
 * A dimension for `assembly.manager.createPmiDimension` and `addDocumentPmi`: what it states, the
 * shapes it measures, and where its picture is drawn, in the part's own axes and units.
 * @beta
 */
export class PmiDimensionDto {
    constructor(type?: pmiDimensionTypeEnum, value?: number, shapeRefs?: PmiShapeDto[], otherShapeRefs?: PmiShapeDto[], upperTolerance?: number, lowerTolerance?: number, name?: string, start?: Base.Point3, end?: Base.Point3, normal?: Base.Vector3, direction?: Base.Vector3, offset?: number, textHeight?: number, decimalPlaces?: number, presentation?: PmiPresentationDto) {
        if (type !== undefined) { this.type = type; }
        if (value !== undefined) { this.value = value; }
        if (shapeRefs !== undefined) { this.shapeRefs = shapeRefs; }
        if (otherShapeRefs !== undefined) { this.otherShapeRefs = otherShapeRefs; }
        if (upperTolerance !== undefined) { this.upperTolerance = upperTolerance; }
        if (lowerTolerance !== undefined) { this.lowerTolerance = lowerTolerance; }
        if (name !== undefined) { this.name = name; }
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (normal !== undefined) { this.normal = normal; }
        if (direction !== undefined) { this.direction = direction; }
        if (offset !== undefined) { this.offset = offset; }
        if (textHeight !== undefined) { this.textHeight = textHeight; }
        if (decimalPlaces !== undefined) { this.decimalPlaces = decimalPlaces; }
        if (presentation !== undefined) { this.presentation = presentation; }
    }
    /**
     * What the dimension states; `linearDistance` and `angle` need `otherShapeRefs`, the sizes take
     * none.
     * @default linearDistance
     */
    type?: pmiDimensionTypeEnum | undefined = pmiDimensionTypeEnum.linearDistance;
    /**
     * The nominal value, in the document's length unit, or in degrees for an `angle`.
     * @default undefined
     * @minimum 0
     */
    value!: number;
    /**
     * The shapes it measures, or measures from, each a part and one face, edge or vertex of it.
     * @default undefined
     */
    shapeRefs!: PmiShapeDto[];
    /**
     * The shapes a `linearDistance` or an `angle` measures to; an empty list counts as none.
     * @default undefined
     * @optional true
     */
    otherShapeRefs?: PmiShapeDto[] | undefined;
    /**
     * How far above the value the measure may lie, in degrees for an `angle`. Left out with
     * `lowerTolerance`, there is no tolerance; left out alone, it is 0.
     * @default undefined
     * @optional true
     * @minimum 0
     */
    upperTolerance?: number | undefined;
    /**
     * How far below the value the measure may lie, as an amount. Left out with `upperTolerance`, the
     * dimension has no tolerance; left out alone, it is 0.
     * @default undefined
     * @optional true
     * @minimum 0
     */
    lowerTolerance?: number | undefined;
    /**
     * The name of the picture `start` and `end` draw, which readers show and `getDocumentAnnotations`
     * reads back; a `presentation` without a name of its own takes it.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * For `linearDistance` and `curveLength` the first point measured, for the others the center of
     * the circle or angle; without it and `end`, nothing is drawn.
     * @default undefined
     * @optional true
     */
    start?: Base.Point3 | undefined;
    /**
     * For `linearDistance` and `curveLength` the second point measured; for `diameter` and `radius` a
     * point of the circle; for an `angle` a point on its first arm, where the arc passes.
     * @default undefined
     * @optional true
     */
    end?: Base.Point3 | undefined;
    /**
     * The picture's plane normal, facing the reader; an angle turns counterclockwise about it. Left
     * out, +Z, or -Y when `start` to `end` runs along Z.
     * @default undefined
     * @optional true
     */
    normal?: Base.Vector3 | undefined;
    /**
     * For `linearDistance`, the direction the distance is measured along; left out, from `start` to
     * `end`. Other types ignore it.
     * @default undefined
     * @optional true
     */
    direction?: Base.Vector3 | undefined;
    /**
     * For `linearDistance` and `curveLength`, how far the dimension line stands from `start`, to the
     * left of the measured direction seen from `normal`; negative puts it right.
     * @default 10
     * @minimum -Infinity
     * @maximum Infinity
     */
    offset?: number | undefined = 10;
    /**
     * The height of the picture's digits, in the document's length unit; its arrows are as long.
     * @default 3.5
     * @minimum 0
     * @exclusiveMinimum true
     */
    textHeight?: number | undefined = 3.5;
    /**
     * How many decimals the picture writes the value with; trailing zeros are dropped.
     * @default 2
     * @minimum 0
     * @maximum 15
     * @step 1
     */
    decimalPlaces?: number | undefined = 2;
    /**
     * A presentation drawn by the caller, or an annotation read back, used instead of the picture
     * `start` and `end` draw; one with no lines and no fills counts as none.
     * @default undefined
     * @optional true
     */
    presentation?: PmiPresentationDto | undefined;
}

/**
 * A datum for `assembly.manager.createPmiDatum` and `addDocumentPmi`: its letter and the shapes it
 * is taken from. A tolerance added in the same call must refer to it.
 * @beta
 */
export class PmiDatumDto {
    constructor(letter?: string, shapeRefs?: PmiShapeDto[], name?: string, presentation?: PmiPresentationDto) {
        if (letter !== undefined) { this.letter = letter; }
        if (shapeRefs !== undefined) { this.shapeRefs = shapeRefs; }
        if (name !== undefined) { this.name = name; }
        if (presentation !== undefined) { this.presentation = presentation; }
    }
    /**
     * One to three capital letters, A to Z, naming one datum in the document; a letter it already
     * has is given again only on that datum's shapes.
     * @default A
     */
    letter?: string | undefined = "A";
    /**
     * The shapes the datum is taken from.
     * @default undefined
     */
    shapeRefs!: PmiShapeDto[];
    /**
     * The name of its `presentation`, when that has none of its own.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * A presentation drawn by the caller, or an annotation read back; left out, or with no lines and
     * no fills, the datum is written without one.
     * @default undefined
     * @optional true
     */
    presentation?: PmiPresentationDto | undefined;
}

/**
 * A geometric tolerance for `assembly.manager.createPmiTolerance` and `addDocumentPmi`: what it
 * controls, its value, the shapes it applies to and the datums it refers to.
 * @beta
 */
export class PmiToleranceDto {
    constructor(type?: pmiToleranceTypeEnum, value?: number, shapeRefs?: PmiShapeDto[], datumLetters?: string[], diameterZone?: boolean, material?: pmiMaterialConditionEnum, name?: string, presentation?: PmiPresentationDto) {
        if (type !== undefined) { this.type = type; }
        if (value !== undefined) { this.value = value; }
        if (shapeRefs !== undefined) { this.shapeRefs = shapeRefs; }
        if (datumLetters !== undefined) { this.datumLetters = datumLetters; }
        if (diameterZone !== undefined) { this.diameterZone = diameterZone; }
        if (material !== undefined) { this.material = material; }
        if (name !== undefined) { this.name = name; }
        if (presentation !== undefined) { this.presentation = presentation; }
    }
    /**
     * What the tolerance controls.
     * @default flatness
     */
    type?: pmiToleranceTypeEnum | undefined = pmiToleranceTypeEnum.flatness;
    /**
     * The width of its tolerance zone, in the document's length unit.
     * @default undefined
     * @minimum 0
     */
    value!: number;
    /**
     * The shapes it applies to.
     * @default undefined
     */
    shapeRefs!: PmiShapeDto[];
    /**
     * The letters of the datums it refers to, primary first, at most three, each given in the same
     * call, a datum the document has again on its own shapes.
     * @default undefined
     * @optional true
     */
    datumLetters?: string[] | undefined;
    /**
     * When true, the zone is a cylinder, written with the diameter sign before the value; only
     * `position`, `perpendicularity` and `parallelism` take it.
     * @default false
     */
    diameterZone?: boolean | undefined = false;
    /**
     * The material condition it applies at; only `position`, `perpendicularity` and `parallelism`
     * take one other than `none`.
     * @default none
     */
    material?: pmiMaterialConditionEnum | undefined = pmiMaterialConditionEnum.none;
    /**
     * The name of its `presentation`, when that has none of its own.
     * @default undefined
     * @optional true
     */
    name?: string | undefined;
    /**
     * A presentation drawn by the caller, or an annotation read back; left out, or with no lines and
     * no fills, the tolerance is written without one.
     * @default undefined
     * @optional true
     */
    presentation?: PmiPresentationDto | undefined;
}

/**
 * A document and the dimensions, datums and tolerances `assembly.manager.addDocumentPmi` adds to it,
 * all at once or none of them; what `assembly.query.getDocumentPmi` reads fits each list.
 * @beta
 */
export class AddDocumentPmiDto<T> {
    constructor(document?: T, dimensions?: PmiDimensionDto[], datums?: PmiDatumDto[], tolerances?: PmiToleranceDto[]) {
        if (document !== undefined) { this.document = document; }
        if (dimensions !== undefined) { this.dimensions = dimensions; }
        if (datums !== undefined) { this.datums = datums; }
        if (tolerances !== undefined) { this.tolerances = tolerances; }
    }
    /**
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
    /**
     * Dimensions to write, each from `createPmiDimension` or given as an object.
     * @default undefined
     * @optional true
     */
    dimensions?: PmiDimensionDto[] | undefined;
    /**
     * The datums to add; each must be referred to by one of `tolerances`.
     * @default undefined
     * @optional true
     */
    datums?: PmiDatumDto[] | undefined;
    /**
     * The geometric tolerances to add.
     * @default undefined
     * @optional true
     */
    tolerances?: PmiToleranceDto[] | undefined;
}

/**
 * A document whose dimensions, datums and tolerances `assembly.manager.removeDocumentPmi` removes.
 * @beta
 */
export class RemoveDocumentPmiDto<T> {
    constructor(document?: T) {
        if (document !== undefined) { this.document = document; }
    }
    /**
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
}
