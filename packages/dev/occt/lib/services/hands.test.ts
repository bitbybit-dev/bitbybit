import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { TopoDS_Edge, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";
import { Inputs as BaseInputs } from "@bitbybit-dev/base";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;

type Point = Inputs.Base.Point3;
type System = Inputs.Base.coordinateSystemEnum | undefined;

const RIGHT_HAND = 1;
const LEFT_HAND = -1;
const COUNTERCLOCKWISE = 1;
const CLOCKWISE = -1;

const SYSTEMS: [string, System][] = [["no coordinate system", undefined], ["a left-handed system", leftHanded], ["a right-handed system", rightHanded]];

describe("OCCT shapes that name a hand", () => {
    let occt: OCCTService;
    let occHelper: OccHelper;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occHelper = new OccHelper(kernel);
        occt = new OCCTService(kernel, occHelper);
    }, 120_000);

    afterEach(() => {
        occHelper.base.settings = {};
    });

    const inSystem = (system: System): void => {
        occHelper.base.settings = system === undefined ? {} : { coordinateSystem: system };
    };
    const chordsOf = (points: Point[]): Point[] => points.slice(1).map((point, at) => occHelper.base.vector.sub({ first: point, second: points[at]! }) as Point);
    const twistOf = (points: Point[]): number => {
        const chords = chordsOf(points);
        return chords.slice(2).reduce((sum, third, at) => sum + occHelper.base.vector.dot({ first: occHelper.base.vector.cross({ first: chords[at]!, second: chords[at + 1]! }), second: third }), 0);
    };
    const handOfNumbers = (points: Point[]): number => Math.sign(twistOf(points));
    const turnOfNumbers = (points: Point[], axis: Point): number => {
        const chords = chordsOf(points);
        const turn = chords.slice(1).reduce((sum, second, at) => sum + occHelper.base.vector.dot({ first: occHelper.base.vector.cross({ first: chords[at]!, second }), second: axis }), 0);
        return Math.sign(turn);
    };
    const asShown = (ofNumbers: number, system: System): number => (system === leftHanded ? -ofNumbers : ofNumbers);
    const alongWire = (wire: TopoDS_Wire): Point[] => occt.shapes.wire.divideWireByEqualDistanceToPoints({ shape: wire, nrOfDivisions: 60, removeStartPoint: false, removeEndPoint: false });
    const alongEdge = (edge: TopoDS_Edge): Point[] => occt.shapes.edge.divideEdgeByEqualDistanceToPoints({ shape: edge, nrOfDivisions: 60, removeStartPoint: false, removeEndPoint: false });

    describe.each(SYSTEMS)("a helix in %s", (_name, system) => {
        it.each([
            ["a right-hand coil when not clockwise", false, RIGHT_HAND],
            ["a left-hand coil when clockwise", true, LEFT_HAND],
        ])("should show %s", (_coil, clockwise, hand) => {
            // Arrange
            inSystem(system);

            // Act
            const helix = occt.shapes.wire.createHelixWire({ radius: 2, pitch: 1, height: 5, center: [0, 0, 0], direction: [0, 1, 0], clockwise, tolerance: 1e-4 });

            // Assert
            expect(asShown(handOfNumbers(alongWire(helix)), system)).toBe(hand);
        });

        it("should show the same hand from a helix by turns and from a tapered one", () => {
            // Arrange
            inSystem(system);

            // Act
            const byTurns = occt.shapes.wire.createHelixWireByTurns({ radius: 2, pitch: 1, numTurns: 5, center: [0, 0, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 });
            const tapered = occt.shapes.wire.createTaperedHelixWire({ startRadius: 3, endRadius: 1, pitch: 1, height: 5, center: [0, 0, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 });

            // Assert
            expect([byTurns, tapered].map(wire => asShown(handOfNumbers(alongWire(wire)), system))).toEqual([RIGHT_HAND, RIGHT_HAND]);
        });

        it.each([
            ["counterclockwise seen from the tip of its axis when not clockwise", false, COUNTERCLOCKWISE],
            ["clockwise seen from the tip of its axis when clockwise", true, CLOCKWISE],
        ])("should show a flat spiral winding %s", (_winding, clockwise, turn) => {
            // Arrange
            inSystem(system);

            // Act
            const spiral = occt.shapes.wire.createFlatSpiralWire({ startRadius: 1, endRadius: 4, numTurns: 3, center: [0, 0, 0], direction: [0, 1, 0], clockwise, tolerance: 1e-4 });

            // Assert
            expect(asShown(turnOfNumbers(alongWire(spiral), [0, 1, 0]), system)).toBe(turn);
        });
    });

    it("should build a left-hand coil in the numbers of a left-handed system, and the same coil as ever in the others", () => {
        // Act
        const hands = SYSTEMS.map(([, system]) => {
            inSystem(system);
            return handOfNumbers(alongWire(occt.shapes.wire.createHelixWire({ radius: 2, pitch: 1, height: 5, center: [0, 0, 0], direction: [0, 1, 0], clockwise: false, tolerance: 1e-4 })));
        });

        // Assert
        expect(hands).toEqual([RIGHT_HAND, LEFT_HAND, RIGHT_HAND]);
    });

    describe.each(SYSTEMS)("a helical gear in %s", (_name, system) => {
        const WIDTH = 6;
        const leanAboutY = (edge: TopoDS_Edge): number => {
            const [from, to] = [occt.shapes.edge.startPointOnEdge({ shape: edge }), occt.shapes.edge.endPointOnEdge({ shape: edge })].sort((a, b) => a[1] - b[1]) as [Point, Point];
            if (to[1] - from[1] < WIDTH * 0.9) {
                return 0;
            }
            const turned = Math.atan2(to[0], to[2]) - Math.atan2(from[0], from[2]);
            return Math.atan2(Math.sin(turned), Math.cos(turned));
        };

        it.each([
            ["right-hand teeth for a positive helix angle", 15, RIGHT_HAND],
            ["left-hand teeth for a negative helix angle", -15, LEFT_HAND],
        ])("should show %s", (_teeth, helixAngle, hand) => {
            // Arrange
            inSystem(system);
            const gear = occt.parts.mechanical.gears.helicalGear({ module: 1, teeth: 20, helixAngle, width: WIDTH });

            // Act
            const leans = occt.shapes.edge.getEdges({ shape: gear }).map(leanAboutY).filter(lean => lean !== 0);

            // Assert
            expect(leans.length).toBeGreaterThan(0);
            expect(new Set(leans.map(lean => asShown(Math.sign(lean), system)))).toEqual(new Set([hand]));
        }, 120_000);
    });

    it("should build the screw of a left-handed system as a valid solid of the same volume as the others", () => {
        // Act
        const screws = SYSTEMS.map(([, system]) => {
            inSystem(system);
            return occt.parts.mechanical.fasteners.iso.socketHeadCapScrew({ size: BaseInputs.Engineering.isoThreadSizeEnum.m4, length: 12, modelledThread: true });
        });

        // Assert
        expect(screws.map(screw => occt.shapeFix.isValid({ shape: screw }))).toEqual([true, true, true]);
        const volumes = screws.map(screw => occt.shapes.solid.getSolidVolume({ shape: screw }));
        expect(volumes[1]).toBeCloseTo(volumes[0]!, 6);
        expect(volumes[2]).toBeCloseTo(volumes[0]!, 6);
    }, 120_000);

    it.each(SYSTEMS)("should show a modelled ISO thread right-hand in %s", (_name, system) => {
        // Arrange
        inSystem(system);
        const screw = occt.parts.mechanical.fasteners.iso.socketHeadCapScrew({ size: BaseInputs.Engineering.isoThreadSizeEnum.m4, length: 12, modelledThread: true });
        const twists = occt.shapes.edge.getEdges({ shape: screw }).map(edge => twistOf(alongEdge(edge)));

        // Act
        const mostTwisted = twists.reduce((most, twist) => (Math.abs(twist) > Math.abs(most) ? twist : most), 0);

        // Assert
        expect(asShown(Math.sign(mostTwisted), system)).toBe(RIGHT_HAND);
    }, 120_000);
});
