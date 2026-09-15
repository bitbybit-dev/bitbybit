import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Point } from "./point";
import { Vector } from "./vector";
import { Line } from "./line";

/**
 * Polylines: chains of straight segments through a list of points, held as plain objects of the
 * form `{ points, isClosed }`. A closed polyline joins its last point back to its first. The
 * methods here measure a polyline, convert it to segments or lines, find where polylines cross,
 * sort loose segments into chains and size fillets for its corners. Lengths are in model units.
 */
export class Polyline {

    constructor(private readonly vector: Vector, private readonly point: Point, private readonly line: Line, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Measures the polyline by adding up the straight distances between neighboring points.
     *
     * The closing segment of a closed polyline is not counted.
     * Example: [[0,0,0], [3,0,0], [3,4,0]] -> 7
     * @param inputs - The polyline
     * @returns The length in model units
     * @group get
     * @shortname polyline length
     * @drawable false
     * @example
     * ```typescript
     * const len = bitbybit.polyline.length({ polyline: { points: [[0, 0, 0], [3, 0, 0], [3, 4, 0]] } });
     * ```
     */
    length(inputs: Inputs.Polyline.PolylineDto): number {
        let distanceOfPolyline = 0;
        for (let i = 1; i < inputs.polyline.points.length; i++) {
            const previousPoint = inputs.polyline.points[i - 1]!;
            const currentPoint = inputs.polyline.points[i]!;
            distanceOfPolyline += this.point.distance({ startPoint: previousPoint, endPoint: currentPoint });
        }
        return distanceOfPolyline;
    }

    /**
     * Counts the points of the polyline.
     *
     * Example: three points -> 3
     * @param inputs - The polyline
     * @returns The number of points
     * @group get
     * @shortname nr polyline points
     * @drawable false
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number {
        return inputs.polyline.points.length;
    }

    /**
     * Reads the list of points out of the polyline.
     *
     * Example: { points: [[0,0,0], [1,0,0]] } -> [[0,0,0], [1,0,0]]
     * @param inputs - The polyline
     * @returns Its points, in order
     * @group get
     * @shortname points
     * @drawable true
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Point3[] {
        return inputs.polyline.points;
    }

    /**
     * Reverses the order of the points, so the polyline runs the other way.
     *
     * The given polyline's own point list is reversed in place and handed back inside a new
     * polyline object.
     * Example: [[0,0,0], [1,0,0], [2,0,0]] -> [[2,0,0], [1,0,0], [0,0,0]]
     * @param inputs - The polyline
     * @returns A polyline with the points in reverse order
     * @group convert
     * @shortname reverse polyline
     * @drawable true
     * @example
     * ```typescript
     * const back = bitbybit.polyline.reverse({ polyline: { points: [[0, 0, 0], [1, 0, 0], [2, 0, 0]] } });
     * ```
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        return { points: inputs.polyline.points.reverse() };
    }

    /**
     * Applies a transformation matrix, or a list of them in order, to every point of the polyline.
     *
     * Example: a translation by [5,0,0] -> every point moved 5 along X
     * @param inputs - The polyline and the transformation
     * @returns A new polyline with the transformed points
     * @group transforms
     * @shortname transform polyline
     * @drawable true
     * @example
     * ```typescript
     * const moved = bitbybit.polyline.transformPolyline({
     *     polyline: { points: [[0, 0, 0], [1, 0, 0]] },
     *     transformation: bitbybit.transforms.translationXYZ({ translation: [5, 0, 0] }),
     * });
     * ```
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        const transformation = inputs.transformation;
        let transformedControlPoints = inputs.polyline.points;
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return { points: transformedControlPoints };
    }

    /**
     * Builds a polyline object from points, open or closed.
     *
     * Example: three points with isClosed true -> a triangle
     * @param inputs - The points and whether the last joins back to the first
     * @returns The polyline object
     * @group create
     * @shortname polyline
     * @drawable true
     * @example
     * ```typescript
     * const triangle = bitbybit.polyline.create({ points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], isClosed: true });
     * ```
     */
    create(inputs: Inputs.Polyline.PolylineCreateDto): Inputs.Polyline.PolylinePropertiesDto {
        return {
            points: inputs.points,
            isClosed: inputs.isClosed ?? false,
        };
    }

    /**
     * Splits the polyline into line objects, one per segment, each with a start and an end point.
     *
     * A closed polyline also gets the segment from its last point back to its first, unless the two
     * coincide.
     * Example: three points -> two lines, or three when closed
     * @param inputs - The polyline
     * @returns One line per segment, in order
     * @group convert
     * @shortname polyline to lines
     * @drawable true
     * @example
     * ```typescript
     * const lines = bitbybit.polyline.polylineToLines({ polyline: { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], isClosed: true } });
     * ```
     */
    polylineToLines(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Line3[] {
        const segments = this.polylineToSegments(inputs);
        return segments.map((segment) => ({
            start: segment[0],
            end: segment[1],
        }));
    }

    /**
     * Splits the polyline into segments, each a pair of points.
     *
     * A closed polyline also gets the segment from its last point back to its first, unless the two
     * coincide. Fewer than two points give no segments.
     * Example: four points, closed -> four segments around the loop
     * @param inputs - The polyline
     * @returns One point pair per segment, in order
     * @group convert
     * @shortname polyline to segments
     * @drawable false
     * @example
     * ```typescript
     * const segments = bitbybit.polyline.polylineToSegments({ polyline: { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], isClosed: false } });
     * ```
     */
    polylineToSegments(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Segment3[] {
        const polyline = inputs.polyline;

        const segments: Inputs.Base.Segment3[] = [];
        const points = polyline.points;
        const numPoints = points.length;

        if (numPoints < 2) {
            return segments;
        }

        for (let i = 0; i < numPoints - 1; i++) {
            segments.push([points[i]!, points[i + 1]!]);
        }

        if (polyline.isClosed && numPoints >= 2) {
            if (!this.point.twoPointsAlmostEqual({ point1: points[numPoints - 1]!, point2: points[0]!, tolerance: 1e-9 })) {
                segments.push([points[numPoints - 1]!, points[0]!]);
            }
        }

        return segments;
    }

    /**
     * Finds the points where the polyline crosses itself.
     *
     * Neighboring segments are not tested against each other, and crossings closer together than
     * the tolerance are reported once.
     * Example: a figure-eight -> its one crossing point
     * @param inputs - The polyline and the tolerance
     * @returns The crossing points; empty when there are none
     * @group intersections
     * @shortname polyline self intersections
     * @drawable true
     * @example
     * ```typescript
     * const crossings = bitbybit.polyline.polylineSelfIntersection({
     *     polyline: { points: [[0, 0, 0], [2, 2, 0], [2, 0, 0], [0, 2, 0]] },
     *     tolerance: 1e-6,
     * });
     * ```
     */
    polylineSelfIntersection(inputs: Inputs.Polyline.PolylineToleranceDto): Inputs.Base.Point3[] {
        const { polyline, tolerance } = inputs;
        const lines = this.polylineToLines({ polyline });
        const numSegments = lines.length;

        if (numSegments < 3) {
            return [];
        }

        const selfIntersectionPoints: Inputs.Base.Point3[] = [];
        const defaultTolerance = tolerance ?? 1e-6;

        for (let i = 0; i < numSegments; i++) {
            for (let j = i + 1; j < numSegments; j++) {
                let areAdjacent = (j === i + 1);
                if (!areAdjacent && polyline.isClosed && i === 0 && j === numSegments - 1) {
                    areAdjacent = true;
                }

                if (areAdjacent) {
                    continue;
                }

                const intersection = this.line.lineLineIntersection({
                    line1: lines[i]!,
                    line2: lines[j]!,
                    checkSegmentsOnly: true,
                    tolerance: defaultTolerance,
                });

                if (intersection) {
                    let foundClose = false;
                    for (const existingPoint of selfIntersectionPoints) {
                        if (this.point.twoPointsAlmostEqual({
                            point1: intersection,
                            point2: existingPoint,
                            tolerance: defaultTolerance
                        })) {
                            foundClose = true;
                            break;
                        }
                    }
                    if (!foundClose) {
                        selfIntersectionPoints.push(intersection);
                    }
                }
            }
        }

        return selfIntersectionPoints;
    }

    /**
     * Finds the points where two polylines cross each other, testing every segment of one against
     * every segment of the other.
     *
     * Crossings closer together than the tolerance are reported once.
     * Example: two polylines forming an X -> the point in the middle
     * @param inputs - The two polylines and the tolerance
     * @returns The crossing points; empty when there are none
     * @group intersection
     * @shortname two polyline intersection
     * @drawable true
     * @example
     * ```typescript
     * const crossings = bitbybit.polyline.twoPolylineIntersection({
     *     polyline1: { points: [[0, 0, 0], [2, 2, 0]] },
     *     polyline2: { points: [[0, 2, 0], [2, 0, 0]] },
     *     tolerance: 1e-6,
     * });
     * ```
     */
    twoPolylineIntersection(inputs: Inputs.Polyline.TwoPolylinesToleranceDto): Inputs.Base.Point3[] {
        const { polyline1, polyline2, tolerance } = inputs;
        const lines1 = this.polylineToLines({ polyline: polyline1 });
        const lines2 = this.polylineToLines({ polyline: polyline2 });

        const intersectionPoints: Inputs.Base.Point3[] = [];
        const defaultTolerance = tolerance ?? 1e-6;

        for (const seg1 of lines1) {
            for (const seg2 of lines2) {
                const intersection = this.line.lineLineIntersection({
                    line1: seg1,
                    line2: seg2,
                    checkSegmentsOnly: true,
                    tolerance: defaultTolerance,
                });

                if (intersection) {
                    let foundClose = false;
                    for (const existingPoint of intersectionPoints) {
                        if (this.point.twoPointsAlmostEqual({
                            point1: intersection,
                            point2: existingPoint,
                            tolerance: defaultTolerance
                        })) {
                            foundClose = true;
                            break;
                        }
                    }

                    if (!foundClose) {
                        intersectionPoints.push(intersection);
                    }
                }
            }
        }

        return intersectionPoints;
    }

    /**
     * Joins loose segments into polylines by matching up ends that meet within the tolerance.
     *
     * Segments that connect end to end become one polyline each chain; segments that touch nothing
     * become single-segment polylines.
     * Example: ten scattered segments forming two chains -> two polylines
     * @param inputs - The segments and the tolerance for two ends to count as touching
     * @returns The polylines the segments form
     * @group sort
     * @shortname segments to polylines
     * @drawable true
     * @example
     * ```typescript
     * const chains = bitbybit.polyline.sortSegmentsIntoPolylines({
     *     segments: [[[0, 0, 0], [1, 0, 0]], [[1, 0, 0], [1, 1, 0]], [[5, 5, 0], [6, 5, 0]]],
     *     tolerance: 1e-5,
     * });
     * ```
     */
    sortSegmentsIntoPolylines(inputs: Inputs.Polyline.SegmentsToleranceDto): Inputs.Base.Polyline3[] {
        const tolerance = inputs.tolerance ?? 1e-5;
        const segments = inputs.segments;
        if (!segments || segments.length === 0) {
            return [];
        }

        const toleranceSq = tolerance * tolerance;
        const numSegments = segments.length;
        const used = new Array<boolean>(numSegments).fill(false);
        const results: Inputs.Base.Polyline3[] = [];

        interface EndpointInfo {
            segmentIndex: number;
            endpointIndex: 0 | 1;
            coords: Inputs.Base.Point3;
        }
        const endpointMap = new Map<string, EndpointInfo[]>();
        const invTolerance = 1.0 / tolerance;

        const getGridKey = (p: Inputs.Base.Point3): string => {
            const ix = Math.round(p[0] * invTolerance);
            const iy = Math.round(p[1] * invTolerance);
            const iz = Math.round(p[2] * invTolerance);
            return `${ix},${iy},${iz}`;
        };

        for (let i = 0; i < numSegments; i++) {
            const segment = segments[i]!;
            if (this.point.twoPointsAlmostEqual({ point1: segment[0], point2: segment[1], tolerance: tolerance })) {
                used[i] = true;
                continue;
            }

            const key0 = getGridKey(segment[0]);
            const key1 = getGridKey(segment[1]);
            const info0: EndpointInfo = { segmentIndex: i, endpointIndex: 0, coords: segment[0] };
            const info1: EndpointInfo = { segmentIndex: i, endpointIndex: 1, coords: segment[1] };

            if (!endpointMap.has(key0)) endpointMap.set(key0, []);

            endpointMap.get(key0)!.push(info0);

            if (key1 !== key0) {
                if (!endpointMap.has(key1)) endpointMap.set(key1, []);

                endpointMap.get(key1)!.push(info1);
            } else {

                endpointMap.get(key0)!.push(info1);
            }
        }

        const findConnection = (
            pointToMatch: Inputs.Base.Point3
        ): EndpointInfo | undefined => {
            const searchKeys: string[] = [];
            const px = Math.round(pointToMatch[0] * invTolerance);
            const py = Math.round(pointToMatch[1] * invTolerance);
            const pz = Math.round(pointToMatch[2] * invTolerance);

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        searchKeys.push(`${px + dx},${py + dy},${pz + dz}`);
                    }
                }
            }

            let bestMatch: EndpointInfo | undefined = undefined;
            let minDistanceSq = toleranceSq;

            for (const searchKey of searchKeys) {
                const candidates = endpointMap.get(searchKey);
                if (!candidates) continue;

                for (const candidate of candidates) {
                    if (!used[candidate.segmentIndex]) {
                        const diffVector = this.vector.sub({ first: candidate.coords, second: pointToMatch });
                        const distSq = this.vector.lengthSq({ vector: diffVector as Inputs.Base.Vector3 });

                        if (distSq < minDistanceSq) {
                            if (this.point.twoPointsAlmostEqual({ point1: candidate.coords, point2: pointToMatch, tolerance: tolerance })) {
                                bestMatch = candidate;
                                minDistanceSq = distSq;
                            }
                        }
                    }
                }
            }
            if (bestMatch && !used[bestMatch.segmentIndex]) {
                return bestMatch;
            }
            return undefined;
        };


        for (let i = 0; i < numSegments; i++) {
            if (used[i]) continue;

            used[i] = true;
            const startSegment = segments[i]!;
            const currentPoints: Inputs.Base.Point3[] = [startSegment[0], startSegment[1]];
            let currentHead = startSegment[0];
            let currentTail = startSegment[1];
            let isClosed = false;
            let iterations = 0;

            while (iterations++ < numSegments) {
                const nextMatch = findConnection(currentTail);
                if (!nextMatch) break;

                const nextSegment = segments[nextMatch.segmentIndex]!;
                const pointToAdd = (nextMatch.endpointIndex === 0) ? nextSegment[1] : nextSegment[0];

                if (this.point.twoPointsAlmostEqual({ point1: pointToAdd, point2: currentHead, tolerance: tolerance })) {
                    isClosed = true;
                    used[nextMatch.segmentIndex] = true;
                    break;
                }

                used[nextMatch.segmentIndex] = true;
                currentPoints.push(pointToAdd);
                currentTail = pointToAdd;
            }

            iterations = 0;
            if (!isClosed) {
                while (iterations++ < numSegments) {
                    const prevMatch = findConnection(currentHead);
                    if (!prevMatch) break;

                    const prevSegment = segments[prevMatch.segmentIndex]!;
                    const pointToAdd = (prevMatch.endpointIndex === 0) ? prevSegment[1] : prevSegment[0];

                    if (this.point.twoPointsAlmostEqual({ point1: pointToAdd, point2: currentTail, tolerance: tolerance })) {
                        isClosed = true;
                        used[prevMatch.segmentIndex] = true;
                        break;
                    }

                    used[prevMatch.segmentIndex] = true;
                    currentPoints.unshift(pointToAdd);
                    currentHead = pointToAdd;
                }
            }

            if (!isClosed && currentPoints.length >= 2) {
                isClosed = this.point.twoPointsAlmostEqual({ point1: currentHead, point2: currentTail, tolerance: tolerance });
            }

            if (isClosed && currentPoints.length > 2) {
                if (this.point.twoPointsAlmostEqual({ point1: currentPoints[currentPoints.length - 1]!, point2: currentPoints[0]!, tolerance: tolerance })) {
                    currentPoints.pop();
                }
            }

            results.push({
                points: currentPoints,
                isClosed: isClosed,
            });
        }

        return results;
    }

    /**
     * Finds the largest fillet for every corner of the polyline, each limited to the nearer half of
     * its segments so the fillets never overlap.
     *
     * A closed polyline includes the two corners at its ends. Fewer than three points give an empty
     * list.
     * @param inputs - The polyline and the tolerance
     * @returns One radius per corner, in the order of the corners
     * @group fillet
     * @shortname polyline max fillet radii
     * @drawable false
     * @example
     * ```typescript
     * const radii = bitbybit.polyline.maxFilletsHalfLine({
     *     polyline: { points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]], isClosed: true },
     *     tolerance: 1e-7,
     * });
     * ```
     */
    maxFilletsHalfLine(
        inputs: Inputs.Polyline.PolylineToleranceDto
    ): number[] {
        return this.point.maxFilletsHalfLine({
            points: inputs.polyline.points,
            checkLastWithFirst: inputs.polyline.isClosed,
            tolerance: inputs.tolerance,
        });
    }

    /**
     * Finds one fillet radius that fits every corner of the polyline: the smallest of the
     * per-corner maximums under the half-segment rule.
     *
     * Fewer than three points, or any corner that allows no fillet, give 0.
     * @param inputs - The polyline and the tolerance
     * @returns The radius that fits every corner, in model units
     * @group fillet
     * @shortname polyline safest fillet radius
     * @drawable false
     * @example
     * ```typescript
     * const radius = bitbybit.polyline.safestFilletRadius({
     *     polyline: { points: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]], isClosed: true },
     *     tolerance: 1e-7,
     * });
     * ```
     */
    safestFilletRadius(
        inputs: Inputs.Polyline.PolylineToleranceDto
    ): number {
        const allMaxRadii = this.maxFilletsHalfLine(inputs);

        if (allMaxRadii.length === 0) {
            return 0;
        }

        const safestRadius = Math.min(...allMaxRadii);

        return Math.max(0, safestRadius);
    }

}

