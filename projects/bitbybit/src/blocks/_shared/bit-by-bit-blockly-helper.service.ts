import { HttpClient } from '@angular/common/http';
import { Matrix, Vector3, Mesh, Scene, Color3, MeshBuilder } from '@babylonjs/core';
import { PrintSaveInterface } from './models/print-save.model';
import { TagInterface } from './models/tag.interface';
import { OBJFileLoader } from '@babylonjs/loaders';

export class BitByBitBlocklyHelperService {

    static promptPrintSave: (prompt: PrintSaveInterface) => void;
    static clearAllDrawn: () => void;
    static tolerance = 0.00001;
    static snapTolerance = 0.00001;
    static angular: { httpClient: HttpClient, HttpHeaders: any, HttpParams: any };
    static jsonpath: any;
    static tagBag: TagInterface[] = [];
    static timeoutBag: number[] = [];
    static intervalBag: number[] = [];
    static renderLoopBag: ((timePassedFromPreviousIteration: number) => void)[] = [];
    static babylon = {
        loader: new OBJFileLoader(),
    };

    static transformPointsByMatrixArray(points: [], transform: number[]) {
        const transformMatrix = Matrix.FromArray(transform);
        return BitByBitBlocklyHelperService.transformPointsByMatrix(points, transformMatrix);
    }

    static transformPointsByMatrix(points: [], transformMatrix: Matrix) {
        const transformedPoints = [];
        for (let i = 0; i < points.length; i++) {
            const pt = points[i];
            const vector = new Vector3(pt[0], pt[1], pt[2]);
            const transformedVector = Vector3.TransformCoordinates(vector, transformMatrix);
            transformedPoints.push([transformedVector.x, transformedVector.y, transformedVector.z]);
        }
        return transformedPoints;
    }

    static getFile(): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const inputFileElement = document.getElementById('fileInput') as HTMLInputElement;

            inputFileElement.onchange = (e) => {
                const file = inputFileElement.files[0];

                if (file) {
                    const reader = new FileReader();
                    reader.readAsText(file, 'UTF-8');
                    reader.onload = (evt) => {
                        const text = evt.target.result;
                        resolve(text);
                    };
                    reader.onerror = (evt) => {
                        reject();
                    };
                } else {
                    reject();
                }
            };
            inputFileElement.click();
        });
    }

    static remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
        return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
    }

    static localAxes(size: number, scene: Scene, colorXHex: string, colorYHex: string, colorZHex: string): Mesh {
        const pilotLocalAxisX = Mesh.CreateLines('pilot_local_axisX' + Math.random(), [
            Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
            new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
        ], scene);
        const colorX = Color3.FromHexString(colorXHex);
        pilotLocalAxisX.color = colorX;

        const pilotLocalAxisY = Mesh.CreateLines('pilot_local_axisY' + Math.random(), [
            Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
            new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
        ], scene);
        const colorY = Color3.FromHexString(colorYHex);
        pilotLocalAxisY.color = colorY;

        const pilotLocalAxisZ = Mesh.CreateLines('pilot_local_axisZ' + Math.random(), [
            Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
            new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
        ], scene);
        const colorZ = Color3.FromHexString(colorZHex);
        pilotLocalAxisZ.color = colorZ;

        const localOrigin = MeshBuilder.CreateBox('local_origin' + Math.random(), { size: 1 }, scene);
        localOrigin.isVisible = false;

        pilotLocalAxisX.parent = localOrigin;
        pilotLocalAxisY.parent = localOrigin;
        pilotLocalAxisZ.parent = localOrigin;

        return localOrigin;
    }

    static removeConsecutiveDuplicates(points: number[][], tolerance: number, checkFirstAndLast: boolean = true): number[][] {
        const pointsRemaining = [];
        if (points.length > 1) {
            for (let i = 1; i < points.length; i++) {
                const currentPoint = points[i];
                const previousPoint = points[i - 1];
                if (!BitByBitBlocklyHelperService.arePointsTheSame(currentPoint, previousPoint, tolerance)) {
                    pointsRemaining.push(previousPoint);
                }
                if (i === points.length - 1) {
                    pointsRemaining.push(currentPoint);
                }
            }
            if (checkFirstAndLast) {
                const firstPoint = pointsRemaining[0];
                const lastPoint = pointsRemaining[pointsRemaining.length - 1];
                if (BitByBitBlocklyHelperService.arePointsTheSame(firstPoint, lastPoint, tolerance)) {
                    pointsRemaining.pop();
                }
            }
        } else if (points.length === 1) {
            pointsRemaining.push(...points);
        }
        return pointsRemaining;
    }

    static arePointsTheSame(pointA: number[], pointB: number[], tolerance: number): boolean {
        let result = false;
        if (pointA.length === 2 && pointB.length === 2) {
            if (Math.abs(pointA[0] - pointB[0]) < tolerance
                && Math.abs(pointA[1] - pointB[1]) < tolerance) {
                result = true;
            }
        } else if (pointA.length === 3 && pointB.length === 3) {
            if (Math.abs(pointA[0] - pointB[0]) < tolerance
                && Math.abs(pointA[1] - pointB[1]) < tolerance
                && Math.abs(pointA[2] - pointB[2]) < tolerance) {
                result = true;
            }
        }
        return result;
    }

    static snapVec3(v3): any {
        const tolerance = BitByBitBlocklyHelperService.snapTolerance;
        const x = -(Math.round(v3[0] / tolerance) * tolerance) + 0; // no more -0
        const y = Math.round(v3[1] / tolerance) * tolerance + 0; // no more -0
        const z = Math.round(v3[2] / tolerance) * tolerance + 0; // no more -0
        return (window as any).CSG.maths.vec3.fromValues(x, y, z);
    }

    static snapGeometry(geometry): any {
        const CSG = (window as any).CSG;
        const polygons = CSG.geometries.geom3.toPolygons(geometry);
        const newpolygons = polygons.map((polygon) => {
            const newvertices = polygon.vertices.map((vertice) => BitByBitBlocklyHelperService.snapVec3(vertice));
            return CSG.geometries.poly3.create(newvertices);
        });
        return CSG.geometries.geom3.create(newpolygons);
    }

}
