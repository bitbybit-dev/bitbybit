
export class VectorHelperService {

    private readonly tolerance = 0.00001;

    // this algorithm is more costly for longer arrays of points.
    removeAllDuplicateVectors(items: any[][], tolerance = 1e-7) {
        const cleanItems = [];
        items.forEach(item => {
            // when there are no points in cleanPoints array that match the current point, push it in.
            if (!cleanItems.some(s => this.vectorsTheSame(item, s, tolerance))) {
                cleanItems.push(item);
            }
        })
        return cleanItems;
    }

    removeConsecutiveDuplicates(points: number[][], checkFirstAndLast: boolean = true): number[][] {
        const pointsRemaining = [];
        if (points.length > 1) {
            for (let i = 1; i < points.length; i++) {
                const currentPoint = points[i];
                const previousPoint = points[i - 1];
                if (!this.vectorsTheSame(currentPoint, previousPoint, this.tolerance)) {
                    pointsRemaining.push(previousPoint);
                }
                if (i === points.length - 1) {
                    pointsRemaining.push(currentPoint);
                }
            }
            if (checkFirstAndLast) {
                const firstPoint = pointsRemaining[0];
                const lastPoint = pointsRemaining[pointsRemaining.length - 1];
                if (this.vectorsTheSame(firstPoint, lastPoint, this.tolerance)) {
                    pointsRemaining.pop();
                }
            }
        } else if (points.length === 1) {
            pointsRemaining.push(...points);
        }
        return pointsRemaining;
    }

    vectorsTheSame(vec1: any[], vec2: any[], tolerance: number) {
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
}