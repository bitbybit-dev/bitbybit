import { describe, it, expect, beforeAll, vi } from "vitest";
import type { MockInstance } from "vitest";
import { KernelOperationError } from "@bitbybit-dev/base";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTService } from "../../occ-service";
import { releaseMade, soundRounding, soundRoundingShape } from "./solid-results";
import type { RoundingFailures } from "./rounding-types";

const VOLUME_PROPERTIES = 4;

const FAILURES: RoundingFailures = { broken: () => new Error("broken"), beyond: () => new Error("beyond"), insideOut: () => new Error("insideOut"), unnumbered: () => new Error("unnumbered") };

const NO_REACH = 0;

describe("OCCT rounding results judged against what they rounded", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
    });

    const block = (from: number, to: number): TopoDS_Shape => occHelper.entitiesService.bRepPrimAPIMakeBox(to - from, to - from, to - from, [(from + to) / 2, (from + to) / 2, (from + to) / 2]);

    const insideOut = (shape: TopoDS_Shape): TopoDS_Shape => {
        try {
            return shape.Reversed();
        } finally {
            shape.delete();
        }
    };

    const openSolid = (): TopoDS_Shape => {
        const inner = block(1, 9);
        const faces = occHelper.shapeGettersService.getFaces({ shape: inner });
        const builder = new occt.BRep_Builder();
        const shell = builder.MakeShell();
        faces.slice(1).forEach(face => builder.Add(shell, face));
        const solid = builder.MakeSolid();
        builder.Add(solid, shell);
        [builder, inner, shell, ...faces].forEach(made => made.delete());
        return solid;
    };

    const openShell = (): TopoDS_Shape => {
        const whole = block(0, 10);
        const faces = occHelper.shapeGettersService.getFaces({ shape: whole });
        const builder = new occt.BRep_Builder();
        const shell = builder.MakeShell();
        faces.slice(1).forEach(face => builder.Add(shell, face));
        [builder, whole, ...faces].forEach(made => made.delete());
        return shell;
    };

    const solidBesideAFace = (): TopoDS_Shape => {
        const whole = block(0, 10);
        const face = occHelper.shapeGettersService.getFaces({ shape: block(2, 3) })[0]!;
        const builder = new occt.BRep_Builder();
        const compound = builder.MakeCompound();
        builder.Add(compound, whole);
        builder.Add(compound, face);
        [builder, whole, face].forEach(made => made.delete());
        return compound;
    };

    const judged = (made: TopoDS_Shape, asSolid = true, reach = NO_REACH, input = block(0, 10)): string => {
        try {
            const shape = soundRoundingShape(occt, input, made, asSolid, reach, FAILURES);
            shape.delete();
            return shape === made ? "kept" : "mended";
        } catch (error) {
            return (error as Error).message;
        } finally {
            input.delete();
        }
    };

    it("should keep a solid inside the box of what it rounded, its faces on that box's faces included", () => {
        // Act
        const results = [judged(block(1, 9)), judged(block(0, 10))];

        // Assert
        expect(results).toEqual(["kept", "kept"]);
    });

    it("should refuse a result that leaves the box of what it rounded by more than a hundredth of that box's diagonal, a solid or not", () => {
        // Act
        const results = [judged(block(0.5, 10.5)), judged(block(0.5, 10.5), false)];

        // Assert
        expect(results).toEqual(["beyond", "beyond"]);
    });

    it("should let a result leave the box of what it rounded by no more than its own tolerance", () => {
        // Act
        const results = [judged(block(0, 10 + 1.5e-7)), judged(block(0, 10 + 5e-7))];

        // Assert
        expect(results).toEqual(["kept", "beyond"]);
    });

    it("should let the rounding of an open shell reach past the box of what it rounded by its own radius or distance, further than a hundredth of that box's diagonal, and no further", () => {
        // Act
        const results = [judged(block(0, 10.4), false, 0.5, openShell()), judged(block(0, 10.6), false, 0.5, openShell())];

        // Assert
        expect(results).toEqual(["kept", "beyond"]);
    });

    it("should give the rounding of a solid no such reach, holding it to its own tolerance", () => {
        // Act
        const results = [judged(block(0, 10.4), true, 0.5), judged(block(0, 10.4), false, 0.5)];

        // Assert
        expect(results).toEqual(["beyond", "beyond"]);
    });

    it("should give the reach to a compound whose faces are not all bound into its solids", () => {
        // Act
        const result = judged(block(0, 10.4), true, 0.5, solidBesideAFace());

        // Assert
        expect(result).toBe("kept");
    });

    it.each([
        ["not a number", Number.NaN],
        ["below 0", -1],
    ])("should take a reach that is %s for no reach at all", (_what, reach) => {
        // Act
        const results = [judged(block(0, 10), false, reach, openShell()), judged(block(0, 10.4), false, reach, openShell())];

        // Assert
        expect(results).toEqual(["kept", "beyond"]);
    });

    it("should hand back the solid OCCT's shape repair turns right when one came out inside out, valid, of the same volume and inside the box, and keep the same shape when no solid was rounded", () => {
        // Arrange
        const input = block(0, 10);
        const made = insideOut(block(1, 9));
        const volumeBefore = occt.VolumePropertiesOfEach([made])[0]!;

        // Act
        const shape = soundRoundingShape(occt, input, made, true, NO_REACH, FAILURES);

        // Assert
        expect(shape).not.toBe(made);
        expect([occt.ShapeIsValid(shape), occt.VolumePropertiesOfEach([shape])[0]]).toEqual([true, expect.closeTo(-volumeBefore, 9)]);
        expect(made.isDeleted()).toBe(true);
        expect(judged(insideOut(block(1, 9)), false)).toBe("kept");
        [input, shape].forEach(kept => kept.delete());
    });

    it("should refuse as inside out, freeing it, a solid that came out inside out which the repair cannot make sound", () => {
        // Arrange
        const made = insideOut(openSolid());

        // Act
        const result = judged(made);

        // Assert
        expect(result).toBe("insideOut");
    });

    it("should number a history read against what was made on the mended solid, each face and edge at the place of the same face and edge", () => {
        // Arrange
        const input = block(0, 10);
        const rounding = soundRounding(occt, input, insideOut(block(1, 9)), true, NO_REACH, FAILURES);
        const faces = occt.FacesOf(rounding.made, false).length;
        const edges = occt.EdgesOf(rounding.made, true).length;
        const each = (count: number): Int32Array[] => Array.from({ length: count }, (_, index) => Int32Array.of(index));

        // Act
        const history = rounding.reindexed({ faces: each(faces), edges: each(edges), facesFromFaces: [], edgesFromFaces: [], facesFromEdges: [], facesFromVertices: [], edgesFromVertices: [], firstFaces: Int32Array.of(0, 1), lastFaces: new Int32Array() });

        // Assert
        const facesOf = (shape: TopoDS_Shape): TopoDS_Shape[] => occt.FacesOf(shape, false);
        const edgesOf = (shape: TopoDS_Shape): TopoDS_Shape[] => occt.EdgesOf(shape, true);
        const [madeFaces, mendedFaces, madeEdges, mendedEdges] = [facesOf(rounding.made), facesOf(rounding.shape), edgesOf(rounding.made), edgesOf(rounding.shape)];
        const placesOf = (props: Float64Array, at: number): string => Array.from(props.slice(at * 4, at * 4 + 4), value => value.toFixed(6)).join();
        const [madeAreas, mendedAreas] = [occt.SurfacePropertiesOfEach(madeFaces), occt.SurfacePropertiesOfEach(mendedFaces)];
        const [madeLengths, mendedLengths] = [occt.LinearPropertiesOfEach(madeEdges), occt.LinearPropertiesOfEach(mendedEdges)];
        expect(history.faces.map(list => list.length)).toEqual(Array(faces).fill(1));
        expect(history.faces.map((list, at) => placesOf(mendedAreas, list[0]!) === placesOf(madeAreas, at))).toEqual(Array(faces).fill(true));
        expect(history.edges.map((list, at) => placesOf(mendedLengths, list[0]!) === placesOf(madeLengths, at))).toEqual(Array(edges).fill(true));
        expect(Array.from(history.firstFaces)).toEqual([...history.faces[0]!, ...history.faces[1]!].sort((a, b) => a - b));
        releaseMade(rounding);
        [input, rounding.shape, ...madeFaces, ...mendedFaces, ...madeEdges, ...mendedEdges].forEach(kept => kept.delete());
    });

    it("should refuse a null result", () => {
        // Act
        const broken = judged(new occt.TopoDS_Shape());

        // Assert
        expect(broken).toBe("broken");
    });

    it("should keep a solid that is not valid but has a volume it can have inside the box, for the caller to judge", () => {
        // Arrange
        const solid = openSolid();
        const valid = occt.ShapeIsValid(solid);

        // Act
        const result = judged(solid);

        // Assert
        expect([valid, result]).toEqual([false, "kept"]);
    });

    const compoundOf = (shapes: TopoDS_Shape[]): TopoDS_Shape => {
        const builder = new occt.BRep_Builder();
        const compound = builder.MakeCompound();
        shapes.forEach(shape => builder.Add(compound, shape));
        [builder, ...shapes].forEach(made => made.delete());
        return compound;
    };

    const solidVolumes = (shape: TopoDS_Shape): number[] => {
        const solids = occt.SolidsOf(shape, false);
        try {
            const properties = occt.VolumePropertiesOfEach(solids);
            return solids.map((_solid, at) => properties[at * VOLUME_PROPERTIES]!);
        } finally {
            solids.forEach(solid => solid.delete());
        }
    };

    it("should mend a solid that came out inside out beside a larger sound one in a compound, judging each solid on its own", () => {
        // Arrange
        const input = block(0, 10);
        const made = compoundOf([block(1, 8), insideOut(block(8.5, 9.5))]);
        const before = solidVolumes(made);

        // Act
        const shape = soundRoundingShape(occt, input, made, true, NO_REACH, FAILURES);

        // Assert
        expect(before).toEqual([expect.closeTo(343, 9), expect.closeTo(-1, 9)]);
        expect(shape).not.toBe(made);
        expect(solidVolumes(shape)).toEqual([expect.closeTo(343, 9), expect.closeTo(1, 9)]);
        [input, shape].forEach(kept => kept.delete());
    });

    it("should leave what the maker made as it was when it mends it, repairing a copy of it", () => {
        // Arrange
        const input = block(0, 10);
        const made = insideOut(block(1, 9));
        const before = occt.WriteBREPToString(made, false);

        // Act
        const rounding = soundRounding(occt, input, made, true, NO_REACH, FAILURES);

        // Assert
        expect(rounding.shape).not.toBe(made);
        expect(occt.WriteBREPToString(made, false)).toBe(before);
        expect(occt.VolumePropertiesOfEach([made])[0]).toBeCloseTo(-512, 9);
        releaseMade(rounding);
        expect(made.isDeleted()).toBe(true);
        [input, rounding.shape].forEach(kept => kept.delete());
    });

    it("should refuse a history it cannot number on the mended solid as unnumbered, not as inside out, the mended solid itself being sound", () => {
        // Arrange
        const input = block(0, 10);
        const repair = occt.ShapeFix_Shape_Perform.bind(occt);
        const sharingNoEdge = vi.spyOn(occt, "ShapeFix_Shape_Perform").mockImplementation(shape => {
            const repaired = repair(shape);
            try {
                return occt.BRepBuilderAPI_Copy_Shape(repaired, true);
            } finally {
                repaired.delete();
            }
        });
        const rounding = soundRounding(occt, input, insideOut(block(1, 9)), true, NO_REACH, FAILURES);
        sharingNoEdge.mockRestore();

        // Act
        const thrown = (() => {
            try {
                rounding.reindexed({ faces: [], edges: [], facesFromFaces: [], edgesFromFaces: [], facesFromEdges: [], facesFromVertices: [], edgesFromVertices: [], firstFaces: new Int32Array(), lastFaces: new Int32Array() });
                return undefined;
            } catch (error) {
                return (error as Error).message;
            }
        })();

        // Assert
        expect(thrown).toBe("unnumbered");
        expect(occt.ShapeIsValid(rounding.shape)).toBe(true);
        releaseMade(rounding);
        [input, rounding.shape].forEach(kept => kept.delete());
    });
});

describe("OCCT fillets and chamfers of the tips of a bored gear, which OCCT 8.0.2 makes inside out", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel, new OccHelper(kernel));
    });

    const boredGear = (): { shape: TopoDS_Shape; indexes: number[] } => {
        const { shape, roles } = occt.parts.mechanical.gears.spurGearWithRoles({ module: 2, teeth: 20, width: 6, bore: 8 });
        return { shape, indexes: occt.select.edges.between({ shape, indexes: roles["end"]!, otherIndexes: roles["tip"]! }) };
    };

    const codeOf = (run: () => unknown): string | undefined => {
        try {
            const made = run();
            return made === undefined ? "nothing" : "made";
        } catch (error) {
            return error instanceof KernelOperationError ? error.code : (error as Error).message;
        }
    };

    const repairingNothing = (): MockInstance<BitbybitOcctModule["ShapeFix_Shape_Perform"]> => vi.spyOn(kernel, "ShapeFix_Shape_Perform").mockImplementation(shape => kernel.BRepBuilderAPI_Copy_Shape(shape, true));

    it("should refuse as inside out a fillet and a chamfer whose repair does not turn the solid right", () => {
        // Arrange
        const { shape, indexes } = boredGear();
        const unrepaired = repairingNothing();

        // Act
        const codes = [
            codeOf(() => occt.fillets.filletEdges({ shape, radius: 0.2, indexes })),
            codeOf(() => occt.fillets.chamferEdges({ shape, distance: 0.2, indexes })),
            codeOf(() => occt.fillets.filletEdgesWithHistory({ shape, radius: 0.2, indexes })),
            codeOf(() => occt.fillets.chamferEdgesWithHistory({ shape, distance: 0.2, indexes })),
        ];

        // Assert
        unrepaired.mockRestore();
        expect(codes).toEqual(["occt.fillet.insideOut", "occt.chamfer.insideOut", "occt.fillet.insideOut", "occt.chamfer.insideOut"]);
        shape.delete();
    });

    it("should refuse the history twins as unnumbered when the repaired solid cannot be matched to what the maker made, and hand the plain fillet and chamfer back", () => {
        // Arrange
        const { shape, indexes } = boredGear();
        const repair = kernel.ShapeFix_Shape_Perform.bind(kernel);
        const sharingNoEdge = vi.spyOn(kernel, "ShapeFix_Shape_Perform").mockImplementation(made => {
            const repaired = repair(made);
            try {
                return kernel.BRepBuilderAPI_Copy_Shape(repaired, true);
            } finally {
                repaired.delete();
            }
        });

        // Act
        const plain = [occt.fillets.filletEdges({ shape, radius: 0.2, indexes }), occt.fillets.chamferEdges({ shape, distance: 0.2, indexes })];
        const codes = [
            codeOf(() => occt.fillets.filletEdgesWithHistory({ shape, radius: 0.2, indexes })),
            codeOf(() => occt.fillets.chamferEdgesWithHistory({ shape, distance: 0.2, indexes })),
        ];

        // Assert
        sharingNoEdge.mockRestore();
        expect(codes).toEqual(["occt.fillet.historyUnnumbered", "occt.chamfer.historyUnnumbered"]);
        expect(plain.map(made => [kernel.ShapeIsValid(made), (kernel.VolumePropertiesOfEach([made])[0] ?? 0) > 0])).toEqual([[true, true], [true, true]]);
        [shape, ...plain].forEach(kept => kept.delete());
    });

    it("should leave the gear it rounds as it was, its pcurves included, and number the twins' history on the mended solid", () => {
        // Arrange
        const { shape, indexes } = boredGear();
        const before = kernel.WriteBREPToString(shape, false);

        // Act
        const rounded = occt.fillets.filletEdgesWithHistory({ shape, radius: 0.2, indexes });
        const beveled = occt.fillets.chamferEdges({ shape, distance: 0.2, indexes });

        // Assert
        expect(kernel.WriteBREPToString(shape, false)).toBe(before);
        expect(rounded.history.faces.every(list => list.length === 1)).toBe(true);
        expect(rounded.history.facesFromEdges.filter(list => list.length > 0)).toHaveLength(indexes.length);
        expect([rounded.shape, beveled].map(made => kernel.ShapeIsValid(made))).toEqual([true, true]);
        [shape, rounded.shape, beveled].forEach(kept => kept.delete());
    });
});
