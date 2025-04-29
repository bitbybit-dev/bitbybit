import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Point } from "./point";
import { Vector } from "./vector";

/**
 * Contains various methods for polyline. Polyline in bitbybit is a simple object that has points property containing an array of points.
 * { points: number[][] }
 */
export class Polyline {

    constructor(private readonly vector: Vector, private readonly point: Point, private readonly geometryHelper: GeometryHelper) { }

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
                        const distSq = this.vector.lengthSq({ vector: diffVector as Inputs.Base.Vector3});

                        if (distSq < minDistanceSq) {
                           // Check with precise method if it's a potential best match
                            if (this.point.twoPointsAlmostEqual({point1: candidate.coords, point2: pointToMatch, tolerance: tolerance})){
                                bestMatch = candidate;
                                minDistanceSq = distSq; // Update min distance found
                            }
                        }
                    }
                }
            }
            // No need for final check here, already done inside the loop
             if(bestMatch && !used[bestMatch.segmentIndex]) { // Double check used status
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


}

