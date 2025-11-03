import { ShapesHelperService } from "./shapes-helper.service";
import * as Inputs from "./inputs/inputs";

describe("OCCT shapes helper unit tests", () => {

    let service: ShapesHelperService;

    beforeAll(async () => {
        service = new ShapesHelperService();
    });

    it("should have service defined", () => {
        expect(service).toBeDefined();
    });

    it("should create inverted L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLInverted(1, 2, 3, 4);
        expect(res).toEqual([
            [0, 0, 0],
            [2, 0, 0],
            [2, 0, 1],
            [1.999999, 0, 1],
            [1.999999, 0, 4],
            [0, 0, 4]
        ]);
    });

    it("should create inverted L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLInverted(4, 2, 3, 1);
        expect(res).toEqual([
            [0, 0, 0],
            [2, 0, 0],
            [2, 0, 0.999999],
            [1.999999, 0, 0.999999],
            [1.999999, 0, 1],
            [0, 0, 1]
        ]);
    });

    it("should create middle L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLMiddle(1, 2, 3, 4);
        expect(res).toEqual([
            [0.9999995, 0, 0.5],
            [0.9999995, 0, 4],
            [-0.9999995, 0, 4],
            [-0.9999995, 0, -0.5],
            [2, 0, -0.5],
            [2, 0, 0.5]
        ]);
    });

    it("should create middle L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLMiddle(4, 2, 3, 1);
        expect(res).toEqual([
            [0.9999995, 0, 0.4999995],
            [0.9999995, 0, 1],
            [-0.9999995, 0, 1],
            [-0.9999995, 0, -0.4999995],
            [2, 0, -0.4999995],
            [2, 0, 0.4999995]
        ]);
    });

    describe("Beam I Profile", () => {
        it("should create I-beam profile with midMid alignment (centered)", () => {
            const res = service.beamIProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.midMid);
            expect(res).toEqual([
                [-5, 0, 10],
                [5, 0, 10],
                [5, 0, 7],
                [1, 0, 7],
                [1, 0, -7],
                [5, 0, -7],
                [5, 0, -10],
                [-5, 0, -10],
                [-5, 0, -7],
                [-1, 0, -7],
                [-1, 0, 7],
                [-5, 0, 7],
            ]);
        });

        it("should create I-beam profile with topLeft alignment", () => {
            const res = service.beamIProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.topLeft);
            expect(res).toEqual([
                [0, 0, 0],
                [10, 0, 0],
                [10, 0, -3],
                [6, 0, -3],
                [6, 0, -17],
                [10, 0, -17],
                [10, 0, -20],
                [0, 0, -20],
                [0, 0, -17],
                [4, 0, -17],
                [4, 0, -3],
                [0, 0, -3],
            ]);
        });

        it("should create I-beam profile with bottomRight alignment", () => {
            const res = service.beamIProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.bottomRight);
            expect(res).toEqual([
                [-10, 0, 20],
                [0, 0, 20],
                [0, 0, 17],
                [-4, 0, 17],
                [-4, 0, 3],
                [0, 0, 3],
                [0, 0, 0],
                [-10, 0, 0],
                [-10, 0, 3],
                [-6, 0, 3],
                [-6, 0, 17],
                [-10, 0, 17],
            ]);
        });
    });

    describe("Beam H Profile", () => {
        it("should create H-beam profile with midMid alignment (centered)", () => {
            const res = service.beamHProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.midMid);
            expect(res).toEqual([
                [-5, 0, 10],
                [-2, 0, 10],
                [-2, 0, 1],
                [2, 0, 1],
                [2, 0, 10],
                [5, 0, 10],
                [5, 0, -10],
                [2, 0, -10],
                [2, 0, -1],
                [-2, 0, -1],
                [-2, 0, -10],
                [-5, 0, -10],
            ]);
        });

        it("should create H-beam profile with topLeft alignment", () => {
            const res = service.beamHProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.topLeft);
            expect(res).toEqual([
                [0, 0, 0],
                [3, 0, 0],
                [3, 0, -9],
                [7, 0, -9],
                [7, 0, 0],
                [10, 0, 0],
                [10, 0, -20],
                [7, 0, -20],
                [7, 0, -11],
                [3, 0, -11],
                [3, 0, -20],
                [0, 0, -20],
            ]);
        });

        it("should create H-beam profile with midRight alignment", () => {
            const res = service.beamHProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.midRight);
            expect(res).toEqual([
                [-10, 0, 10],
                [-7, 0, 10],
                [-7, 0, 1],
                [-3, 0, 1],
                [-3, 0, 10],
                [0, 0, 10],
                [0, 0, -10],
                [-3, 0, -10],
                [-3, 0, -1],
                [-7, 0, -1],
                [-7, 0, -10],
                [-10, 0, -10],
            ]);
        });
    });

    describe("Beam T Profile", () => {
        it("should create T-beam profile with midMid alignment (centered)", () => {
            const res = service.beamTProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.midMid);
            expect(res).toEqual([
                [-5, 0, 10],
                [5, 0, 10],
                [5, 0, 7],
                [1, 0, 7],
                [1, 0, -10],
                [-1, 0, -10],
                [-1, 0, 7],
                [-5, 0, 7],
            ]);
        });

        it("should create T-beam profile with topMid alignment", () => {
            const res = service.beamTProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.topMid);
            expect(res).toEqual([
                [-5, 0, 0],
                [5, 0, 0],
                [5, 0, -3],
                [1, 0, -3],
                [1, 0, -20],
                [-1, 0, -20],
                [-1, 0, -3],
                [-5, 0, -3],
            ]);
        });

        it("should create T-beam profile with bottomLeft alignment", () => {
            const res = service.beamTProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.bottomLeft);
            expect(res).toEqual([
                [0, 0, 20],
                [10, 0, 20],
                [10, 0, 17],
                [6, 0, 17],
                [6, 0, 0],
                [4, 0, 0],
                [4, 0, 17],
                [0, 0, 17],
            ]);
        });
    });

    describe("Beam U Profile", () => {
        it("should create U-beam profile with midMid alignment (centered)", () => {
            const res = service.beamUProfile(10, 20, 2, 3, 4, Inputs.Base.basicAlignmentEnum.midMid);
            expect(res).toEqual([
                [-5, 0, 10],
                [-2, 0, 10],
                [-2, 0, -6],
                [3, 0, -6],
                [3, 0, 10],
                [5, 0, 10],
                [5, 0, -10],
                [-5, 0, -10],
            ]);
        });

        it("should create U-beam profile with topLeft alignment", () => {
            const res = service.beamUProfile(10, 20, 2, 3, 4, Inputs.Base.basicAlignmentEnum.topLeft);
            expect(res).toEqual([
                [0, 0, 0],
                [3, 0, 0],
                [3, 0, -16],
                [8, 0, -16],
                [8, 0, 0],
                [10, 0, 0],
                [10, 0, -20],
                [0, 0, -20],
            ]);
        });

        it("should create U-beam profile with midLeft alignment", () => {
            const res = service.beamUProfile(10, 20, 2, 3, 4, Inputs.Base.basicAlignmentEnum.midLeft);
            expect(res).toEqual([
                [0, 0, 10],
                [3, 0, 10],
                [3, 0, -6],
                [8, 0, -6],
                [8, 0, 10],
                [10, 0, 10],
                [10, 0, -10],
                [0, 0, -10],
            ]);
        });

        it("should create U-beam profile with bottomRight alignment", () => {
            const res = service.beamUProfile(10, 20, 2, 3, 4, Inputs.Base.basicAlignmentEnum.bottomRight);
            expect(res).toEqual([
                [-10, 0, 20],
                [-7, 0, 20],
                [-7, 0, 4],
                [-2, 0, 4],
                [-2, 0, 20],
                [0, 0, 20],
                [0, 0, 0],
                [-10, 0, 0],
            ]);
        });
    });

    describe("Beam Profile Alignment Edge Cases", () => {
        it("should handle all 9 alignment positions for I-beam", () => {
            const alignments = [
                Inputs.Base.basicAlignmentEnum.topLeft,
                Inputs.Base.basicAlignmentEnum.topMid,
                Inputs.Base.basicAlignmentEnum.topRight,
                Inputs.Base.basicAlignmentEnum.midLeft,
                Inputs.Base.basicAlignmentEnum.midMid,
                Inputs.Base.basicAlignmentEnum.midRight,
                Inputs.Base.basicAlignmentEnum.bottomLeft,
                Inputs.Base.basicAlignmentEnum.bottomMid,
                Inputs.Base.basicAlignmentEnum.bottomRight,
            ];

            alignments.forEach(alignment => {
                const res = service.beamIProfile(10, 20, 2, 3, alignment);
                expect(res).toBeDefined();
                expect(res.length).toBe(12); // I-beam has 12 points
            });
        });

        it("should ensure all beam profiles return correct number of points", () => {
            const iBeam = service.beamIProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.midMid);
            const hBeam = service.beamHProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.midMid);
            const tBeam = service.beamTProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.midMid);
            const uBeam = service.beamUProfile(10, 20, 2, 3, 4, Inputs.Base.basicAlignmentEnum.midMid);

            expect(iBeam.length).toBe(12);
            expect(hBeam.length).toBe(12);
            expect(tBeam.length).toBe(8);
            expect(uBeam.length).toBe(8);
        });

        it("should verify topLeft alignment places top-left corner at origin", () => {
            const iBeam = service.beamIProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.topLeft);
            // First point should be at or near origin (0, 0, 0) for topLeft
            expect(iBeam[0]).toEqual([0, 0, 0]);
        });

        it("should verify bottomRight alignment places bottom-right corner at origin", () => {
            const iBeam = service.beamIProfile(10, 20, 2, 3, Inputs.Base.basicAlignmentEnum.bottomRight);
            // Point at index 6 should be at or near origin (0, 0, 0) for bottomRight
            expect(iBeam[6]).toEqual([0, 0, 0]);
        });
    });
});
