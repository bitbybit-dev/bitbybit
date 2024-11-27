export class VectorHelperService {

    private readonly tolerance = 0.00001;


    degToRad(degrees: number) {
        return degrees * (Math.PI / 180);
    }

    remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
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
    removeConsecutiveDuplicates(vectors: number[][], checkFirstAndLast = true): number[][] {
        const vectorsRemaining: number[][] = [];
        if (vectors.length > 1) {
            for (let i = 1; i < vectors.length; i++) {
                const currentVector = vectors[i];
                const previousVector = vectors[i - 1];
                if (!this.vectorsTheSame(currentVector, previousVector, this.tolerance)) {
                    vectorsRemaining.push(previousVector);
                }
                if (i === vectors.length - 1) {
                    vectorsRemaining.push(currentVector);
                }
            }
            if (checkFirstAndLast) {
                const firstVector = vectorsRemaining[0];
                const lastVector = vectorsRemaining[vectorsRemaining.length - 1];
                if (this.vectorsTheSame(firstVector, lastVector, this.tolerance)) {
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

    averageVector(vectors: number[][]): number[] {
        const average = vectors.reduce((acc, val) => {
            return acc.map((a, i) => a + val[i]);
        }, [0, 0, 0]);
        return average.map(a => a / vectors.length);
    }

    magnitude(vector: number[]): number {
        return Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
    }

    normalize(vector: number[]): number[] {
        const magnitude = this.magnitude(vector);
        return vector.map(v => v / magnitude);
    }

    translatePoint(point: [number, number, number], vector: [number, number, number], distance: number): [number, number, number] {
        const x = point[0] + vector[0] * distance;
        const y = point[1] + vector[1] * distance;
        const z = point[2] + vector[2] * distance;
        return [x, y, z];
    }

    angleBetweenVectors(vector1: [number, number, number], vector2: [number, number, number]): number {
        const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1] + vector1[2] * vector2[2];
        const magnitude1 = this.magnitude(vector1);
        const magnitude2 = this.magnitude(vector2);
        return Math.acos(dotProduct / (magnitude1 * magnitude2));
    }

    distanceBetweenPoints(point1: [number, number, number], point2: [number, number, number]): number {
        const x = point2[0] - point1[0];
        const y = point2[1] - point1[1];
        const z = point2[2] - point1[2];
        return Math.sqrt(x * x + y * y + z * z);
    }
}