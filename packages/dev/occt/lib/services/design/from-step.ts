import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { OCCTService } from "../../occ-service";
import { MAX_OCCURRENCES } from "./assembly";
import { release } from "./cache";
import { sha256 } from "./digest";
import { isKernelTrap } from "./problems";

type Node = Models.OCCT.AssemblyHierarchyNode;
type Rgba = Models.OCCT.LabelColorInfo;
type Component = Models.OCCT.DesignComponent;
type Matrix = Inputs.Base.TransformMatrix;

const HASH_BOUND = 2147483647;
const SQUARE_TOLERANCE = 1e-6;
const IDENTITY_TOLERANCE = 1e-12;
const DECIMALS = 1e10;
const CHANNEL = 255;
const HEX = 16;
const OPAQUE = 1;
const OPACITY_DECIMALS = 1e3;
const IMPORT_FEATURE = "shape";
const PART = "part";
const MEDIA_TYPE = "model/vnd.occt.brep";
const ASSET_DIGITS = 16;
const FILE_DIGITS = 8;
const FILE_BASE_LENGTH = 36;
const ID_LENGTH = 40;
const NAMES_LISTED = 5;
const TRANSLATOR_NAME = /^Open CASCADE STEP translator\b/;
const IDENTITY: Matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const UUID_VERSION = "8";
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT = 0x8;
const UUID_PIECES = /^(.{8})(.{4}).(.{3})(.)(.{3})(.{12})/;
const SIDE = 4;
const X_COLUMN = 0;
const Z_COLUMN = 2;
const TRANSLATION_COLUMN = 3;
const LAST_ROW = [X_COLUMN, X_COLUMN + 1, Z_COLUMN].map(index => index * SIDE + SIDE - 1);
const CORNER = 15;

interface Placement {
    label: string;
    name: string;
    definition: string;
    matrix: Matrix | undefined;
    visible: boolean;
}

interface Definition {
    label: string;
    name: string;
    assembly: boolean;
    placements: Placement[];
}

interface Look {
    color?: string;
    opacity?: number;
    edgeColor?: string;
    faces: Models.OCCT.DesignFaceAppearance[];
}

interface StepStructure {
    definitions: Map<string, Definition>;
    roots: Placement[];
    subShapes: Map<string, Node[]>;
    shownColours: Map<string, Rgba>;
}

interface ColourCount {
    colour: Rgba;
    count: number;
}

interface PartPlan {
    id: string;
    name: string;
    child: number;
    look: Look;
}

export interface StepImportOptions {
    name: string;
    seed: string;
    folder: string;
    maxOccurrences?: number;
}

export interface StepImportContext {
    occt: OCCTService;
    occ: BitbybitOcctModule;
}

function utf8(text: string): Uint8Array {
    return new TextEncoder().encode(text);
}

function tidy(value: number): number {
    const rounded = Math.round(value * DECIMALS) / DECIMALS;
    return Object.is(rounded, -0) ? 0 : rounded;
}

function dot(a: readonly number[], b: readonly number[]): number {
    return a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!;
}

function cross(a: readonly number[], b: readonly number[]): number[] {
    return [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];
}

function column(matrix: readonly number[], index: number): number[] {
    return [matrix[index * SIDE]!, matrix[index * SIDE + 1]!, matrix[index * SIDE + 2]!];
}

function isRigid(matrix: readonly number[]): boolean {
    const [x, y, z] = [column(matrix, X_COLUMN), column(matrix, X_COLUMN + 1), column(matrix, Z_COLUMN)];
    const unit = (vector: number[]): boolean => Math.abs(dot(vector, vector) - 1) <= SQUARE_TOLERANCE;
    const square = (a: number[], b: number[]): boolean => Math.abs(dot(a, b)) <= SQUARE_TOLERANCE;
    const affine = LAST_ROW.every(index => Math.abs(matrix[index]!) <= SQUARE_TOLERANCE) && Math.abs(matrix[CORNER]! - 1) <= SQUARE_TOLERANCE;
    return affine && unit(x) && unit(y) && unit(z) && square(x, y) && square(y, z) && square(x, z) && dot(cross(x, y), z) > 0;
}

function isIdentity(matrix: readonly number[] | undefined): boolean {
    return matrix === undefined || matrix.every((value, index) => Math.abs(value - IDENTITY[index]!) <= IDENTITY_TOLERANCE);
}

function multiplied(a: Matrix, b: Matrix): Matrix {
    return Array.from({ length: SIDE * SIDE }, (_, index) => {
        const row = index % SIDE;
        const col = Math.floor(index / SIDE);
        return Array.from({ length: SIDE }, (__, k) => a[row + SIDE * k]! * b[k + SIDE * col]!).reduce((sum, value) => sum + value, 0);
    }) as Matrix;
}

function frameOf(matrix: readonly number[]): Models.OCCT.DesignFrame {
    const triple = (values: number[]): Models.OCCT.DesignPoint => [tidy(values[0]!), tidy(values[1]!), tidy(values[2]!)];
    return { origin: triple(column(matrix, TRANSLATION_COLUMN)), normal: triple(column(matrix, Z_COLUMN)), direction: triple(column(matrix, X_COLUMN)) };
}

function hexOf(colour: Rgba): string {
    const channel = (value: number): string => Math.round(Math.min(1, Math.max(0, value)) * CHANNEL).toString(HEX).padStart(2, "0");
    return `#${channel(colour.r)}${channel(colour.g)}${channel(colour.b)}`;
}

function opacityOf(colour: Rgba): number | undefined {
    return colour.a < OPAQUE ? Math.round(Math.max(0, colour.a) * OPACITY_DECIMALS) / OPACITY_DECIMALS : undefined;
}

function uuidOf(text: string): string {
    const [, first, second, third, variantDigit, fourth, last] = UUID_PIECES.exec(sha256(utf8(text)))!;
    const variant = ((parseInt(variantDigit!, HEX) & UUID_VARIANT_MASK) | UUID_VARIANT).toString(HEX);
    return `${first}-${second}-${UUID_VERSION}${third}-${variant}${fourth}-${last}`;
}

function shownNameOf(name: string): string {
    return name.replace(/^.*[\\/]/, "").replace(/\.[^.]*$/, "").trim();
}

function fileBaseOf(name: string): string {
    const base = shownNameOf(name);
    const cleaned = base.replace(/[^A-Za-z0-9 _()-]+/g, "-").replace(/-{2,}/g, "-").replace(/^[-\s]+|[-\s]+$/g, "").slice(0, FILE_BASE_LENGTH).trim();
    return cleaned === "" ? "step" : cleaned;
}

function idOf(name: string, taken: Set<string>): string {
    const cleaned = name.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "").slice(0, ID_LENGTH);
    const base = cleaned === "" ? "component" : /^[A-Za-z_]/.test(cleaned) ? cleaned : `c_${cleaned}`;
    let id = base;
    for (let index = 2; taken.has(id); index++) {
        id = `${base}_${index}`;
    }
    taken.add(id);
    return id;
}

function colourCounts(colours: readonly Rgba[]): ColourCount[] {
    const counts = new Map<string, ColourCount>();
    colours.forEach(colour => {
        const key = `${hexOf(colour)} ${opacityOf(colour) ?? OPAQUE}`;
        const entry = counts.get(key) ?? { colour, count: 0 };
        counts.set(key, { colour: entry.colour, count: entry.count + 1 });
    });
    return [...counts.values()].sort((a, b) => b.count - a.count);
}

function mostCommon(colours: readonly Rgba[]): Rgba | undefined {
    return colourCounts(colours)[0]?.colour;
}

function heldByMost(colours: readonly Rgba[], of: number): Rgba | undefined {
    const top = colourCounts(colours)[0];
    return top !== undefined && top.count * 2 > of ? top.colour : undefined;
}

function recoloured(look: Look, colour: Rgba): Look {
    const opacity = opacityOf(colour);
    return { faces: look.faces, color: hexOf(colour), ...opacity === undefined ? {} : { opacity }, ...look.edgeColor === undefined ? {} : { edgeColor: hexOf(colour) } };
}

function listed(names: readonly string[]): string {
    const named = [...new Set(names.filter(name => name !== ""))];
    if (named.length === 0) {
        return "";
    }
    const shown = named.slice(0, NAMES_LISTED).map(name => `"${name}"`).join(", ");
    return `: ${named.length > NAMES_LISTED ? `${shown} and ${named.length - NAMES_LISTED} more` : shown}`;
}

function given(name: string | undefined): string {
    const trimmed = (name ?? "").trim();
    return TRANSLATOR_NAME.test(trimmed) ? "" : trimmed;
}

function structureOf(nodes: readonly Node[]): StepStructure {
    const byId = new Map<string, Node>();
    nodes.forEach(node => {
        if (!byId.has(node.id)) {
            byId.set(node.id, node);
        }
    });
    const definitions = new Map<string, Definition>();
    const define = (label: string, name: string, assembly: boolean): Definition => {
        let definition = definitions.get(label);
        if (definition === undefined) {
            definition = { label, name, assembly, placements: [] };
            definitions.set(label, definition);
        }
        return definition;
    };
    const roots: Placement[] = [];
    const placed = new Set<string>();
    const subShapes = new Map<string, Node[]>();
    const subShapeSeen = new Set<string>();
    const shownColours = new Map<string, Rgba>();
    nodes.forEach(node => {
        if (node.isSubShape) {
            if (!subShapeSeen.has(node.id) && node.colorRgba !== undefined) {
                subShapeSeen.add(node.id);
                const owner = node.id.slice(0, node.id.lastIndexOf(":"));
                const held = subShapes.get(owner);
                if (held === undefined) {
                    subShapes.set(owner, [node]);
                } else {
                    held.push(node);
                }
            }
            return;
        }
        const shown = node.definitionId ?? node.id;
        if (node.colorRgba !== undefined && !shownColours.has(shown)) {
            shownColours.set(shown, { hasColor: true, ...node.colorRgba });
        }
        if (node.parentId === undefined) {
            define(node.id, given(node.name), node.isAssembly);
            roots.push({ label: node.id, name: given(node.name), definition: node.id, matrix: node.transform, visible: node.visible });
            return;
        }
        const parent = byId.get(node.parentId);
        const container = parent?.isInstance === true ? parent.definitionId : parent?.id;
        if (!node.isInstance || node.definitionId === undefined || container === undefined || placed.has(`${container} ${node.id}`)) {
            return;
        }
        placed.add(`${container} ${node.id}`);
        define(node.definitionId, given(node.definitionName ?? node.name), node.refersToAssembly === true);
        definitions.get(container)?.placements.push({ label: node.id, name: given(node.name), definition: node.definitionId, matrix: node.transform, visible: node.visible });
    });
    return { definitions, roots, subShapes, shownColours };
}

class StepImport {
    private readonly shapes = new Map<string, TopoDS_Shape | null>();
    private readonly looks = new Map<string, Look>();
    private readonly children: TopoDS_Shape[] = [];
    private readonly owned: TopoDS_Shape[] = [];
    private readonly childOfKey = new Map<string, number>();
    private readonly parts = new Map<string, PartPlan>();
    private readonly assemblies = new Map<string, Models.OCCT.DesignAssemblyDocument | null>();
    private readonly empty = new Map<string, string>();
    private readonly emptyAssemblies = new Map<string, string>();
    private baked = 0;
    private hidden = 0;
    private colouredAssemblies = 0;

    constructor(
        private readonly document: Handle_TDocStd_Document,
        private readonly definitions: ReadonlyMap<string, Definition>,
        private readonly subShapes: ReadonlyMap<string, Node[]>,
        private readonly shownColours: ReadonlyMap<string, Rgba>,
        private readonly context: StepImportContext,
        private readonly idSeed: string,
    ) {}

    rootOf(roots: Placement[], fileName: string): string {
        const only = roots.length === 1 ? roots[0]! : undefined;
        if (only !== undefined && isIdentity(only.matrix)) {
            const definition = this.definitions.get(only.definition)!;
            if (definition.name === "") {
                definition.name = fileName;
            }
            const id = definition.assembly ? this.assemblyOf(definition) : this.partOf(definition, undefined, undefined);
            if (id === undefined) {
                throw new InputError("The STEP file holds no shape to make a design document of.", "step");
            }
            return id;
        }
        const id = this.assemblyOf({ label: "file", name: fileName, assembly: true, placements: roots });
        if (id === undefined) {
            throw new InputError("The STEP file holds no shape to make a design document of.", "step");
        }
        return id;
    }

    assemblyDocuments(): Models.OCCT.DesignAssemblyDocument[] {
        return [...this.assemblies.values()].filter((document): document is Models.OCCT.DesignAssemblyDocument => document !== null);
    }

    partDocuments(asset: Models.OCCT.DesignAsset): Models.OCCT.DesignPartDocument[] {
        return [...this.parts.values()].map(plan => {
            const appearance: Models.OCCT.DesignAppearance = {
                ...plan.look.color === undefined ? {} : { color: plan.look.color },
                ...plan.look.opacity === undefined ? {} : { opacity: plan.look.opacity },
                ...plan.look.edgeColor === undefined ? {} : { edgeColor: plan.look.edgeColor },
                ...plan.look.faces.length === 0 ? {} : { faces: plan.look.faces },
            };
            const part: Models.OCCT.DesignPart = { id: PART, name: plan.name, body: IMPORT_FEATURE, ...Object.keys(appearance).length === 0 ? {} : { appearance } };
            return {
                schemaVersion: 1, kind: "part", id: plan.id, units: { length: "mm" }, up: "z", meta: { name: plan.name },
                features: [{ id: IMPORT_FEATURE, type: "import", asset: asset.id, format: "brep-binary", child: plan.child }],
                parts: [part],
                assets: [asset],
            };
        });
    }

    shapesFile(): Uint8Array {
        const compound = this.context.occt.shapes.compound.makeCompound({ shapes: this.children });
        try {
            return this.context.occt.io.saveShapeBrepBinary({ shape: compound, withTriangulation: false });
        } finally {
            release(compound);
        }
    }

    notes(): string[] {
        const notes: string[] = [];
        if (this.baked > 0) {
            notes.push(`${this.baked === 1 ? "A placement that mirrors or scales its part was" : `${this.baked} placements that mirror or scale their parts were`} built into ${this.baked === 1 ? "a part of its own" : "parts of their own"}, since a frame only moves and turns.`);
        }
        if (this.hidden > 0) {
            notes.push(`${this.hidden === 1 ? "A hidden placement is" : `${this.hidden} hidden placements are`} suppressed.`);
        }
        if (this.empty.size > 0) {
            notes.push(`${this.empty.size === 1 ? "A part holds" : `${this.empty.size} parts hold`} no shape and ${this.empty.size === 1 ? "was" : "were"} left out${listed([...this.empty.values()])}.`);
        }
        if (this.emptyAssemblies.size > 0) {
            notes.push(`${this.emptyAssemblies.size === 1 ? "An assembly places" : `${this.emptyAssemblies.size} assemblies place`} nothing and ${this.emptyAssemblies.size === 1 ? "was" : "were"} left out${listed([...this.emptyAssemblies.values()])}.`);
        }
        if (this.colouredAssemblies > 0) {
            notes.push(`The colour ${this.colouredAssemblies === 1 ? "a placed assembly is" : `${this.colouredAssemblies} placed assemblies are`} given is left out; the parts keep their own.`);
        }
        return notes;
    }

    release(): void {
        this.owned.forEach(release);
        this.shapes.forEach(shape => {
            if (shape !== null) {
                release(shape);
            }
        });
    }

    private assemblyOf(definition: Definition): string | undefined {
        const known = this.assemblies.get(definition.label);
        if (known !== undefined) {
            return known?.id;
        }
        const taken = new Set<string>();
        const components = definition.placements.flatMap(placement => this.componentsOf(placement, taken));
        if (components.length === 0) {
            this.assemblies.set(definition.label, null);
            this.emptyAssemblies.set(definition.label, definition.name);
            return undefined;
        }
        const document: Models.OCCT.DesignAssemblyDocument = {
            schemaVersion: 1, kind: "assembly", id: uuidOf(`${this.idSeed} assembly ${definition.label}`), units: { length: "mm" }, up: "z",
            meta: { name: definition.name === "" ? "Assembly" : definition.name }, components,
        };
        this.assemblies.set(definition.label, document);
        return document.id;
    }

    private componentsOf(placement: Placement, taken: Set<string>): Component[] {
        const definition = this.definitions.get(placement.definition)!;
        if (placement.matrix !== undefined && !isRigid(placement.matrix)) {
            return this.bakedComponents(definition, placement, placement.matrix, taken);
        }
        let source: Models.OCCT.DesignComponentSource | undefined;
        if (definition.assembly) {
            if (this.context.occt.assembly.query.getLabelColor({ document: this.document, label: placement.label }).hasColor) {
                this.colouredAssemblies++;
            }
            const document = this.assemblyOf(definition);
            source = document === undefined ? undefined : { document };
        } else {
            const document = this.partOf(definition, this.ownColour(placement), undefined);
            source = document === undefined ? undefined : { document, part: PART };
        }
        if (source === undefined) {
            return [];
        }
        const at = placement.matrix === undefined || isIdentity(placement.matrix) ? undefined : frameOf(placement.matrix);
        return [this.component(placement, source, at, taken)];
    }

    private bakedComponents(definition: Definition, placement: Placement, matrix: Matrix, taken: Set<string>): Component[] {
        if (isRigid(matrix)) {
            return this.componentsOf({ ...placement, matrix }, taken);
        }
        if (!definition.assembly) {
            const document = this.partOf(definition, this.ownColour(placement), matrix);
            if (document === undefined) {
                return [];
            }
            this.baked++;
            return [this.component(placement, { document, part: PART }, undefined, taken)];
        }
        return definition.placements.flatMap(inner => {
            const innerDefinition = this.definitions.get(inner.definition)!;
            const named = { ...inner, name: `${placement.name} ${inner.name}`, visible: placement.visible && inner.visible };
            return this.bakedComponents(innerDefinition, named, multiplied(matrix, inner.matrix ?? IDENTITY), taken);
        });
    }

    private component(placement: Placement, source: Models.OCCT.DesignComponentSource, at: Models.OCCT.DesignFrame | undefined, taken: Set<string>): Component {
        if (!placement.visible) {
            this.hidden++;
        }
        return {
            id: idOf(placement.name, taken), ...placement.name === "" ? {} : { name: placement.name }, source,
            ...at === undefined ? {} : { at }, ...placement.visible ? {} : { suppressed: true },
        };
    }

    private ownColour(placement: Placement): Rgba | undefined {
        if (placement.label === placement.definition) {
            return undefined;
        }
        const colour = this.context.occt.assembly.query.getLabelColor({ document: this.document, label: placement.label });
        return colour.hasColor ? colour : undefined;
    }

    private partOf(definition: Definition, colour: Rgba | undefined, matrix: Matrix | undefined): string | undefined {
        const variant = `${colour === undefined ? "" : `${hexOf(colour)}/${colour.a}`} ${matrix === undefined ? "" : matrix.map(tidy).join(",")}`;
        const key = `${definition.label} ${variant}`;
        const known = this.parts.get(key);
        if (known !== undefined) {
            return known.id;
        }
        const child = this.childOf(definition, matrix);
        if (child === undefined) {
            return undefined;
        }
        const look = this.lookOf(definition);
        const name = definition.name === "" ? "Part" : definition.name;
        const plan: PartPlan = {
            id: uuidOf(`${this.idSeed} part ${key}`), name, child,
            look: colour === undefined ? look : recoloured(look, colour),
        };
        this.parts.set(key, plan);
        return plan.id;
    }

    private shapeOf(definition: Definition): TopoDS_Shape | null {
        if (!this.shapes.has(definition.label)) {
            const shape = this.context.occt.assembly.query.getShapeFromLabel({ document: this.document, label: definition.label });
            const holdsGeometry = !shape.IsNull() && this.context.occ.CountSubShapes(shape, this.context.occ.TopAbs_ShapeEnum.EDGE, false) > 0;
            if (!holdsGeometry) {
                release(shape);
            }
            this.shapes.set(definition.label, holdsGeometry ? shape : null);
        }
        return this.shapes.get(definition.label)!;
    }

    private childOf(definition: Definition, matrix: Matrix | undefined): number | undefined {
        const key = `${definition.label} ${matrix === undefined ? "" : matrix.map(tidy).join(",")}`;
        const known = this.childOfKey.get(key);
        if (known !== undefined) {
            return known;
        }
        const shape = this.shapeOf(definition);
        if (shape === null) {
            this.empty.set(definition.label, definition.name);
            return undefined;
        }
        if (matrix === undefined) {
            this.children.push(shape);
        } else {
            const baked = this.context.occt.transforms.transformByMatrix({ shape, transformation: [matrix] });
            this.owned.push(baked);
            this.children.push(baked);
        }
        this.childOfKey.set(key, this.children.length - 1);
        return this.children.length - 1;
    }

    private lookOf(definition: Definition): Look {
        const known = this.looks.get(definition.label);
        if (known !== undefined) {
            return known;
        }
        const own = this.context.occt.assembly.query.getLabelColor({ document: this.document, label: definition.label });
        const shape = this.shapeOf(definition);
        const faceCount = shape === null ? 0 : this.context.occ.CountSubShapes(shape, this.context.occ.TopAbs_ShapeEnum.FACE, false);
        const edgesOnly = shape !== null && faceCount === 0;
        const faceColours = this.faceColours(definition);
        const subShapeColours = (this.subShapes.get(definition.label) ?? []).flatMap(node => node.colorRgba === undefined ? [] : [{ hasColor: true, ...node.colorRgba }]);
        const main = own.hasColor ? own
            : edgesOnly ? mostCommon(subShapeColours) ?? this.shownColours.get(definition.label)
                : heldByMost([...faceColours.values()], faceCount);
        const color = main === undefined ? undefined : hexOf(main);
        const opacity = main === undefined ? undefined : opacityOf(main);
        const faces: Models.OCCT.DesignFaceAppearance[] = [];
        [...faceColours.entries()].sort((a, b) => a[0] - b[0]).forEach(([index, colour]) => {
            const faceOpacity = opacityOf(colour);
            if (hexOf(colour) !== color || faceOpacity !== opacity) {
                faces.push({ faces: { of: IMPORT_FEATURE, role: "face", from: String(index) }, color: hexOf(colour), ...faceOpacity === undefined ? {} : { opacity: faceOpacity } });
            }
        });
        const look: Look = { ...color === undefined ? {} : { color }, ...opacity === undefined ? {} : { opacity }, ...edgesOnly && color !== undefined ? { edgeColor: color } : {}, faces };
        this.looks.set(definition.label, look);
        return look;
    }

    private faceColours(definition: Definition): Map<number, Rgba> {
        const coloured = new Map<number, Rgba>();
        const subShapes = this.subShapes.get(definition.label) ?? [];
        const shape = subShapes.length === 0 ? null : this.shapeOf(definition);
        if (shape === null) {
            return coloured;
        }
        const occt = this.context.occt;
        const faces = occt.shapes.face.getFaces({ shape });
        try {
            const byHash = new Map<number, number[]>();
            faces.forEach((face, index) => {
                const hash = this.context.occ.TopoDS_Shape_HashCode(face, HASH_BOUND);
                const sharing = byHash.get(hash);
                if (sharing === undefined) {
                    byHash.set(hash, [index]);
                } else {
                    sharing.push(index);
                }
            });
            const located = subShapes.map(node => {
                const subShape = occt.assembly.query.getShapeFromLabel({ document: this.document, label: node.id });
                const subFaces = subShape.IsNull() ? [] : occt.shapes.face.getFaces({ shape: subShape });
                const indexes = subFaces.flatMap(subFace => {
                    const found = (byHash.get(this.context.occ.TopoDS_Shape_HashCode(subFace, HASH_BOUND)) ?? []).filter(index => faces[index]!.IsSame(subFace));
                    release(subFace);
                    return found;
                });
                release(subShape);
                const colour = occt.assembly.query.getLabelColor({ document: this.document, label: node.id });
                return { indexes, colour };
            });
            located.filter(entry => entry.colour.hasColor).sort((a, b) => b.indexes.length - a.indexes.length).forEach(entry => entry.indexes.forEach(index => coloured.set(index, entry.colour)));
        } finally {
            faces.forEach(release);
        }
        return coloured;
    }
}

function placementsIn(document: Handle_TDocStd_Document, context: StepImportContext, limit: number): number {
    const query = context.occt.assembly.query;
    const counted = new Map<string, number>();
    const count = (label: string): number => {
        const known = counted.get(label);
        if (known !== undefined) {
            return known;
        }
        const info = query.getLabelInfo({ document, label });
        const total = !info.isAssembly ? 0 : (info.children ?? []).reduce((sum, child) => {
            const placed = query.getLabelInfo({ document, label: child }).refLabel;
            return Math.min(limit + 1, sum + 1 + (placed === undefined ? 0 : count(placed)));
        }, 0);
        counted.set(label, total);
        return total;
    };
    return query.getDocumentParts({ document }).filter(part => part.isFree).reduce((sum, part) => Math.min(limit + 1, sum + Math.max(1, count(part.label))), 0);
}

function stepDocument(bytes: Uint8Array, context: StepImportContext): Handle_TDocStd_Document {
    try {
        return context.occt.assembly.manager.loadStepToDoc({ stepData: bytes });
    } catch (error) {
        if (isKernelTrap(error)) {
            throw error;
        }
        throw new InputError(`The file could not be read as STEP${error instanceof Error ? ` (${error.message})` : ""}.`, "step");
    }
}

/**
 * Turns a STEP file into design documents: a part document per part, an assembly document per
 * assembly, and one shapes file, a binary BREP compound of every part's shape, that the part
 * documents import by `child`.
 */
export function documentsFromStep(step: string | Uint8Array | ArrayBuffer, options: StepImportOptions, context: StepImportContext): Models.OCCT.DesignFromStep {
    const bytes = typeof step === "string" ? utf8(step) : step instanceof Uint8Array ? step : new Uint8Array(step);
    if (bytes.length === 0) {
        throw new InputError("The STEP file is empty.", "step");
    }
    const digest = sha256(bytes);
    const document = stepDocument(bytes, context);
    let made: StepImport | undefined;
    try {
        const limit = options.maxOccurrences ?? MAX_OCCURRENCES;
        if (placementsIn(document, context, limit) > limit) {
            throw new InputError(`The STEP file places more than ${limit.toLocaleString("en")} parts, more than a design builds; split it into smaller files.`, "step");
        }
        const { definitions, roots, subShapes, shownColours } = structureOf(context.occt.assembly.query.getAssemblyHierarchy({ document }).nodes);
        if (roots.length === 0) {
            throw new InputError("The STEP file holds no shape to make a design document of.", "step");
        }
        made = new StepImport(document, definitions, subShapes, shownColours, context, `${digest} ${options.seed}`);
        const fileBase = fileBaseOf(options.name);
        const root = made.rootOf(roots, shownNameOf(options.name) || fileBase);
        const data = made.shapesFile();
        const fileDigest = sha256(data);
        const folder = options.folder === "" || options.folder.endsWith("/") ? options.folder : `${options.folder}/`;
        const asset: Models.OCCT.DesignAsset = { id: `step_${fileDigest.slice(0, ASSET_DIGITS)}`, uri: `${folder}${fileBase}-${fileDigest.slice(0, FILE_DIGITS)}.brep`, sha256: fileDigest, mediaType: MEDIA_TYPE };
        const assemblies = made.assemblyDocuments();
        const parts = made.partDocuments(asset);
        const documents: Models.OCCT.DesignDocument[] = [...assemblies, ...parts];
        const ordered = [...documents.filter(entry => entry.id === root), ...documents.filter(entry => entry.id !== root)];
        return {
            root,
            documents: ordered,
            assets: [{ id: asset.id, uri: asset.uri, sha256: fileDigest, mediaType: MEDIA_TYPE, data }],
            report: { parts: parts.length, assemblies: assemblies.length, components: assemblies.reduce((sum, entry) => sum + entry.components.length, 0), notes: made.notes() },
        };
    } finally {
        made?.release();
        document.delete();
    }
}
