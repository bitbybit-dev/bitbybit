/**
 * Generic 2D-path -> OCCT geometry builder. SVG-agnostic: it consumes the
 * Inputs.OCCT path vocabulary (line / quadratic / cubic / arc) and builds wires
 * and (optionally) faces, placed into 3D CAD space.
 *
 * The whole group set is encoded into a single flat command buffer and built in
 * one native call (BuildShapesFromSegments): each segment becomes exact geometry
 * (low-degree bezier / rational-conic arc), each subpath is optionally
 * concatenated into one BSpline, and closed groups optionally become faces with
 * holes. The native call returns a compound with one child per group, in order.
 */

import { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

export interface BuiltElement {
    shape: TopoDS_Shape;
    isFace: boolean;
}

/** A group of subpaths that becomes one output shape (e.g. one SVG element). */
export interface PathGroup {
    subpaths: Inputs.OCCT.PathSubpath[];
    makeFaces: boolean;
}

export class PathBuilder {
    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /** Map a 2D path-space point into 3D CAD space per placement options. */
    private toCad(p: Inputs.Base.Point2, o: Inputs.OCCT.PathPlacementDto): Inputs.Base.Point3 {
        const x = p[0] * o.scale;
        const y = (o.flipY ? -p[1] : p[1]) * o.scale;
        return [o.origin[0] + x, o.origin[1] + y, o.origin[2]];
    }

    /** Apply uniform-scale + optional Y-flip + translate to an arc (analytic, exact). */
    private placeArc(arc: Inputs.OCCT.PathArcSegment, o: Inputs.OCCT.PathPlacementDto): Inputs.OCCT.PathArcSegment {
        const sx = o.scale;
        const sy = o.flipY ? -o.scale : o.scale;
        const flip = o.flipY;
        return {
            type: "arc",
            to: [o.origin[0] + sx * arc.to[0], o.origin[1] + sy * arc.to[1]],
            center: [o.origin[0] + sx * arc.center[0], o.origin[1] + sy * arc.center[1]],
            rx: arc.rx * o.scale,
            ry: arc.ry * o.scale,
            // A reflection across X negates the rotation and the angles (incl. sweep).
            xAxisRotation: flip ? -arc.xAxisRotation : arc.xAxisRotation,
            startAngle: flip ? -arc.startAngle : arc.startAngle,
            deltaAngle: flip ? -arc.deltaAngle : arc.deltaAngle,
        };
    }

    /**
     * Build one output shape per group in a single native call. Returns one entry
     * per input group, in order (undefined for a group that produced nothing).
     */
    buildGroups(
        groups: PathGroup[],
        o: Inputs.OCCT.PathPlacementDto,
        opts: { joinSegments: boolean; tolerance: number; warnings: string[] }
    ): (BuiltElement | undefined)[] {
        if (groups.length === 0) { return []; }

        const segTypes = new this.occ.VectorInt();
        const segData = new this.occ.VectorDouble();
        const subStarts = new this.occ.VectorDouble();
        const subSegCounts = new this.occ.VectorInt();
        const subClosed = new this.occ.VectorInt();
        const groupSubCounts = new this.occ.VectorInt();
        const groupMakeFace = new this.occ.VectorInt();

        const pt = (p: Inputs.Base.Point2): Inputs.Base.Point3 => this.toCad(p, o);

        for (const g of groups) {
            groupSubCounts.push_back(g.subpaths.length);
            groupMakeFace.push_back(g.makeFaces ? 1 : 0);
            for (const sp of g.subpaths) {
                const start = pt(sp.start);
                subStarts.push_back(start[0]);
                subStarts.push_back(start[1]);
                subSegCounts.push_back(sp.segments.length);
                subClosed.push_back(sp.closed ? 1 : 0);
                for (const seg of sp.segments) {
                    switch (seg.type) {
                        case "line": {
                            const e = pt(seg.to);
                            segTypes.push_back(0);
                            segData.push_back(e[0]); segData.push_back(e[1]);
                            break;
                        }
                        case "quadratic": {
                            const c = pt(seg.c); const e = pt(seg.to);
                            segTypes.push_back(1);
                            segData.push_back(c[0]); segData.push_back(c[1]);
                            segData.push_back(e[0]); segData.push_back(e[1]);
                            break;
                        }
                        case "cubic": {
                            const c1 = pt(seg.c1); const c2 = pt(seg.c2); const e = pt(seg.to);
                            segTypes.push_back(2);
                            segData.push_back(c1[0]); segData.push_back(c1[1]);
                            segData.push_back(c2[0]); segData.push_back(c2[1]);
                            segData.push_back(e[0]); segData.push_back(e[1]);
                            break;
                        }
                        case "arc": {
                            const a = this.placeArc(seg, o);
                            segTypes.push_back(3);
                            segData.push_back(a.center[0]); segData.push_back(a.center[1]);
                            segData.push_back(a.rx); segData.push_back(a.ry);
                            segData.push_back(a.xAxisRotation); segData.push_back(a.startAngle); segData.push_back(a.deltaAngle);
                            segData.push_back(a.to[0]); segData.push_back(a.to[1]);
                            break;
                        }
                        default:
                            break;
                    }
                }
            }
        }

        let compound: TopoDS_Compound | undefined;
        try {
            compound = this.occ.BuildShapesFromSegments(
                segTypes, segData, subStarts, subSegCounts, subClosed,
                groupSubCounts, groupMakeFace, o.origin[2], opts.joinSegments, opts.tolerance
            );
        } finally {
            [segTypes, segData, subStarts, subSegCounts, subClosed, groupSubCounts, groupMakeFace]
                .forEach((v) => { try { v.delete(); } catch { /* noop */ } });
        }

        if (!compound || compound.IsNull()) {
            opts.warnings.push("Failed to build shapes from the supplied path.");
            return groups.map(() => undefined);
        }

        // Decode: one child per group, in order. The child's shape type tells wire-vs-face.
        const out: (BuiltElement | undefined)[] = new Array(groups.length).fill(undefined);
        this.och.iteratorService.forEachShapeInCompound(compound, (i: number, child: TopoDS_Shape) => {
            if (i >= groups.length) { try { child.delete(); } catch { /* noop */ } return; }
            const typed = this.och.converterService.getActualTypeOfShape(child) as TopoDS_Shape;
            if (typed !== child) { try { child.delete(); } catch { /* noop */ } }
            const isFace = this.och.enumService.getShapeTypeEnum(typed) === Inputs.OCCT.shapeTypeEnum.face;
            out[i] = { shape: typed, isFace };
        });
        compound.delete();
        return out;
    }

    /** Public generic entry: build a single shape from a ShapeFromPathDto. */
    shapeFromPath(inputs: Inputs.OCCT.ShapeFromPathDto): TopoDS_Shape | undefined {
        const warnings: string[] = [];
        const built = this.buildGroups([{ subpaths: inputs.subpaths, makeFaces: inputs.makeFaces }], inputs, {
            joinSegments: inputs.joinSegments,
            tolerance: inputs.tolerance,
            warnings,
        });
        return built[0]?.shape;
    }
}
