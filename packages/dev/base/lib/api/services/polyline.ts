import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Point } from "./point";
import { Vector } from "./vector";
import { Line } from "./line";

/**
 * Contains various methods for polyline. Polyline in bitbybit is a simple object that has points property containing an array of points.
 * { points: number[][] }
 */
export class Polyline {

    constructor(private readonly vector: Vector, private readonly point: Point, private readonly line: Line, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Gets the length of the polyline
     * @param inputs a polyline
     * @returns length
     * @group get
     * @shortname polyline length
     * @drawable false
     */
    length(inputs: Inputs.Polyline.PolylineDto): number {
        let distanceOfPolyline = 0;
        for (let i = 1; i < inputs.polyline.points.length; i++) {
            const previousPoint = inputs.polyline.points[i - 1];
            const currentPoint = inputs.polyline.points[i];
            distanceOfPolyline += this.point.distance({ startPoint: previousPoint, endPoint: currentPoint });
        }
        return distanceOfPolyline;
    }

    /**
     * Gets the number of points in the polyline
     * @param inputs a polyline
     * @returns nr of points
     * @group get
     * @shortname nr polyline points
     * @drawable false
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number {
        return inputs.polyline.points.length;
    }

    /**
     * Gets the points of the polyline
     * @param inputs a polyline
     * @returns points
     * @group get
     * @shortname points
     * @drawable true
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Point3[] {
        return inputs.polyline.points;
    }

    /**
     * Reverse the points of the polyline
     * @param inputs a polyline
     * @returns reversed polyline
     * @group convert
     * @shortname reverse polyline
     * @drawable true
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        return { points: inputs.polyline.points.reverse() };
    }

    /**
     * Transform the polyline
     * @param inputs a polyline
     * @returns transformed polyline
     * @group transforms
     * @shortname transform polyline
     * @drawable true
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        const transformation = inputs.transformation;
        let transformedControlPoints = inputs.polyline.points;
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return { points: transformedControlPoints };
    }

    /**
     * Create the polyline
     * @param inputs points and info if its closed
     * @returns polyline
     * @group create
     * @shortname polyline
     * @drawable true
     */
    create(inputs: Inputs.Polyline.PolylineCreateDto): Inputs.Polyline.PolylinePropertiesDto {
        return {
            points: inputs.points,
        };
    }

    /**
     * Create the lines from the polyline
     * @param inputs polyline
     * @returns lines
     * @group convert
     * @shortname polyline to lines
     * @drawable true
     */
    polylineToLines(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Line3[] {
        const segments = this.polylineToSegments(inputs);
        return segments.map((segment) => ({
            start: segment[0],
            end: segment[1],
        }));
    }

    /**
     * Create the segments from the polyline
     * @param inputs polyline
     * @returns segments
     * @group convert
     * @shortname polyline to segments
     * @drawable false
     */
    polylineToSegments(inputs: Inputs.Polyline.PolylineDto): Inputs.Base.Segment3[] {
        const polyline = inputs.polyline;

        const segments: Inputs.Base.Segment3[] = [];
        const points = polyline.points;
        const numPoints = points.length;

        if (numPoints < 2) {
            return segments;
        }

        // Create segments between consecutive points
        for (let i = 0; i < numPoints - 1; i++) {
            segments.push([points[i], points[i + 1]]);
        }

        // Add closing segment if the polyline is closed and has enough points
        if (polyline.isClosed && numPoints >= 2) {
            if (!this.point.twoPointsAlmostEqual({ point1: points[numPoints - 1], point2: points[0], tolerance: 1e-9 })) {
                segments.push([points[numPoints - 1], points[0]]);
            }
        }

        return segments;
    }

    /**
     * Finds the points of self intersection of the polyline
     * @param inputs points of self intersection
     * @returns polyline
     * @group intersections
     * @shortname polyline self intersections
     * @drawable true
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
                    line1: lines[i],
                    line2: lines[j],
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
     * Finds the intersection points between two polylines
     * @param inputs two polylines and tolerance
     * @returns points
     * @group intersection
     * @shortname two polyline intersection
     * @drawable true
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
     * Create the polylines from segments that are potentially connected but scrambled randomly
     * @param inputs segments
     * @returns polylines
     * @group sort
     * @shortname segments to polylines
     * @drawable true
     */
    sortSegmentsIntoPolylines(inputs: Inputs.Polyline.SegmentsToleranceDto): Inputs.Base.Polyline3[] {
        const tolerance = inputs.tolerance ?? 1e-5; // Default tolerance
        const segments = inputs.segments;
        if (!segments || segments.length === 0) {
            return [];
        }

        const toleranceSq = tolerance * tolerance;
        const numSegments = segments.length;
        const used = new Array<boolean>(numSegments).fill(false);
        const results: Inputs.Base.Polyline3[] = [];

        // --- Spatial Hash Map ---
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

        // 1. Build the spatial map
        for (let i = 0; i < numSegments; i++) {
            const segment = segments[i];
            if (this.point.twoPointsAlmostEqual({ point1: segment[0], point2: segment[1], tolerance: tolerance })) {
                used[i] = true; // Mark degenerate as used
                continue;
            }

            const key0 = getGridKey(segment[0]);
            const key1 = getGridKey(segment[1]);
            const info0: EndpointInfo = { segmentIndex: i, endpointIndex: 0, coords: segment[0] };
            const info1: EndpointInfo = { segmentIndex: i, endpointIndex: 1, coords: segment[1] };

            if (!endpointMap.has(key0)) endpointMap.set(key0, []);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            endpointMap.get(key0)!.push(info0);

            if (key1 !== key0) {
                if (!endpointMap.has(key1)) endpointMap.set(key1, []);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                endpointMap.get(key1)!.push(info1);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                endpointMap.get(key0)!.push(info1); // Add both endpoints if same key
            }
        }

        // --- Helper to find connecting segment ---
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
                    // Only consider segments not already used in *any* polyline
                    if (!used[candidate.segmentIndex]) {
                        const diffVector = this.vector.sub({ first: candidate.coords, second: pointToMatch });
                        const distSq = this.vector.lengthSq({ vector: diffVector as Inputs.Base.Vector3 });

                        if (distSq < minDistanceSq) {
                            // Check with precise method if it's a potential best match
                            if (this.point.twoPointsAlmostEqual({ point1: candidate.coords, point2: pointToMatch, tolerance: tolerance })) {
                                bestMatch = candidate;
                                minDistanceSq = distSq; // Update min distance found
                            }
                        }
                    }
                }
            }
            // No need for final check here, already done inside the loop
            if (bestMatch && !used[bestMatch.segmentIndex]) { // Double check used status
                return bestMatch;
            }
            return undefined;
        };


        // 2. Iterate and chain segments
        for (let i = 0; i < numSegments; i++) {
            if (used[i]) continue; // Skip if already part of a polyline

            // Start a new polyline
            used[i] = true; // Mark the starting segment as used
            const startSegment = segments[i];
            const currentPoints: Inputs.Base.Point3[] = [startSegment[0], startSegment[1]];
            let currentHead = startSegment[0];
            let currentTail = startSegment[1];
            let isClosed = false;
            let iterations = 0;

            // Extend forward (tail)
            while (iterations++ < numSegments) {
                const nextMatch = findConnection(currentTail);
                if (!nextMatch) break; // No unused segment connects to the tail

                // We found a potential next segment
                const nextSegment = segments[nextMatch.segmentIndex];
                const pointToAdd = (nextMatch.endpointIndex === 0) ? nextSegment[1] : nextSegment[0];

                // Check for closure *before* adding the point
                if (this.point.twoPointsAlmostEqual({ point1: pointToAdd, point2: currentHead, tolerance: tolerance })) {
                    isClosed = true;
                    // Mark the closing segment as used
                    used[nextMatch.segmentIndex] = true;
                    break; // Closed loop found
                }

                // Not closing, so add the point and mark the segment used
                used[nextMatch.segmentIndex] = true;
                currentPoints.push(pointToAdd);
                currentTail = pointToAdd;
            }

            // Extend backward (head) - only if not already closed
            iterations = 0;
            if (!isClosed) {
                while (iterations++ < numSegments) {
                    const prevMatch = findConnection(currentHead);
                    if (!prevMatch) break; // No unused segment connects to the head

                    const prevSegment = segments[prevMatch.segmentIndex];
                    const pointToAdd = (prevMatch.endpointIndex === 0) ? prevSegment[1] : prevSegment[0];

                    // Check for closure against the current tail *before* adding
                    if (this.point.twoPointsAlmostEqual({ point1: pointToAdd, point2: currentTail, tolerance: tolerance })) {
                        isClosed = true;
                        // Mark the closing segment as used
                        used[prevMatch.segmentIndex] = true;
                        break; // Closed loop found
                    }

                    // Not closing, add point to beginning and mark segment used
                    used[prevMatch.segmentIndex] = true;
                    currentPoints.unshift(pointToAdd);
                    currentHead = pointToAdd;
                }
            }

            // Final closure check (might be redundant now, but harmless)
            // This catches cases like A->B, B->A which form a 2-point closed loop
            if (!isClosed && currentPoints.length >= 2) {
                isClosed = this.point.twoPointsAlmostEqual({ point1: currentHead, point2: currentTail, tolerance: tolerance });
            }

            // Remove duplicate point for closed loops with more than 2 points
            if (isClosed && currentPoints.length > 2) {
                // Check if the first and last points are indeed the ones needing merging
                if (this.point.twoPointsAlmostEqual({ point1: currentPoints[currentPoints.length - 1], point2: currentPoints[0], tolerance: tolerance })) {
                    currentPoints.pop();
                }
            }

            // Add the completed polyline (even if it's just the starting segment)
            results.push({
                points: currentPoints,
                isClosed: isClosed,
            });
        }

        return results;
    }

    /**
     * Calculates the maximum possible half-line fillet radius for each corner
     * of a given polyline. For a closed polyline, it includes the corners
     * connecting the last segment back to the first.
     *
     * The calculation uses the 'half-line' constraint, meaning the fillet's
     * tangent points must lie within the first half of each segment connected
     * to the corner.
     *
     * @param inputs Defines the polyline points, whether it's closed, and an optional tolerance.
     * @returns An array containing the maximum fillet radius calculated for each corner.
     *          The order corresponds to corners P[1]...P[n-2] for open polylines,
     *          and P[1]...P[n-2], P[0], P[n-1] for closed polylines.
     *          Returns an empty array if the polyline has fewer than 3 points.
     * @group fillet
     * @shortname polyline max fillet radii
     * @drawable false
     */
    polylineMaxFilletRadii(
        inputs: Inputs.Polyline.PolylineToleranceDto
    ): number[] {
        return this.point.pointsMaxFilletsHalfLine({
            points: inputs.polyline.points,
            checkLastWithFirst: inputs.polyline.isClosed,
            tolerance: inputs.tolerance,
        });
    }

    /**
     * Calculates the single safest maximum fillet radius that can be applied
     * uniformly to all corners of a polyline, based on the 'half-line' constraint.
     * This is determined by finding the minimum of the maximum possible fillet
     * radii calculated for each individual corner.
     *
     * @param inputs Defines the polyline points, whether it's closed, and an optional tolerance.
     * @returns The smallest value from the results of calculatePolylineMaxFillets.
     *          Returns 0 if the polyline has fewer than 3 points or if any
     *          calculated maximum radius is 0.
     * @group fillet
     * @shortname polyline safest fillet radius
     * @drawable false
     */
    safestPolylineFilletRadius(
        inputs: Inputs.Polyline.PolylineToleranceDto
    ): number {
        const allMaxRadii = this.polylineMaxFilletRadii(inputs);

        if (allMaxRadii.length === 0) {
            // No corners, or fewer than 3 points. No fillet possible.
            return 0;
        }

        // Find the minimum radius among all calculated maximums.
        // If any corner calculation resulted in 0, the safest radius is 0.
        const safestRadius = Math.min(...allMaxRadii);

        // Ensure we don't return a negative radius if Math.min had weird input (shouldn't happen here)
        return Math.max(0, safestRadius);
    }

}

