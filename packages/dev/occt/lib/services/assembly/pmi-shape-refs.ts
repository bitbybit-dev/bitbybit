import type { BitbybitOcctModule, ClassHandle, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type * as Resolved from "../../api/resolved-inputs";
import { readKernelException } from "../../kernel-exception";
import type { SubShapeLookup } from "./pmi-types";

type Own = <T extends ClassHandle>(object: T) => T;
type SubShapeKind = Inputs.OCCT.pmiShapeKindEnum.face | Inputs.OCCT.pmiShapeKindEnum.edge | Inputs.OCCT.pmiShapeKindEnum.vertex;

const HASH_BOUND = 2147483647;
const ENTRY_SEPARATOR = ":";

export class PmiShapeNamer {
    private parts: ReadonlySet<string> | undefined;
    private readonly shapesAt = new Map<string, TopoDS_Shape | undefined>();
    private readonly lookups = new Map<string, SubShapeLookup>();

    constructor(private readonly occ: BitbybitOcctModule, private readonly document: Handle_TDocStd_Document, private readonly own: Own) { }

    refsOf(entries: readonly string[]): Resolved.OCCT.PmiShapeDto[] {
        const refs: Resolved.OCCT.PmiShapeDto[] = [];
        for (const entry of entries) {
            const ref = this.refOf(entry);
            if (ref === undefined) {
                return [];
            }
            refs.push(ref);
        }
        return refs;
    }

    private refOf(entry: string): Resolved.OCCT.PmiShapeDto | undefined {
        const parts = this.partLabels();
        if (parts.has(entry)) {
            return { part: entry, kind: Inputs.OCCT.pmiShapeKindEnum.part, index: 0 };
        }
        const part = this.partOf(entry, parts);
        const shape = part === undefined ? undefined : this.shapeAt(entry);
        const kind = shape === undefined ? undefined : this.kindOf(shape);
        if (part === undefined || shape === undefined || kind === undefined) {
            return undefined;
        }
        const lookup = this.lookupOf(part, kind);
        const index = lookup === undefined ? undefined : (lookup.byHash.get(this.occ.TopoDS_Shape_HashCode(shape, HASH_BOUND)) ?? []).find(candidate => lookup.shapes[candidate]!.IsSame(shape));
        return index === undefined ? undefined : { part, kind, index };
    }

    private partLabels(): ReadonlySet<string> {
        if (this.parts === undefined) {
            const listed = JSON.parse(this.occ.GetDocumentPartsFromDoc(this.document)) as Models.OCCT.DocumentPartInfo[];
            this.parts = new Set(listed.filter(info => info.type === "part").map(info => info.label));
        }
        return this.parts;
    }

    private partOf(entry: string, parts: ReadonlySet<string>): string | undefined {
        const tags = entry.split(ENTRY_SEPARATOR);
        for (let kept = tags.length - 1; kept > 0; kept -= 1) {
            const prefix = tags.slice(0, kept).join(ENTRY_SEPARATOR);
            if (parts.has(prefix)) {
                return prefix;
            }
        }
        return undefined;
    }

    private shapeAt(entry: string): TopoDS_Shape | undefined {
        if (this.shapesAt.has(entry)) {
            return this.shapesAt.get(entry);
        }
        let shape: TopoDS_Shape | undefined;
        try {
            shape = this.own(this.occ.GetShapeFromDocLabel(this.document, entry));
        } catch (thrown) {
            readKernelException(this.occ, thrown);
        }
        const readable = shape === undefined || shape.IsNull() ? undefined : shape;
        this.shapesAt.set(entry, readable);
        return readable;
    }

    private kindOf(shape: TopoDS_Shape): SubShapeKind | undefined {
        const type = shape.ShapeType();
        if (type === this.occ.TopAbs_ShapeEnum.FACE) {
            return Inputs.OCCT.pmiShapeKindEnum.face;
        }
        if (type === this.occ.TopAbs_ShapeEnum.EDGE) {
            return Inputs.OCCT.pmiShapeKindEnum.edge;
        }
        return type === this.occ.TopAbs_ShapeEnum.VERTEX ? Inputs.OCCT.pmiShapeKindEnum.vertex : undefined;
    }

    private lookupOf(part: string, kind: SubShapeKind): SubShapeLookup | undefined {
        const key = `${kind} ${part}`;
        const known = this.lookups.get(key);
        if (known !== undefined) {
            return known;
        }
        const shape = this.shapeAt(part);
        if (shape === undefined) {
            return undefined;
        }
        const listed = kind === Inputs.OCCT.pmiShapeKindEnum.face ? this.occ.FacesOf(shape, false)
            : kind === Inputs.OCCT.pmiShapeKindEnum.edge ? this.occ.EdgesOf(shape, true) : this.occ.VerticesOf(shape, false);
        const shapes: TopoDS_Shape[] = listed.map(entry => this.own(entry));
        const byHash = new Map<number, number[]>();
        shapes.forEach((entry, index) => {
            const hash = this.occ.TopoDS_Shape_HashCode(entry, HASH_BOUND);
            const bucket = byHash.get(hash);
            if (bucket === undefined) {
                byHash.set(hash, [index]);
            } else {
                bucket.push(index);
            }
        });
        const lookup = { shapes, byHash };
        this.lookups.set(key, lookup);
        return lookup;
    }
}
