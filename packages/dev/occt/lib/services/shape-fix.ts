import type { OccHelper } from "../occ-helper";
import type { BitbybitOcctModule, TopoDS_Compound, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";
import type * as Models from "../api/models";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../api/resolved-inputs";
import { checkedNumber, checkedShape, checkedShapes } from "./base/input-checks";

const FAULT_TYPES: Readonly<Record<string, Inputs.OCCT.shapeTypeEnum>> = {
    vertex: Inputs.OCCT.shapeTypeEnum.vertex,
    edge: Inputs.OCCT.shapeTypeEnum.edge,
    wire: Inputs.OCCT.shapeTypeEnum.wire,
    face: Inputs.OCCT.shapeTypeEnum.face,
    shell: Inputs.OCCT.shapeTypeEnum.shell,
    solid: Inputs.OCCT.shapeTypeEnum.solid,
    compsolid: Inputs.OCCT.shapeTypeEnum.compSolid,
    compound: Inputs.OCCT.shapeTypeEnum.compound,
    shape: Inputs.OCCT.shapeTypeEnum.shape,
};

const HASH_BOUND = 2147483647;

/**
 * Checks and repairs for OpenCascade shapes that came out of a file or an operation with defects:
 * gaps between edges, edges too short to matter, faces turned the wrong way, shells left open,
 * tolerances that drifted. `isValid` tells whether a shape is well formed, `validityReport` says what
 * is wrong and where, and `freeBoundaries` shows the rims of openings; `basicShapeRepair` is the
 * general fix, the shell, solid and sewing fixes and the wire fixes handle the rest. Every repair
 * returns a new shape.
 */
export class OCCTShapeFix {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Runs the kernel's general repair over a shape: closes small gaps, fixes wire and face defects
     * and brings tolerances into the given range.
     *
     * `precision` is the size of defect to look for, `minTolerance` and `maxTolerance` bound the
     * tolerances the repaired shape may carry, all in model units. Try it first on any shape that
     * fails `isValid`.
     * @param inputs - The shape and the precision and tolerance bounds
     * @returns The repaired shape
     * @group shape
     * @shortname basic shape repair
     * @drawable true
     * @example
     * ```typescript
     * const fixed = await bitbybit.occt.shapeFix.basicShapeRepair({ shape: imported, precision: 0.001, maxTolerance: 0.01, minTolerance: 0.0001 });
     * ```
     */
    basicShapeRepair(inputs: Inputs.OCCT.BasicShapeRepairDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.BasicShapeRepairDto, inputs) as Resolved.OCCT.BasicShapeRepairDto<TopoDS_Shape>;
        const shapeFix = new this.occ.ShapeFix_Shape();
        shapeFix.Init(resolved.shape);
        shapeFix.SetPrecision(resolved.precision);
        shapeFix.SetMaxTolerance(resolved.maxTolerance);
        shapeFix.SetMinTolerance(resolved.minTolerance);
        shapeFix.Perform();
        const result = shapeFix.Shape();
        shapeFix.delete();
        return result;
    }

    /**
     * Removes edges shorter than `precsmall` from a wire and closes the gaps they leave, so a tiny
     * sliver no longer breaks a fillet or a face.
     *
     * With `lockvtx` true the existing vertices are kept in place; otherwise they may move to close
     * the gap. A `precsmall` of 0 uses the wire's own tolerance.
     * @param inputs - The wire, whether to keep vertices fixed and the length below which an edge counts as small
     * @returns The cleaned wire
     * @group wire
     * @shortname fix small edge
     * @drawable true
     * @example
     * ```typescript
     * const clean = await bitbybit.occt.shapeFix.fixSmallEdgeOnWire({ shape: wire, lockvtx: false, precsmall: 0.001 });
     * ```
     */
    fixSmallEdgeOnWire(inputs: Inputs.OCCT.FixSmallEdgesInWireDto<TopoDS_Wire>): TopoDS_Wire {
        const resolved = resolveDto(Inputs.OCCT.FixSmallEdgesInWireDto, inputs) as Resolved.OCCT.FixSmallEdgesInWireDto<TopoDS_Wire>;
        const wireFix = new this.occ.ShapeFix_Wire();
        wireFix.Load(resolved.shape);
        wireFix.FixSmall(resolved.lockvtx, resolved.precsmall);
        wireFix.Perform();
        const result = wireFix.Wire();
        wireFix.delete();
        return result;
    }

    /**
     * Rebuilds a wire so its edges run head to tail in one direction along it.
     *
     * A wire assembled from loose edges can hold edges pointing against the flow; this walks the
     * wire in order and joins the edges again the right way round, which some operations need.
     * @param inputs - The wire
     * @returns The wire with consistently oriented edges
     * @group wire
     * @shortname fix edge orientations
     * @drawable true
     * @example
     * ```typescript
     * const ordered = await bitbybit.occt.shapeFix.fixEdgeOrientationsAlongWire({ shape: wire });
     * ```
     */
    fixEdgeOrientationsAlongWire(inputs: Inputs.OCCT.ShapeDto<TopoDS_Wire>): TopoDS_Wire {
        return this.och.edgesService.fixEdgeOrientationsAlongWire(inputs);
    }

    /**
     * Tells whether the shape is well formed, which a successful operation does not always guarantee.
     *
     * It checks that edges lie on their faces, wires and shells close, and tolerances agree. A fillet
     * too large for its faces fails; a shape passing through itself, such as a pipe wider than its
     * bends, passes. Large parts take a few hundred milliseconds.
     * @param inputs - The shape
     * @returns True when the shape is well formed
     * @group shape
     * @shortname is valid
     * @drawable false
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10 });
     * const rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 6 });
     * const wellFormed = await bitbybit.occt.shapeFix.isValid({ shape: rounded });
     * ```
     */
    isValid(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): boolean {
        return this.occ.ShapeIsValid(inputs.shape);
    }

    /**
     * Checks a shape as `isValid` does and reports each faulty sub-shape with the checks
     * it fails, and the spread of its tolerances.
     *
     * A fault's index is the one the getter of its kind uses: `shapes.face.getFace` with a face
     * fault's index gives that face. Overlapping faces are not looked for;
     * `analysis.clashes.selfIntersections` finds those.
     * @param inputs - The shape to check
     * @returns Whether the shape is valid, its faults and its smallest, largest and average tolerance
     * @group shape
     * @shortname validity report
     * @drawable false
     * @example
     * ```typescript
     * const report = await bitbybit.occt.shapeFix.validityReport({ shape: imported });
     * const badFaces = report.faults.filter(fault => fault.type === Bit.Inputs.OCCT.shapeTypeEnum.face).map(fault => fault.index);
     * ```
     */
    validityReport(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Models.OCCT.ValidityReport {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const report = this.occ.ValidityReport(shape);
        const numberings = new Map<string, number[]>();
        const getterIndex = (type: string, distinctIndex: number): number => {
            if (type === "edge" || type === "compsolid" || type === "compound" || type === "shape") {
                return distinctIndex;
            }
            const numbering = numberings.get(type) ?? this.firstOccurrences(shape, type);
            numberings.set(type, numbering);
            return numbering[distinctIndex] ?? distinctIndex;
        };
        return {
            isValid: report.isValid,
            faults: report.faults.map(fault => ({
                type: FAULT_TYPES[fault.type] ?? Inputs.OCCT.shapeTypeEnum.unknown,
                index: getterIndex(fault.type, fault.index),
                statuses: [...fault.statuses],
            })),
            minTolerance: report.minTolerance,
            maxTolerance: report.maxTolerance,
            averageTolerance: report.averageTolerance,
        };
    }

    /**
     * Finds the edges of a shape that bound only one face, joined into wires: the rims of an open
     * shell's openings, or a lone face's outline and holes.
     *
     * Wires that close on themselves come back in `closed`, the rest in `open`; a closed solid has
     * none. Edges closer than `tolerance`, in model units, count as one.
     * @param inputs - The shape and the tolerance
     * @returns Two compounds of wires, the closed and the open ones
     * @group shape
     * @shortname free boundaries
     * @drawable false
     * @example
     * ```typescript
     * const rims = await bitbybit.occt.shapeFix.freeBoundaries({ shape: openShell, tolerance: 1e-7 });
     * const holes = await bitbybit.occt.shapes.wire.getWires({ shape: rims.closed });
     * ```
     */
    freeBoundaries(inputs: Inputs.OCCT.ShapeWithToleranceDto<TopoDS_Shape>): Models.OCCT.FreeBoundaries<TopoDS_Compound> {
        const resolved = resolveDto(Inputs.OCCT.ShapeWithToleranceDto, inputs) as Resolved.OCCT.ShapeWithToleranceDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        const bounds = this.occ.FreeBoundaries(shape, tolerance);
        return { closed: bounds.closed, open: bounds.open };
    }

    /**
     * Repairs a shell: turns its faces so they all face the same way and fixes its faces and edges.
     *
     * When the faces cannot all be turned one way, as on a strip given a half twist, the result is
     * a compound of shells. A shape that is not a shell is refused.
     * @param inputs - The shell to repair
     * @returns The repaired shell, or a compound of shells
     * @group shell
     * @shortname fix shell
     * @drawable true
     * @example
     * ```typescript
     * const shell = await bitbybit.occt.shapes.shell.sewFaces({ shapes: faces, tolerance: 1e-7 });
     * const fixed = await bitbybit.occt.shapeFix.fixShell({ shape: shell });
     * ```
     */
    fixShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Shell>;
        return this.occ.FixShell(checkedShape(resolved.shape));
    }

    /**
     * Repairs a solid, or makes one from a closed shell, with its shells fixed and turned so the
     * material is inside.
     *
     * A shell that encloses nothing comes back fixed but still a shell, and shells that fix into
     * separate solids come back as a compound of them. Other kinds of shape are refused.
     * @param inputs - The solid or shell to repair
     * @returns The repaired solid, or a shell or a compound when no single solid can be made
     * @group solid
     * @shortname fix solid
     * @drawable true
     * @example
     * ```typescript
     * const shell = await bitbybit.occt.shapes.shell.sewFaces({ shapes: faces, tolerance: 1e-7 });
     * const solid = await bitbybit.occt.shapeFix.fixSolid({ shape: shell });
     * ```
     */
    fixSolid(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Shape>;
        return this.occ.FixSolid(checkedShape(resolved.shape));
    }

    /**
     * Turns a closed solid so its material is inside, which gives an inside-out solid its positive
     * volume back; only the orientation changes.
     *
     * A shape that is not a solid, a solid without a shell and a solid whose shell has an opening
     * are refused.
     * @param inputs - The closed solid
     * @returns The solid, oriented with its material inside
     * @group solid
     * @shortname orient closed solid
     * @drawable true
     * @example
     * ```typescript
     * const oriented = await bitbybit.occt.shapeFix.orientClosedSolid({ shape: insideOut });
     * const volume = await bitbybit.occt.shapes.solid.getSolidVolume({ shape: oriented });
     * ```
     */
    orientClosedSolid(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): TopoDS_Solid {
        const resolved = resolveDto(Inputs.OCCT.ShapeDto, inputs) as Resolved.OCCT.ShapeDto<TopoDS_Solid>;
        return this.occ.OrientClosedSolid(checkedShape(resolved.shape));
    }

    /**
     * Sews the faces of shapes together along edges that lie within `tolerance` of each other, as
     * `shapes.shell.sewFaces` does, and reports what it joined and what it left open.
     *
     * `freeEdges` holds the edges left bounding only one face; with `nonManifold` true an edge may
     * join more than two faces. The shapes given are left as they were.
     * @param inputs - The shapes, the tolerance and whether an edge may join more than two faces
     * @returns The sewn shape, the free edges and the counts of free, multiple, sewn and degenerate edges
     * @group shape
     * @shortname sew with report
     * @drawable false
     * @example
     * ```typescript
     * const sewn = await bitbybit.occt.shapeFix.sewWithReport({ shapes: faces, tolerance: 1e-4, nonManifold: false });
     * const closed = sewn.freeEdgeCount === 0;
     * ```
     */
    sewWithReport(inputs: Inputs.OCCT.SewWithReportDto<TopoDS_Shape>): Models.OCCT.SewReport<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.SewWithReportDto, inputs) as Resolved.OCCT.SewWithReportDto<TopoDS_Shape>;
        const shapes = checkedShapes(resolved.shapes);
        if (shapes.length === 0) {
            throw new InputError("`shapes` is empty: there is nothing to sew.", "shapes");
        }
        const tolerance = checkedNumber(resolved.tolerance, "tolerance", 0);
        if (tolerance === 0) {
            throw new InputError("`tolerance` must be above 0; it is 0.", "tolerance");
        }
        const sewn = this.occ.SewWithReport(shapes, tolerance, resolved.nonManifold);
        return {
            shape: sewn.shape,
            freeEdges: sewn.freeEdges,
            freeEdgeCount: sewn.freeEdgeCount,
            multipleEdgeCount: sewn.multipleEdgeCount,
            contiguousEdgeCount: sewn.contiguousEdgeCount,
            degeneratedCount: sewn.degeneratedCount,
        };
    }

    private firstOccurrences(shape: TopoDS_Shape, type: string): number[] {
        const occurrences = this.occurrencesOf(shape, type);
        const firstOnes = new Map<number, TopoDS_Shape[]>();
        const firsts: number[] = [];
        occurrences.forEach((occurrence, index) => {
            const hash = this.occ.TopoDS_Shape_HashCode(occurrence, HASH_BOUND);
            const known = firstOnes.get(hash) ?? [];
            if (!known.some(first => first.IsSame(occurrence))) {
                firstOnes.set(hash, [...known, occurrence]);
                firsts.push(index);
            }
        });
        occurrences.forEach(occurrence => occurrence.delete());
        return firsts;
    }

    private occurrencesOf(shape: TopoDS_Shape, type: string): TopoDS_Shape[] {
        switch (type) {
            case "vertex":
                return this.occ.VerticesOf(shape, false);
            case "wire":
                return this.occ.WiresOf(shape, false);
            case "face":
                return this.occ.FacesOf(shape, false);
            case "shell":
                return this.occ.ShellsOf(shape, false);
            default:
                return this.occ.SolidsOf(shape, false);
        }
    }
}
