
import {
    LinesMesh, Matrix, Color3, Vector3, Color4,
    MeshBuilder, Scene, Mesh, VertexData,
    PBRMetallicRoughnessMaterial
} from '@babylonjs/core';
import { Context } from './context';
import { Base } from './inputs/base-inputs';

export class GeometryHelper {
    constructor(private readonly context: Context) { }

    private readonly tolerance = 0.00001;

    createOrUpdateSurfaceMesh(
        meshDataConverted: { positions: any[]; indices: any[]; normals: any[]; },
        mesh: Mesh, updatable: boolean, material: PBRMetallicRoughnessMaterial, addToScene: boolean, hidden: boolean
    ): Mesh {
        const createMesh = () => {
            const vertexData = new VertexData();
            vertexData.positions = meshDataConverted.positions;
            vertexData.indices = meshDataConverted.indices;
            vertexData.normals = meshDataConverted.normals;
            vertexData.applyToMesh(mesh, updatable);
        };

        if (mesh && updatable) {
            mesh.dispose();
            createMesh();
            mesh.flipFaces(false);
        } else {
            let scene = null;
            if (addToScene) {
                scene = this.context.scene;
            }
            mesh = new Mesh(`surface${Math.random()}`, scene);
            createMesh();
            mesh.flipFaces(false);
            if (material) {
                mesh.material = material;
            }
        }
        if (material) {
            mesh.material = material;
        }
        if (hidden) {
            mesh.isVisible = false;
        }
        mesh.isPickable = false;
        return mesh;
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: any[]; indices: any[]; normals: any[]; uvs: any[] }[],
        mesh: Mesh, updatable: boolean, material: PBRMetallicRoughnessMaterial, addToScene: boolean, hidden: boolean
    ): Mesh {
        const createMesh = () => {
            const first = meshDataConverted.pop()
            const vd = new VertexData();
            vd.positions = first.positions;
            vd.indices = first.indices;
            vd.normals = first.normals;
            vd.uvs = first.uvs;

            const v = [];
            meshDataConverted.forEach(meshData => {
                const vertexData = new VertexData();
                vertexData.positions = meshData.positions;
                vertexData.indices = meshData.indices;
                vertexData.normals = meshData.normals;
                vertexData.uvs = meshData.uvs;
                v.push(vertexData);
            })
            vd.merge(v);
            vd.applyToMesh(mesh, updatable);
        };

        if (mesh && updatable) {
            mesh.dispose();
            createMesh();
            mesh.flipFaces(false);
        } else {
            let scene = null;
            if (addToScene) {
                scene = this.context.scene;
            }
            mesh = new Mesh(`surface${Math.random()}`, scene);
            createMesh();
            mesh.flipFaces(false);
            if (material) {
                mesh.material = material;
            }
        }
        if (material) {
            mesh.material = material;
        }
        if (hidden) {
            mesh.isVisible = false;
        }
        mesh.isPickable = false;
        return mesh;
    }

    transformControlPoints(transformation: number[][] | number[][][], transformedControlPoints: Base.Point3[]): Base.Point3[] {
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
    }

    transformPointsByMatrixArray(points: Base.Point3[], transform: number[]): Base.Point3[] {
        const transformMatrix = Matrix.FromArray(transform);
        return this.transformPointsByMatrix(points, transformMatrix);
    }

    transformPointsByMatrix(points: Base.Point3[], transformMatrix: Matrix): Base.Point3[] {
        const transformedPoints = [];
        for (const pt of points) {
            const vector = new Vector3(pt[0], pt[1], pt[2]);
            const transformedVector = Vector3.TransformCoordinates(vector, transformMatrix);
            transformedPoints.push([transformedVector.x, transformedVector.y, transformedVector.z]);
        }
        return transformedPoints;
    }

    edgesRendering(mesh: LinesMesh, size: number, opacity: number, colours: string | string[]): void {
        mesh.enableEdgesRendering();
        mesh.edgesWidth = size;
        let colour = Array.isArray(colours) ? Color3.FromHexString(colours[0]) : Color3.FromHexString(colours);
        const edgeColor = colour;
        mesh.color = edgeColor;
        mesh.edgesColor = new Color4(edgeColor.r, edgeColor.g, edgeColor.b, opacity);
    }

    drawPolyline(mesh: LinesMesh,
        pointsToDraw: number[][],
        updatable: boolean, size: number, opacity: number, colours: string | string[]): LinesMesh {
        // const points = [];
        // const colors = [];
        // pointsToDraw.forEach(pt => {
        //     points.push(new Vector3(pt[0], pt[1], pt[2]));
        //     colors.push(new Color4(1, 1, 1, 0));
        // });
        mesh = this.drawPolylines(mesh, [pointsToDraw], updatable, size, opacity, colours);
        // mesh = this.drawPolylineFromPointsAndColours(mesh, updatable, points, colors, size, opacity, colours);
        return mesh;
    }

    // drawPolylineFromPointsAndColours(
    //     mesh: LinesMesh, updatable: boolean, points: Vector3[], colors: Color4[], size: number, opacity: number, colours: string | string[]
    // ): LinesMesh {
    //     if (mesh && updatable) {

    //         if (mesh.getTotalVertices() === points.length) {
    //             mesh = MeshBuilder.CreateLines(null, {
    //                 points,
    //                 colors,
    //                 instance: mesh,
    //                 useVertexAlpha: true,
    //                 updatable
    //             }, null);
    //         } else {
    //             mesh.dispose();
    //             mesh = this.createLines(updatable, points, colors);
    //         }
    //     } else {
    //         mesh = this.createLines(updatable, points, colors);
    //     }

    //     this.edgesRendering(mesh, size, opacity, colours);
    //     return mesh;
    // }

    drawPolylines(
        mesh: LinesMesh, polylinePoints: number[][][], updatable: boolean,
        size: number, opacity: number, colours: string | string[]
    ): LinesMesh {
        const linesForRender = [];
        polylinePoints.forEach(polyline => {
            linesForRender.push(polyline.map(pt => new Vector3(pt[0], pt[1], pt[2])));
        });

        let col;
        if (Array.isArray(colours)) {
            col = Color3.FromHexString(colours[0])
        } else {
            col = Color3.FromHexString(colours);
        }

        if (mesh && updatable) {
            // in order to optimize this method its not enough to check if total vertices lengths match, we need a way to identify
            if (!mesh.metadata.linesForRenderLengths.some((s, i) => s !== linesForRender[i].length)) {
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
                mesh.metadata = { linesForRenderLengths: linesForRender.map(l => l.length) };
            }
        } else {
            mesh = this.createLineSystem(updatable, linesForRender);
            mesh.metadata = { linesForRenderLengths: linesForRender.map(l => l.length) };
        }

        this.edgesRendering(mesh, size, opacity, colours);
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

    // createLines(updatable: boolean, points: Vector3[], colors: Color4[]): LinesMesh {
    //     return MeshBuilder.CreateLines(`lines${Math.random()}`,
    //         {
    //             points,
    //             colors,
    //             updatable,
    //             useVertexAlpha: true
    //         }, this.context.scene);
    // }

    removeConsecutiveDuplicates(points: number[][], checkFirstAndLast: boolean = true): number[][] {
        const pointsRemaining = [];
        if (points.length > 1) {
            for (let i = 1; i < points.length; i++) {
                const currentPoint = points[i];
                const previousPoint = points[i - 1];
                if (!this.arePointsTheSame(currentPoint, previousPoint, this.tolerance)) {
                    pointsRemaining.push(previousPoint);
                }
                if (i === points.length - 1) {
                    pointsRemaining.push(currentPoint);
                }
            }
            if (checkFirstAndLast) {
                const firstPoint = pointsRemaining[0];
                const lastPoint = pointsRemaining[pointsRemaining.length - 1];
                if (this.arePointsTheSame(firstPoint, lastPoint, this.tolerance)) {
                    pointsRemaining.pop();
                }
            }
        } else if (points.length === 1) {
            pointsRemaining.push(...points);
        }
        return pointsRemaining;
    }

    arePointsTheSame(pointA: number[], pointB: number[], tolerance: number): boolean {
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

    localAxes(size: number, scene: Scene, colorXHex: string, colorYHex: string, colorZHex: string): Mesh {
        const pilotLocalAxisX = MeshBuilder.CreateLines('pilot_local_axisX' + Math.random(), {
            points: [
                Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
                new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
            ]
        }, scene);
        const colorX = Color3.FromHexString(colorXHex);
        pilotLocalAxisX.color = colorX;

        const pilotLocalAxisY = MeshBuilder.CreateLines('pilot_local_axisY' + Math.random(), {
            points: [
                Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
                new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
            ]
        }, scene);
        const colorY = Color3.FromHexString(colorYHex);
        pilotLocalAxisY.color = colorY;

        const pilotLocalAxisZ = MeshBuilder.CreateLines('pilot_local_axisZ' + Math.random(), {
            points: [
                Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
                new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
            ]
        }, scene);
        const colorZ = Color3.FromHexString(colorZHex);
        pilotLocalAxisZ.color = colorZ;

        const localOrigin = MeshBuilder.CreateBox('local_origin' + Math.random(), { size: 1 }, scene);
        localOrigin.isVisible = false;

        pilotLocalAxisX.parent = localOrigin;
        pilotLocalAxisY.parent = localOrigin;
        pilotLocalAxisZ.parent = localOrigin;

        return localOrigin;
    }

}
