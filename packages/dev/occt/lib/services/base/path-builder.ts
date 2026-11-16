import type { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { readKernelException } from "../../kernel-exception";
import { wasReadFromKernel } from "../../kernel-exception-reads";
import { checkedNumber, checkedPoint, checkedWithin } from "./input-checks";
import { LARGEST_KERNEL_COORDINATE } from "../svg-import.constants";

export interface Deletable {
    delete(): void;
}

export function deleteQuietly(handle: Deletable): void {
    try {
        handle.delete();
    } catch {
        return;
    }
}

export interface BuiltElement {
    shape: TopoDS_Shape;
    isFace: boolean;
}

export interface PathGroup {
    subpaths: Inputs.OCCT.PathSubpath[];
    makeFaces: boolean;
}

export interface PathBuildOptions {
    joinSegments: boolean;
    tolerance: number;
    warnings: string[];
    property?: string;
}

interface PlacedSubpath {
    start: Inputs.Base.Point3;
    closed: boolean;
    types: number[];
    data: number[];
}

const SEGMENT_LINE = 0;
const SEGMENT_QUADRATIC = 1;
const SEGMENT_CUBIC = 2;
const SEGMENT_ARC = 3;
const PATH_PROPERTY = "subpaths";

const isKernelNumber = (value: number): boolean => Math.abs(value) < LARGEST_KERNEL_COORDINATE;

const fitsKernel = (placed: PlacedSubpath): boolean =>
    isKernelNumber(placed.start[0]) && isKernelNumber(placed.start[1]) && isKernelNumber(placed.start[2]) && placed.data.every(isKernelNumber);

const leftOutWarning = (count: number): string =>
    `${count} subpath${count === 1 ? " reaches" : "s reach"} a coordinate that is not a number, or is ${LARGEST_KERNEL_COORDINATE.toExponential()} or more in size, once scaled and placed; ${count === 1 ? "it is" : "they are"} left out.`;

export class PathBuilder {
    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    private toCad(p: Inputs.Base.Point2, o: Resolved.OCCT.PathPlacementDto): Inputs.Base.Point3 {
        const x = p[0] * o.scale;
        const y = (o.flipY ? -p[1] : p[1]) * o.scale;
        return [o.origin[0] + x, o.origin[1] + y, o.origin[2]];
    }

    private placeArc(segment: Inputs.OCCT.PathArcSegment, o: Resolved.OCCT.PathPlacementDto): Resolved.OCCT.PathArcSegment {
        const arc = resolveDto(Inputs.OCCT.PathArcSegment, segment) as Resolved.OCCT.PathArcSegment;
        const sx = o.scale;
        const sy = o.flipY ? -o.scale : o.scale;
        const flip = o.flipY;
        return {
            type: "arc",
            to: [o.origin[0] + sx * arc.to[0], o.origin[1] + sy * arc.to[1]],
            center: [o.origin[0] + sx * arc.center[0], o.origin[1] + sy * arc.center[1]],
            rx: arc.rx * o.scale,
            ry: arc.ry * o.scale,
            xAxisRotation: flip ? -arc.xAxisRotation : arc.xAxisRotation,
            startAngle: flip ? -arc.startAngle : arc.startAngle,
            deltaAngle: flip ? -arc.deltaAngle : arc.deltaAngle,
        };
    }

    private placedSubpath(sp: Inputs.OCCT.PathSubpath, o: Resolved.OCCT.PathPlacementDto): PlacedSubpath {
        const pt = (p: Inputs.Base.Point2): Inputs.Base.Point3 => this.toCad(p, o);
        const types: number[] = [];
        const data: number[] = [];
        for (const seg of sp.segments) {
            switch (seg.type) {
                case "line": {
                    const e = pt(seg.to);
                    types.push(SEGMENT_LINE);
                    data.push(e[0], e[1]);
                    break;
                }
                case "quadratic": {
                    const c = pt(seg.c); const e = pt(seg.to);
                    types.push(SEGMENT_QUADRATIC);
                    data.push(c[0], c[1], e[0], e[1]);
                    break;
                }
                case "cubic": {
                    const c1 = pt(seg.c1); const c2 = pt(seg.c2); const e = pt(seg.to);
                    types.push(SEGMENT_CUBIC);
                    data.push(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
                    break;
                }
                case "arc": {
                    const a = this.placeArc(seg, o);
                    types.push(SEGMENT_ARC);
                    data.push(a.center[0], a.center[1], a.rx, a.ry, a.xAxisRotation, a.startAngle, a.deltaAngle, a.to[0], a.to[1]);
                    break;
                }
                default:
                    break;
            }
        }
        return { start: pt(sp.start), closed: sp.closed === true, types, data };
    }

    private placedGroups(groups: PathGroup[], o: Resolved.OCCT.PathPlacementDto, warnings: string[]): PlacedSubpath[][] {
        let leftOut = 0;
        const placed = groups.map((g) => g.subpaths.flatMap((sp) => {
            const subpath = this.placedSubpath(sp, o);
            if (fitsKernel(subpath)) { return [subpath]; }
            leftOut++;
            return [];
        }));
        if (leftOut > 0) { warnings.push(leftOutWarning(leftOut)); }
        return placed;
    }

    private builtCompound(groups: PathGroup[], placed: PlacedSubpath[][], z: number, opts: PathBuildOptions): TopoDS_Compound {
        const segTypes = new this.occ.VectorInt();
        const segData = new this.occ.VectorDouble();
        const subStarts = new this.occ.VectorDouble();
        const subSegCounts = new this.occ.VectorInt();
        const subClosed = new this.occ.VectorInt();
        const groupSubCounts = new this.occ.VectorInt();
        const groupMakeFace = new this.occ.VectorInt();
        try {
            placed.forEach((subpaths, g) => {
                groupSubCounts.push_back(subpaths.length);
                groupMakeFace.push_back(groups[g]!.makeFaces ? 1 : 0);
                for (const sp of subpaths) {
                    subStarts.push_back(sp.start[0]);
                    subStarts.push_back(sp.start[1]);
                    subSegCounts.push_back(sp.types.length);
                    subClosed.push_back(sp.closed ? 1 : 0);
                    sp.types.forEach((type) => segTypes.push_back(type));
                    sp.data.forEach((value) => segData.push_back(value));
                }
            });
            return this.occ.BuildShapesFromSegments(
                segTypes, segData, subStarts, subSegCounts, subClosed,
                groupSubCounts, groupMakeFace, z, opts.joinSegments, opts.tolerance
            );
        } catch (thrown) {
            const read = readKernelException(this.occ, thrown);
            throw wasReadFromKernel(read) ? new InputError(`The path could not be built: ${(read as Error).message}.`, opts.property ?? PATH_PROPERTY) : read;
        } finally {
            [segTypes, segData, subStarts, subSegCounts, subClosed, groupSubCounts, groupMakeFace]
                .forEach((v) => deleteQuietly(v));
        }
    }

    buildGroups(
        groups: PathGroup[],
        o: Resolved.OCCT.PathPlacementDto,
        opts: PathBuildOptions
    ): (BuiltElement | undefined)[] {
        if (groups.length === 0) { return []; }

        const placed = this.placedGroups(groups, o, opts.warnings);
        const compound = this.builtCompound(groups, placed, o.origin[2], opts);

        if (compound.IsNull()) {
            compound.delete();
            opts.warnings.push("Failed to build shapes from the supplied path.");
            return groups.map((): BuiltElement | undefined => undefined);
        }

        const out: (BuiltElement | undefined)[] = new Array(groups.length).fill(undefined);
        this.och.iteratorService.forEachShapeInCompound(compound, (i: number, child: TopoDS_Shape) => {
            if (i >= groups.length) { deleteQuietly(child); return; }
            const typed = this.och.converterService.getActualTypeOfShape(child);
            if (typed !== child) { deleteQuietly(child); }
            if (this.och.enumService.getShapeTypeEnum(typed) === Inputs.OCCT.shapeTypeEnum.compound && typed.NbChildren() === 0) {
                deleteQuietly(typed);
                return;
            }
            const isFace = this.och.enumService.getShapeTypeEnum(typed) === Inputs.OCCT.shapeTypeEnum.face;
            out[i] = { shape: typed, isFace };
        });
        compound.delete();
        return out;
    }

    shapeFromPath(inputs: Resolved.OCCT.ShapeFromPathDto): TopoDS_Shape | undefined {
        checkedNumber(inputs.scale, "scale");
        checkedPoint(inputs.origin, "origin");
        checkedWithin(inputs.tolerance, "tolerance", { atLeast: 0, below: LARGEST_KERNEL_COORDINATE });
        const warnings: string[] = [];
        const built = this.buildGroups([{ subpaths: inputs.subpaths, makeFaces: inputs.makeFaces }], inputs, {
            joinSegments: inputs.joinSegments,
            tolerance: inputs.tolerance,
            warnings,
        });
        return built[0]?.shape;
    }
}
