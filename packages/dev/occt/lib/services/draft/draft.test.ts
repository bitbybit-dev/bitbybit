import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import type { BitbybitOcctModule, ClassHandle, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { readKernelException } from "../../kernel-exception";
import type * as Inputs from "../../api/inputs";
import { OCCTFace, OCCTSolid, OCCTWire } from "../shapes";
import { OCCTDraft } from "./draft";
import { ledgerRun, namesOf } from "../../../../__test__/embind-ledger";

function tracked(occt: BitbybitOcctModule, names: string[], act: () => unknown): { created: ClassHandle[]; thrown: unknown } {
    const created: ClassHandle[] = [];
    const originals = names.map(name => [name, Reflect.get(occt, name)] as const);
    originals.forEach(([name, original]) => Reflect.set(occt, name, new Proxy(original, {
        construct(target, args): object {
            const made: ClassHandle = Reflect.construct(target, args);
            created.push(made);
            return made;
        },
    })));
    let thrown: unknown;
    try {
        act();
    } catch (failure) {
        thrown = failure;
    } finally {
        originals.forEach(([name, original]) => Reflect.set(occt, name, original));
    }
    return { created, thrown };
}

describe("OCCT draft unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let draft: OCCTDraft;
    let solid: OCCTSolid;
    let face: OCCTFace;
    let wire: OCCTWire;

    const hasDraft = (): boolean =>
        typeof Reflect.get(occt, "BRepOffsetAPI_DraftAngle") === "function";

    const box = (): TopoDS_Shape => solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        occHelper = new OccHelper(occt);
        draft = new OCCTDraft(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        face = new OCCTFace(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
    });

    it("should taper a side face of a box by a draft angle and change its volume", () => {
        if (!hasDraft()) { return; }
        const b = box();
        const faces = face.getFaces({ shape: b });
        const volumeBefore = solid.getSolidVolume({ shape: b });
        const sideFace = faces.find(f => {
            const n = occHelper.facesService.faceNormalOnUV({ shape: f, paramU: 0.5, paramV: 0.5 });
            return Math.abs(n[0]) > 0.9;
        }) ?? faces[0]!;
        const drafted = draft.draftAngle({
            shape: b,
            faces: [sideFace],
            direction: [0, 0, 1],
            angle: 5,
            neutralPlaneOrigin: [0, 0, -5],
            neutralPlaneDirection: [0, 0, 1],
            flag: true,
        });
        expect(drafted.IsNull()).toBe(false);
        expect(solid.getSolidVolume({ shape: drafted })).not.toBeCloseTo(volumeBefore, 1);
        b.delete();
        drafted.delete();
        faces.forEach(f => f.delete());
    });
    describe("makeDraft", () => {
        const wireToDraft = (): TopoDS_Shape => wire.createRectangleWire({
            width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0]
        });

        it("should sweep the wire into a shape that stands as tall as it was told", () => {
            // Arrange
            const profile = wireToDraft();

            // Act
            const drafted = draft.makeDraft({
                shape: profile, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false
            });

            // Assert
            const bounds = occHelper.operationsService.boundingBoxOfShape({ shape: drafted });
            expect(bounds.size[1]).toBeGreaterThan(0);

            profile.delete();
            drafted.delete();
        });

        it("should taper the other way round when it is told the draft is internal", () => {
            // Arrange
            const profile = wireToDraft();

            // Act
            const outward = draft.makeDraft({
                shape: profile, direction: [0, 1, 0], angle: 10, lengthMax: 20, internal: false
            });
            const inward = draft.makeDraft({
                shape: profile, direction: [0, 1, 0], angle: 10, lengthMax: 20, internal: true
            });

            const outwardSize = occHelper.operationsService.boundingBoxOfShape({ shape: outward }).size;
            const inwardSize = occHelper.operationsService.boundingBoxOfShape({ shape: inward }).size;
            expect(outwardSize).not.toEqual(inwardSize);

            profile.delete();
            outward.delete();
            inward.delete();
        });

        it("should refuse a shape it cannot sweep at all", () => {
            // Arrange
            const point = occHelper.entitiesService.makeVertex([0, 0, 0]);

            // Act
            const act = (): TopoDS_Shape => draft.makeDraft({
                shape: point, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false
            });

            // Assert
            expect(act).toThrow();

            point.delete();
        });
    });

    describe("makeDraftToShape", () => {
        it("should sweep the wire until it reaches the shape it was told to stop at", () => {
            // Arrange
            const profile = wire.createRectangleWire({
                width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0]
            });
            const ceiling = face.createRectangleFace({
                width: 40, length: 40, center: [0, 15, 0], direction: [0, 1, 0]
            });

            // Act
            const drafted = draft.makeDraftToShape({
                shape: profile, direction: [0, 1, 0], angle: 5, stopShape: ceiling,
                keepOut: false, internal: false
            });

            const bounds = occHelper.operationsService.boundingBoxOfShape({ shape: drafted });
            expect(bounds.size[1]).toBeGreaterThan(10);

            profile.delete();
            ceiling.delete();
            drafted.delete();
        });

        it("should refuse a shape it cannot sweep at all", () => {
            // Arrange
            const point = occHelper.entitiesService.makeVertex([0, 0, 0]);
            const ceiling = face.createRectangleFace({
                width: 40, length: 40, center: [0, 15, 0], direction: [0, 1, 0]
            });

            // Act
            const act = (): TopoDS_Shape => draft.makeDraftToShape({
                shape: point, direction: [0, 1, 0], angle: 5, stopShape: ceiling,
                keepOut: false, internal: false
            });

            // Assert
            expect(act).toThrow();

            point.delete();
            ceiling.delete();
        });
    });

    describe("lengths and faces a draft cannot use", () => {
        const outline = (): TopoDS_Shape => wire.createSquareWire({ size: 15, center: [0, 0, 0], direction: [0, 1, 0] });
        const refusalOf = (action: () => unknown): unknown => {
            try {
                action();
            } catch (error) {
                return error;
            }
            return undefined;
        };
        const failure = (): unknown => {
            const point = new occt.gp_Pnt(1, 2, 3);
            const maker = new occt.BRepBuilderAPI_MakeEdge(point, point);
            try {
                return maker.Edge();
            } catch (error) {
                return error;
            } finally {
                maker.delete();
                point.delete();
            }
        };

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it.each([
            ["makeDraft", (lengthMax: number): unknown => draft.makeDraft({ shape: outline(), direction: [0, 1, 0], angle: 5, lengthMax, internal: false })],
            ["makeDraftWithHistory", (lengthMax: number): unknown => draft.makeDraftWithHistory({ shape: outline(), direction: [0, 1, 0], angle: 5, lengthMax, internal: false })],
        ] as [string, (lengthMax: number) => unknown][])("should refuse %s a skirt of length 0 as an input error on lengthMax", (_operation, skirtOf) => {
            // Act
            const refused = refusalOf(() => skirtOf(0));

            // Assert
            expect(refused).toEqual(expect.objectContaining({ name: "InputError", property: "lengthMax", message: "`lengthMax` must be a finite number other than 0, the length the skirt grows to; it is 0." }));
        });

        it("should refuse a skirt of length NaN as an input error on lengthMax rather than draft it for ever", () => {
            // Arrange
            const shape = outline();

            // Act
            const refused = refusalOf(() => draft.makeDraft({ shape, direction: [0, 1, 0], angle: 5, lengthMax: NaN, internal: false }));

            // Assert
            expect(refused).toEqual(expect.objectContaining({ name: "InputError", property: "lengthMax", message: "`lengthMax` must be a finite number other than 0, the length the skirt grows to; it is NaN." }));
        });

        it("should name the kernel's failure to grow a skirt a hair long as a draft failure", () => {
            // Arrange
            const shape = outline();

            // Act
            const refused = refusalOf(() => draft.makeDraft({ shape, direction: [0, 1, 0], angle: 5, lengthMax: 1e-8, internal: false }));

            // Assert
            expect(refused).toEqual(expect.objectContaining({ name: "KernelOperationError", code: "occt.draft.failed" }));
        });

        it.each([
            ["draftAngle", (inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, ReturnType<OCCTFace["getFace"]>>): unknown => draft.draftAngle(inputs)],
            ["draftAngleWithHistory", (inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, ReturnType<OCCTFace["getFace"]>>): unknown => draft.draftAngleWithHistory(inputs)],
        ] as [string, (inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, ReturnType<OCCTFace["getFace"]>>) => unknown][])("should refuse %s a face that is not one of the shape's own as an input error at its position", (_operation, drafted) => {
            // Arrange
            const shape = box();
            const elsewhere = solid.createBox({ width: 10, height: 10, length: 10, center: [30, 0, 0] });
            const faces = [face.getFace({ shape, index: 0 }), face.getFace({ shape: elsewhere, index: 0 })];

            // Act
            const refused = refusalOf(() => drafted({ shape, faces, direction: [0, 0, 1], angle: 5, neutralPlaneOrigin: [0, 0, -5], neutralPlaneDirection: [0, 0, 1], flag: true }));

            // Assert
            expect(refused).toEqual(expect.objectContaining({ name: "InputError", property: "faces", message: "`faces` holds a shape at position 1 that is not a face of `shape`: take the faces to tilt from the shape itself." }));
        });

        const ceiling = (): TopoDS_Shape => face.createSquareFace({ size: 60, center: [0, 8, 0], direction: [0, 1, 0] });
        const skirts: [string, (angle: number) => unknown][] = [
            ["makeDraft", (angle): unknown => draft.makeDraft({ shape: outline(), direction: [0, 1, 0], angle, lengthMax: 5, internal: false })],
            ["makeDraftWithHistory", (angle): unknown => draft.makeDraftWithHistory({ shape: outline(), direction: [0, 1, 0], angle, lengthMax: 5, internal: false })],
            ["makeDraftToShape", (angle): unknown => draft.makeDraftToShape({ shape: outline(), direction: [0, 1, 0], angle, stopShape: ceiling(), keepOut: false, internal: false })],
            ["makeDraftToShapeWithHistory", (angle): unknown => draft.makeDraftToShapeWithHistory({ shape: outline(), direction: [0, 1, 0], angle, stopShape: ceiling(), keepOut: false, internal: false })],
        ];

        it.each(skirts)("should refuse %s an angle that is not a finite number as an input error on angle, before the kernel drafts for ever or into NaN", (_operation, skirtOf) => {
            // Act
            const refusals = [Number.NaN, Number.POSITIVE_INFINITY].map(angle => refusalOf(() => skirtOf(angle)));

            // Assert
            expect(refusals).toEqual([
                expect.objectContaining({ name: "InputError", property: "angle", message: "`angle` must be a finite number; it is NaN." }),
                expect.objectContaining({ name: "InputError", property: "angle", message: "`angle` must be a finite number; it is Infinity." }),
            ]);
        });

        it.each(skirts)("should refuse %s an angle of 90 degrees, an odd multiple of it or less than 0.0001 degrees from one, which lays the skirt flat across the direction", (_operation, skirtOf) => {
            // Act
            const refusals = [90, -90, 270, 90.00005].map(angle => refusalOf(() => skirtOf(angle)));

            // Assert
            expect(refusals).toEqual([90, -90, 270, 90.00005].map(angle => expect.objectContaining({
                name: "InputError",
                property: "angle",
                message: `\`angle\` is ${angle}, which lays the skirt flat across \`direction\`, so it never grows along it: keep the angle at least 0.0001 degrees away from 90 and from every odd multiple of 90.`,
            })));
        });

        it("should grow a skirt leaning 0.0001 degrees short of a right angle, rising by the cosine of the angle along its length", () => {
            // Arrange
            const nearlyFlat = 90 - 1e-4;

            // Act
            const skirt = draft.makeDraft({ shape: outline(), direction: [0, 1, 0], angle: nearlyFlat, lengthMax: 5, internal: false });

            // Assert
            const box = occHelper.operationsService.boundingBoxOfShape({ shape: skirt });
            expect(occt.ShapeIsValid(skirt)).toBe(true);
            expect(box.max[1] - box.min[1]).toBeCloseTo(5 * Math.cos(nearlyFlat * Math.PI / 180), 6);
        });

        it.each([
            ["draftAngle", (inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, ReturnType<OCCTFace["getFace"]>>): unknown => draft.draftAngle(inputs)],
            ["draftAngleWithHistory", (inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, ReturnType<OCCTFace["getFace"]>>): unknown => draft.draftAngleWithHistory(inputs)],
        ] as [string, (inputs: Inputs.OCCT.DraftAngleDto<TopoDS_Shape, ReturnType<OCCTFace["getFace"]>>) => unknown][])("should refuse %s an angle that is not a finite number as an input error on angle", (_operation, drafted) => {
            // Arrange
            const shape = box();
            const faces = [face.getFace({ shape, index: 0 })];

            // Act
            const refusals = [Number.NaN, Number.NEGATIVE_INFINITY].map(angle => refusalOf(() => drafted({ shape, faces, direction: [0, 0, 1], angle, neutralPlaneOrigin: [0, 0, -5], neutralPlaneDirection: [0, 0, 1], flag: true })));

            // Assert
            expect(refusals).toEqual([
                expect.objectContaining({ name: "InputError", property: "angle", message: "`angle` must be a finite number; it is NaN." }),
                expect.objectContaining({ name: "InputError", property: "angle", message: "`angle` must be a finite number; it is -Infinity." }),
            ]);
        });

        it.each([
            ["an empty shape", (): TopoDS_Shape => new occt.TopoDS_Shape(), "is missing or empty, as an operation that failed can leave it."],
            ["a deleted shape", (): TopoDS_Shape => {
                const gone = ceiling();
                gone.delete();
                return gone;
            }, "was deleted, so nothing of it is left to work on."],
        ] as [string, () => TopoDS_Shape, string][])("should refuse a skirt from or up to %s as an input error naming it, leaving alive nothing it made", (_shape, shapeOf, refusal) => {
            // Arrange
            const missing = shapeOf();
            const stopShape = ceiling();
            const shape = outline();

            // Act
            const runs = [
                ledgerRun(() => draft.makeDraft({ shape: missing, direction: [0, 1, 0], angle: 5, lengthMax: 5, internal: false })),
                ledgerRun(() => draft.makeDraftToShape({ shape: missing, direction: [0, 1, 0], angle: 5, stopShape, keepOut: false, internal: false })),
                ledgerRun(() => draft.makeDraftToShape({ shape, direction: [0, 1, 0], angle: 5, stopShape: missing, keepOut: false, internal: false })),
                ledgerRun(() => draft.makeDraftToShapeWithHistory({ shape, direction: [0, 1, 0], angle: 5, stopShape: missing, keepOut: false, internal: false })),
            ];

            // Assert
            expect(runs.map(run => [run.thrown, namesOf(run.leaked)])).toEqual(["shape", "shape", "stopShape", "stopShape"].map(property => [
                expect.objectContaining({ name: "InputError", property, message: `\`${property}\` ${refusal}` }),
                [],
            ]));
        });

        it("should name a kernel exception from building the draft as a draft failure", () => {
            // Arrange
            const shape = box();
            const thrown = failure();
            vi.spyOn(occt.BRepOffsetAPI_DraftAngle.prototype, "Build").mockImplementation(() => {
                throw thrown;
            });

            // Act
            const refused = refusalOf(() => draft.draftAngle({ shape, faces: [face.getFace({ shape, index: 0 })], direction: [0, 0, 1], angle: 5, neutralPlaneOrigin: [0, 0, -5], neutralPlaneDirection: [0, 0, 1], flag: true }));

            // Assert
            expect(refused).toEqual(expect.objectContaining({ name: "KernelOperationError", code: "occt.draft.failed" }));
        });
    });

    describe("what a draft lets go of when the kernel refuses it", () => {
        const messageOf = (thrown: unknown): string => {
            const read = readKernelException(occt, thrown);
            return read instanceof Error ? read.message : String(read);
        };
        const sideOf = (shape: TopoDS_Shape): Inputs.OCCT.DraftAngleDto<TopoDS_Shape, ReturnType<OCCTFace["getFace"]>> => ({
            shape, faces: [face.getFace({ shape, index: 0 })], direction: [0, 0, 1], angle: 5, neutralPlaneOrigin: [0, 0, -5], neutralPlaneDirection: [0, 0, 1], flag: true,
        });

        it.each([
            ["direction", { direction: [0, 0, 0] }],
            ["neutralPlaneDirection", { neutralPlaneDirection: [0, 0, 0] }],
        ] as [string, Partial<Inputs.OCCT.DraftAngleDto<TopoDS_Shape, never>>][])("should release the draft maker and every direction and plane it made when %s has no length", (_property, zero) => {
            // Arrange
            const shape = box();
            const inputs = { ...sideOf(shape), ...zero };

            // Act
            const { created, thrown } = tracked(occt, ["BRepOffsetAPI_DraftAngle", "gp_Dir", "gp_Pnt", "gp_Pln"], () => draft.draftAngle(inputs));

            // Assert
            expect(messageOf(thrown)).toBe("Standard_DomainError: gp_Dir: the vector has no length");
            expect(created.length).toBeGreaterThan(0);
            expect(created.filter(made => !made.isDeleted())).toEqual([]);
            expect(shape.isDeleted()).toBe(false);
        });

        it("should release the pull direction when the kernel cannot start a skirt from the shape", () => {
            // Arrange
            const point = occHelper.entitiesService.makeVertex([0, 0, 0]);

            // Act
            const { created, thrown } = tracked(occt, ["gp_Dir", "BRepOffsetAPI_MakeDraft"], () => draft.makeDraft({ shape: point, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false }));

            // Assert
            expect(messageOf(thrown)).toBe("Standard_ConstructionError: BRepFill_Draft");
            expect(created.length).toBeGreaterThan(0);
            expect(created.filter(made => !made.isDeleted())).toEqual([]);
            expect(point.isDeleted()).toBe(false);
        });
    });
});
