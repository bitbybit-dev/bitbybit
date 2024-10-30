import * as Inputs from "./inputs";

export class GeometryHelper {

    transformControlPoints(transformation: number[][] | number[][][], transformedControlPoints: Inputs.Base.Point3[]): Inputs.Base.Point3[] {
        const transformationArrays = this.getFlatTransformations(transformation);

        transformationArrays.forEach(transform => {

            transformedControlPoints = this.transformPointsByMatrixArray(transformedControlPoints, transform);
        });
        return transformedControlPoints;
    }

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

    getArrayDepth = (value): number => {
        return Array.isArray(value) ?
            1 + Math.max(...value.map(this.getArrayDepth)) :
            0;
    };

    transformPointsByMatrixArray(points: Inputs.Base.Point3[], transform: number[]): Inputs.Base.Point3[] {
        return this.transformPointsCoordinates(points, transform);
    }

    transformPointsCoordinates(points: Inputs.Base.Point3[], transform: number[]): Inputs.Base.Point3[] {
        const transformedPoints = [];
        for (const pt of points) {
            const transformedVector = this.transformCoordinates(pt[0], pt[1], pt[2], transform);
            transformedPoints.push(transformedVector);
        }
        return transformedPoints;
    }

    // Algorithm works with arbitrary length numeric vectors. This algorithm is more costly for longer arrays of vectors
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

    // Algorithm works with arbitrary length numeric vectors. 
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

    approxEq(num1: number, num2: number, tolerance: number): boolean {
        const res = Math.abs(num1 - num2) < tolerance;
        return res;
    }

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
