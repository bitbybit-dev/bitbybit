import { Injectable } from '@angular/core';
import { LinesMesh, Matrix, Color3, Vector3, Color4, MeshBuilder } from '@babylonjs/core';
import { Context } from './context';
@Injectable()
export class GeometryHelper {
    constructor(private readonly context: Context) { }

    transformControlPoints(transformation: number[][] | number[][][], transformedControlPoints: number[][]): number[][] {
        let transformationArrays = [];

        if (this.getArrayDepth(transformation) === 2) {
            transformation.forEach(transform => {
                transformationArrays.push(...transform);
            });
        } else {
            transformationArrays = transformation;
        }

        transformationArrays.forEach(transform => {
            transformedControlPoints = this.transformPointsByMatrixArray(transformedControlPoints, transform);
        });
        return transformedControlPoints;
    }

    getArrayDepth = (value): number => {
        return Array.isArray(value) ?
            1 + Math.max(...value.map(this.getArrayDepth)) :
            0;
    }

    transformPointsByMatrixArray(points: number[][], transform: number[]): number[][] {
        const transformMatrix = Matrix.FromArray(transform);
        return this.transformPointsByMatrix(points, transformMatrix);
    }

    transformPointsByMatrix(points: number[][], transformMatrix: Matrix): number[][] {
        const transformedPoints = [];
        for (const pt of points) {
            const vector = new Vector3(pt[0], pt[1], pt[2]);
            const transformedVector = Vector3.TransformCoordinates(vector, transformMatrix);
            transformedPoints.push([transformedVector.x, transformedVector.y, transformedVector.z]);
        }
        return transformedPoints;
    }

    edgesRendering(mesh: LinesMesh, width: number, opacity: number, colour: string): void {
        mesh.enableEdgesRendering();
        mesh.edgesWidth = width;
        const edgeColor = Color3.FromHexString(colour);
        mesh.color = edgeColor;
        mesh.edgesColor = new Color4(edgeColor.r, edgeColor.g, edgeColor.b, opacity);
    }

    drawPolyline(mesh: LinesMesh, pointsToDraw: number[][], updatable: boolean, width: number, opacity: number, colour: string): LinesMesh {
        const points = [];
        const colors = [];
        pointsToDraw.forEach(pt => {
            points.push(new Vector3(pt[0], pt[1], pt[2]));
            colors.push(new Color4(1, 1, 1, 0));
        });

        if (mesh && updatable) {

            if (mesh.getTotalVertices() === points.length) {
                mesh = MeshBuilder.CreateLines(null, {
                    points,
                    colors,
                    instance: mesh,
                    useVertexAlpha: true,
                    updatable
                }, null);
            } else {
                mesh.dispose();
                mesh = this.createLines(updatable, points, colors);
            }
        } else {
            mesh = this.createLines(updatable, points, colors);
        }

        this.edgesRendering(mesh, width, opacity, colour);
        return mesh;
    }

    drawPolylines(
        mesh: LinesMesh, polylinePoints: number[][][], updatable: boolean,
        width: number, opacity: number, colour: string
    ): LinesMesh {
        const linesForRender = [];
        polylinePoints.forEach(polyline => {
            linesForRender.push(polyline.map(pt => new Vector3(pt[0], pt[1], pt[2])));
        });

        if (mesh && updatable) {
            if (mesh.getTotalVertices() / 2 === linesForRender.length) {
                mesh = MeshBuilder.CreateLineSystem(null,
                    {
                        lines: linesForRender,
                        instance: mesh,
                        useVertexAlpha: true,
                        updatable
                    }, null);
            } else {
                mesh.dispose();
                mesh = this.createLineSystem(updatable, linesForRender);
            }
        } else {
            mesh = this.createLineSystem(updatable, linesForRender);
        }

        this.edgesRendering(mesh, width, opacity, colour);
        return mesh;
    }

    createLineSystem(updatable: boolean, lines: Vector3[][]): LinesMesh {
        return MeshBuilder.CreateLineSystem(`lineSystem${Math.random()}`,
            {
                lines,
                useVertexAlpha: true,
                updatable
            }, this.context.scene);
    }

    createLines(updatable: boolean, points: Vector3[], colors: Color4[]): LinesMesh {
        return MeshBuilder.CreateLines(`lines${Math.random()}`,
            {
                points,
                colors,
                updatable,
                useVertexAlpha: true
            }, this.context.scene);
    }
}
