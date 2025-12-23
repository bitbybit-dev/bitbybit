import * as Inputs from "../inputs";

export class GeometryHelper {

    /**
     * Applies one or more 4×4 transformation matrices to a list of points sequentially.
     * Each transformation is applied in order (composition of transformations).
     * Example: points=[[0,0,0], [1,0,0]] with translation [5,0,0] → [[5,0,0], [6,0,0]]
     */
    transformControlPoints(transformation: number[][] | number[][][], transformedControlPoints: Inputs.Base.Point3[]): Inputs.Base.Point3[] {
        const transformationArrays = this.getFlatTransformations(transformation);

        transformationArrays.forEach(transform => {

            transformedControlPoints = this.transformPointsByMatrixArray(transformedControlPoints, transform);
        });
        return transformedControlPoints;
    }

    /**
     * Flattens nested transformation arrays into a single-level array of transformation matrices.
     * Handles both 2D arrays (single transform list) and 3D arrays (nested transform lists).
     * Example: [[[matrix1, matrix2]], [[matrix3]]] → [matrix1, matrix2, matrix3]
     */
    getFlatTransformations(transformation: number[][] | number[][][]): number[][] {
        let transformationArrays = [];

        if (this.getArrayDepth(transformation) === 3) {
            transformation.forEach(transform => {
                transformationArrays.push(...transform);
            });
        } else {
            transformationArrays = transformation;
        }
        return transformationArrays;
}

    /**
     * Calculates the nesting depth of an array recursively.
     * Example: [1,2,3] → 1, [[1,2],[3,4]] → 2, [[[1]]] → 3
     */
    getArrayDepth = (value): number => {
        return Array.isArray(value) ?
            1 + Math.max(...value.map(this.getArrayDepth)) :
            0;
    };

    /**
     * Applies a single 4×4 transformation matrix (as flat 16-element array) to multiple points.
     * Example: points=[[0,0,0], [1,0,0]] with translation matrix → transformed points
     */
    transformPointsByMatrixArray(points: Inputs.Base.Point3[], transform: number[]): Inputs.Base.Point3[] {
        return this.transformPointsCoordinates(points, transform);
    }

    /**
     * Transforms multiple points using a transformation matrix (maps each point through the matrix).
     * Example: points=[[1,0,0], [0,1,0]] with 90° rotation → [[0,1,0], [-1,0,0]]
     */
    transformPointsCoordinates(points: Inputs.Base.Point3[], transform: number[]): Inputs.Base.Point3[] {
        const transformedPoints = [];
        for (const pt of points) {
            const transformedVector = this.transformCoordinates(pt[0], pt[1], pt[2], transform);
            transformedPoints.push(transformedVector);
        }
        return transformedPoints;
    }

    /**
     * Removes all duplicate vectors from a list (works with arbitrary-length numeric vectors).
     * Compares vectors using tolerance for floating-point equality.
     * Example: [[1,2], [3,4], [1,2], [5,6]] with tolerance=1e-7 → [[1,2], [3,4], [5,6]]
     */
    removeAllDuplicateVectors(vectors: number[][], tolerance = 1e-7): number[][] {
        const cleanVectors: number[][] = [];
        vectors.forEach(vector => {
            // when there are no vectors in cleanVectors array that match the current vector, push it in.
            if (!cleanVectors.some(s => this.vectorsTheSame(vector, s, tolerance))) {
                cleanVectors.push(vector);
            }
        });
        return cleanVectors;
    }

    /**
     * Removes consecutive duplicate vectors from a list (keeps only first occurrence in each sequence).
     * Optionally checks and removes duplicate if first and last vectors match.
     * Example: [[1,2], [1,2], [3,4], [3,4], [5,6]] → [[1,2], [3,4], [5,6]]
     */
    removeConsecutiveVectorDuplicates(vectors: number[][], checkFirstAndLast = true, tolerance = 1e-7): number[][] {
        const vectorsRemaining: number[][] = [];
        if (vectors.length > 1) {
            for (let i = 1; i < vectors.length; i++) {
                const currentVector = vectors[i];
                const previousVector = vectors[i - 1];
                if (!this.vectorsTheSame(currentVector, previousVector, tolerance)) {
                    vectorsRemaining.push(previousVector);
                }
                if (i === vectors.length - 1) {
                    vectorsRemaining.push(currentVector);
                }
            }
            if (checkFirstAndLast) {
                const firstVector = vectorsRemaining[0];
                const lastVector = vectorsRemaining[vectorsRemaining.length - 1];
                if (this.vectorsTheSame(firstVector, lastVector, tolerance)) {
                    vectorsRemaining.pop();
                }
            }
        } else if (vectors.length === 1) {
            vectorsRemaining.push(...vectors);
        }
        return vectorsRemaining;
    }

    /**
     * Compares two vectors for approximate equality using tolerance (element-wise comparison).
     * Returns false if vectors have different lengths.
     * Example: [1.0000001, 2.0], [1.0, 2.0] with tolerance=1e-6 → true
     */
    vectorsTheSame(vec1: number[], vec2: number[], tolerance: number) {
        let result = false;
        if (vec1.length !== vec2.length) {
            return result;
        } else {
            result = true;
            for (let i = 0; i < vec1.length; i++) {
                if (!this.approxEq(vec1[i], vec2[i], tolerance)) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    }

    /**
     * Checks if two numbers are approximately equal within a tolerance.
     * Example: 1.0000001, 1.0 with tolerance=1e-6 → true, 1.001, 1.0 with tolerance=1e-6 → false
     */
    approxEq(num1: number, num2: number, tolerance: number): boolean {
        const res = Math.abs(num1 - num2) < tolerance;
        return res;
    }

    /**
     * Removes consecutive duplicate points from a list (specialized for 3D/2D points).
     * Optionally checks and removes duplicate if first and last points match (for closed loops).
     * Example: [[0,0,0], [0,0,0], [1,0,0], [1,0,0]] → [[0,0,0], [1,0,0]]
     */
    removeConsecutivePointDuplicates(points: Inputs.Base.Point3[], checkFirstAndLast = true, tolerance = 1e-7): Inputs.Base.Point3[] {
        const pointsRemaining = [];
        if (points.length > 1) {
            for (let i = 1; i < points.length; i++) {
                const currentPoint = points[i];
                const previousPoint = points[i - 1];
                if (!this.arePointsTheSame(currentPoint, previousPoint, tolerance)) {
                    pointsRemaining.push(previousPoint);
                }
                if (i === points.length - 1) {
                    pointsRemaining.push(currentPoint);
                }
            }
            if (checkFirstAndLast) {
                const firstPoint = pointsRemaining[0];
                const lastPoint = pointsRemaining[pointsRemaining.length - 1];
                if (this.arePointsTheSame(firstPoint, lastPoint, tolerance)) {
                    pointsRemaining.pop();
                }
            }
        } else if (points.length === 1) {
            pointsRemaining.push(...points);
        }
        return pointsRemaining;
    }

    /**
     * Checks if two points are approximately equal using tolerance (supports 2D and 3D points).
     * Example: [1.0000001, 2.0, 3.0], [1.0, 2.0, 3.0] with tolerance=1e-6 → true
     */
    arePointsTheSame(pointA: Inputs.Base.Point3 | Inputs.Base.Point2, pointB: Inputs.Base.Point3 | Inputs.Base.Point2, tolerance: number): boolean {
        let result = false;
        if (pointA.length === 2 && pointB.length === 2) {
            if (this.approxEq(pointA[0], pointB[0], tolerance) &&
                this.approxEq(pointA[1], pointB[1], tolerance)) {
                result = true;
            }
        } else if (pointA.length === 3 && pointB.length === 3) {
            if (this.approxEq(pointA[0], pointB[0], tolerance) &&
                this.approxEq(pointA[1], pointB[1], tolerance) &&
                this.approxEq(pointA[2], pointB[2], tolerance)) {
                result = true;
            }
        }
        return result;
    }

    private transformCoordinates(x: number, y: number, z: number, transformation: number[]): Inputs.Base.Vector3 {
        const m = transformation;
        const rx = x * m[0] + y * m[4] + z * m[8] + m[12];
        const ry = x * m[1] + y * m[5] + z * m[9] + m[13];
        const rz = x * m[2] + y * m[6] + z * m[10] + m[14];
        const rw = 1 / (x * m[3] + y * m[7] + z * m[11] + m[15]);

        const newx = rx * rw;
        const newy = ry * rw;
        const newz = rz * rw;
        return [newx, newy, newz];
    }

}
