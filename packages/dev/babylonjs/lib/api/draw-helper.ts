
import * as BABYLON from "@babylonjs/core";
import { Context } from "./context";
import * as Inputs from "./inputs";
import { JSCADText, Vector } from "@bitbybit-dev/core";
import { JSCADWorkerManager } from "@bitbybit-dev/core/lib/workers";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";

export class DrawHelper {

    private usedMaterials: {
        sceneId: string,
        hex: string,
        alpha: number,
        zOffset: number,
        material: BABYLON.PBRMetallicRoughnessMaterial
    }[] = [];

    constructor(
        private readonly context: Context,
        private readonly solidText: JSCADText,
        private readonly vector: Vector,
        private readonly jscadWorkerManager: JSCADWorkerManager,
        private readonly occWorkerManager: OCCTWorkerManager) {
    }

    createOrUpdateSurfaceMesh(
        meshDataConverted: { positions: any[]; indices: any[]; normals: any[]; },
        mesh: BABYLON.Mesh, updatable: boolean, material: BABYLON.PBRMetallicRoughnessMaterial, addToScene: boolean, hidden: boolean
    ): BABYLON.Mesh {
        const createMesh = () => {
            const vertexData = new BABYLON.VertexData();
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
            mesh = new BABYLON.Mesh(`surface${Math.random()}`, scene);
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
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs: number[] }[],
        mesh: BABYLON.Mesh, updatable: boolean, material: BABYLON.PBRMetallicRoughnessMaterial, addToScene: boolean, hidden: boolean
    ): BABYLON.Mesh {
        const createMesh = () => {
            const first = meshDataConverted.pop();
            const vd = new BABYLON.VertexData();
            vd.positions = first.positions;
            vd.indices = first.indices;
            vd.normals = first.normals;
            vd.uvs = first.uvs;

            const v = [];
            meshDataConverted.forEach(meshData => {
                const vertexData = new BABYLON.VertexData();
                vertexData.positions = meshData.positions;
                vertexData.indices = meshData.indices;
                vertexData.normals = meshData.normals;
                vertexData.uvs = meshData.uvs;
                v.push(vertexData);
            });
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
            mesh = new BABYLON.Mesh(`surface${Math.random()}`, scene);
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


    edgesRendering(mesh: BABYLON.LinesMesh, size: number, opacity: number, colours: string | string[]): void {
        mesh.enableEdgesRendering();
        mesh.edgesWidth = size;
        const colour = Array.isArray(colours) ? BABYLON.Color3.FromHexString(colours[0]) : BABYLON.Color3.FromHexString(colours);
        const edgeColor = colour;
        mesh.color = edgeColor;
        mesh.edgesColor = new BABYLON.Color4(edgeColor.r, edgeColor.g, edgeColor.b, opacity);
    }

    /**
     * Draws multiple lines
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLines(inputs: Inputs.Line.DrawLinesDto<BABYLON.LinesMesh>): BABYLON.LinesMesh {
        const lines = [];
        const colors = [];

        inputs.lines.forEach((line, index) => {
            lines.push([
                new BABYLON.Vector3(line.start[0], line.start[1], line.start[2]),
                new BABYLON.Vector3(line.end[0], line.end[1], line.end[2])]
            );
            let col;
            if (Array.isArray(inputs.colours) && inputs.colours.length === inputs.lines.length) {
                col = BABYLON.Color3.FromHexString(inputs.colours[index]);
            } else if (Array.isArray(inputs.colours)) {
                col = BABYLON.Color3.FromHexString(inputs.colours[0]);
            } else {
                col = BABYLON.Color3.FromHexString(inputs.colours);
            }
            colors.push([
                new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity),
                new BABYLON.Color4(col.r, col.g, col.b, inputs.opacity)
            ]);
        });

        if (inputs.linesMesh && inputs.updatable) {
            if (inputs.linesMesh.getTotalVertices() / 2 === lines.length) {
                inputs.linesMesh = BABYLON.MeshBuilder.CreateLineSystem(null,
                    {
                        lines,
                        instance: inputs.linesMesh,
                        colors, useVertexAlpha: true,
                        updatable: inputs.updatable
                    }, null);
            } else {
                inputs.linesMesh.dispose();
                inputs.linesMesh = this.createLineSystemMesh(inputs.updatable, lines, colors);
            }
        } else {
            inputs.linesMesh = this.createLineSystemMesh(inputs.updatable, lines, colors);
        }

        this.edgesRendering(inputs.linesMesh, inputs.size, inputs.opacity, inputs.colours);
        return inputs.linesMesh;
    }

    /**
     * Draws a single polyline and handle closed case
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<BABYLON.GreasedLineMesh>): BABYLON.GreasedLineMesh {
        // handle jscad isClosed case
        const points = inputs.polyline.points;
        if (inputs.polyline.isClosed) {
            points.push(points[0]);
        }
        return this.drawPolyline(
            inputs.polylineMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        );
    }


    /**
     * Draws a single curve
     * @param inputs Contains a curve to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurve(inputs: Inputs.Verb.DrawCurveDto<BABYLON.GreasedLineMesh>): BABYLON.GreasedLineMesh {
        const points = inputs.curve.tessellate();
        return this.drawPolyline(
            inputs.curveMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        );
    }

    /**
     * Draws a single surface
     * @param inputs Contains a surface and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto<BABYLON.Mesh>): BABYLON.Mesh {
        const meshData = inputs.surface.tessellate();

        const meshDataConverted = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        meshData.faces.forEach((faceIndices) => {
            countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
        });

        const pbr = new BABYLON.PBRMetallicRoughnessMaterial("pbr" + Math.random(), this.context.scene);

        pbr.baseColor = BABYLON.Color3.FromHexString(Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours);
        pbr.metallic = 1.0;
        pbr.roughness = 0.6;
        pbr.alpha = inputs.opacity;
        pbr.alphaMode = 1;
        pbr.backFaceCulling = false;
        pbr.doubleSided = true;

        return this.createOrUpdateSurfaceMesh(
            meshDataConverted,
            inputs.surfaceMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden,
        );
    }

    /**
     * Draws multiple surfaces
     * @param inputs Contains the Nurbs surfaces and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfaces(inputs: Inputs.Verb.DrawSurfacesDto<BABYLON.Mesh>): BABYLON.Mesh {
        const tessellatedSurfaces = [];
        inputs.surfaces.forEach(srf => {
            tessellatedSurfaces.push(srf.tessellate());
        });

        const meshDataConverted = {
            positions: [],
            indices: [],
            normals: [],
        };

        let countIndices = 0;
        tessellatedSurfaces.forEach(meshData => {
            meshData.faces.forEach((faceIndices) => {
                countIndices = this.parseFaces(faceIndices, meshData, meshDataConverted, countIndices);
            });
        });

        const pbr = new BABYLON.PBRMetallicRoughnessMaterial("pbr" + Math.random(), this.context.scene);

        pbr.baseColor = BABYLON.Color3.FromHexString(Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours);
        pbr.metallic = 1.0;
        pbr.roughness = 0.6;
        pbr.alpha = inputs.opacity;
        pbr.alphaMode = 1;
        pbr.backFaceCulling = true;
        pbr.doubleSided = false;

        return this.createOrUpdateSurfaceMesh(
            meshDataConverted,
            inputs.surfacesMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden
        );
    }

    /**
     * Draws multiple surfaces with multiple colours. Number of colours has to be equal to number of surfaces
     * @param inputs Contains the Nurbs surfaces, colours and other information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<BABYLON.Mesh>): BABYLON.Mesh {
        if (inputs.surfacesMesh && inputs.updatable) {
            inputs.surfacesMesh.getChildren().forEach(srf => srf.dispose());
        }

        inputs.surfacesMesh = new BABYLON.Mesh(`ColouredSurfaces${Math.random()}`, this.context.scene);
        if (Array.isArray(inputs.colours)) {
            inputs.surfaces.forEach((surface, index) => {
                const srf = this.drawSurface({
                    surface,
                    colours: inputs.colours[index] ? inputs.colours[index] : inputs.colours[0],
                    updatable: inputs.updatable,
                    opacity: inputs.opacity,
                    hidden: inputs.hidden,
                });
                inputs.surfacesMesh.addChild(srf);
            });
        } else {
            inputs.surfaces.forEach((surface, index) => {
                const srf = this.drawSurface({
                    surface,
                    colours: inputs.colours,
                    updatable: inputs.updatable,
                    opacity: inputs.opacity,
                    hidden: inputs.hidden,
                });
                inputs.surfacesMesh.addChild(srf);
            });
        }

        return inputs.surfacesMesh;
    }

    /**
     * Draws multiple curves
     * @param inputs Contains curves to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurves(inputs: Inputs.Verb.DrawCurvesDto<BABYLON.GreasedLineMesh>): BABYLON.GreasedLineMesh {
        const points = inputs.curves.map(s => s.tessellate());
        return this.drawPolylines(
            inputs.curvesMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        );
    }

    drawPolyline(mesh: BABYLON.GreasedLineMesh,
        pointsToDraw: number[][],
        updatable: boolean, size: number, opacity: number, colours: string | string[]): BABYLON.GreasedLineMesh {
        mesh = this.drawPolylines(mesh, [pointsToDraw], updatable, size, opacity, colours);
        return mesh;
    }

    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<BABYLON.GreasedLineMesh>) {
        let colours = inputs.colours;
        const points = inputs.polylines.map((s, index) => {
            const pts = s.points;
            //handle jscad
            if (s.isClosed) {
                pts.push(pts[0]);
            }
            // sometimes polylines can have assigned colors in case of jscad for example. Such colour will overwrite the default provided colour for that polyline.
            if (s.color) {
                if (!Array.isArray(colours)) {
                    colours = [];
                }
                if (Array.isArray(s.color)) {
                    colours[index] = BABYLON.Color3.FromArray(s.color).toHexString();
                } else {
                    colours[index] = s.color;
                }
            }
            return pts;
        });

        return this.drawPolylines(
            inputs.polylinesMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            colours
        );
    }

    drawPolylines(
        mesh: BABYLON.GreasedLineMesh, polylinePoints: number[][][], updatable: boolean,
        size: number, opacity: number, colours: string | string[]
    ): BABYLON.GreasedLineMesh | undefined {
        const linesForRender: number[][] = [];
        if (polylinePoints && polylinePoints.length > 0) {
            polylinePoints.forEach(polyline => {
                const points = polyline.map(p => p.length === 2 ? [p[0], p[1], 0] : p);
                linesForRender.push(points.flat());
            });
            const width = size / 100;
            const color = Array.isArray(colours) ? BABYLON.Color3.FromHexString(colours[0]) : BABYLON.Color3.FromHexString(colours);

            if (mesh && updatable) {
                // in order to optimize this method its not enough to check if total vertices lengths match, we need a way to identify
                if (!mesh?.metadata?.linesForRenderLengths.some((s, i) => s !== linesForRender[i].length)) {
                    mesh.setPoints(linesForRender);
                    return mesh as BABYLON.GreasedLineMesh;
                } else {
                    mesh.dispose();
                    mesh = this.createGreasedPolylines(updatable, linesForRender, width, color, opacity);
                    mesh.metadata = { linesForRenderLengths: linesForRender.map(l => l.length) };
                }
            } else {
                mesh = this.createGreasedPolylines(updatable, linesForRender, width, color, opacity);
                mesh.metadata = { linesForRenderLengths: linesForRender.map(l => l.length) };
            }

            return mesh;
        } else {
            return undefined;
        }
    }

    createGreasedPolylines(updatable: boolean, lines: number[][], width: number, color: BABYLON.Color3, visibility: number): BABYLON.GreasedLineMesh {
        const result = BABYLON.CreateGreasedLine(
            `lineSystem${Math.random()}`,
            {
                points: lines,
                updatable,
            },
            {
                width,
                color,

            },
            this.context.scene
        );
        result.material.alpha = visibility;
        return result as BABYLON.GreasedLineMesh;
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

    localAxes(size: number, scene: BABYLON.Scene, colorXHex: string, colorYHex: string, colorZHex: string): BABYLON.Mesh {
        const pilotLocalAxisX = BABYLON.MeshBuilder.CreateLines("pilot_local_axisX" + Math.random(), {
            points: [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
                new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ]
        }, scene);
        const colorX = BABYLON.Color3.FromHexString(colorXHex);
        pilotLocalAxisX.color = colorX;

        const pilotLocalAxisY = BABYLON.MeshBuilder.CreateLines("pilot_local_axisY" + Math.random(), {
            points: [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
            ]
        }, scene);
        const colorY = BABYLON.Color3.FromHexString(colorYHex);
        pilotLocalAxisY.color = colorY;

        const pilotLocalAxisZ = BABYLON.MeshBuilder.CreateLines("pilot_local_axisZ" + Math.random(), {
            points: [
                BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
                new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
            ]
        }, scene);
        const colorZ = BABYLON.Color3.FromHexString(colorZHex);
        pilotLocalAxisZ.color = colorZ;

        const localOrigin = new BABYLON.Mesh("local_origin" + Math.random(), scene);
        localOrigin.isVisible = false;

        pilotLocalAxisX.parent = localOrigin;
        pilotLocalAxisY.parent = localOrigin;
        pilotLocalAxisZ.parent = localOrigin;

        return localOrigin;
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<BABYLON.Mesh>): BABYLON.Mesh {
        const vectorPoints = [inputs.point];

        let colorsHex: string[] = [];
        if (Array.isArray(inputs.colours)) {
            colorsHex = inputs.colours;
        } else {
            colorsHex = [inputs.colours];
        }
        // const { positions, colors } = this.setUpPositionsAndColours(vectorPoints, colours);
        if (inputs.pointMesh && inputs.updatable) {
            this.updatePointsInstances(inputs.pointMesh, vectorPoints);
        } else {
            inputs.pointMesh = this.createPointSpheresMesh(
                `poinsMesh${Math.random()}`, vectorPoints, colorsHex, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointMesh;
    }

    drawPoints(inputs: Inputs.Point.DrawPointsDto<BABYLON.Mesh>): BABYLON.Mesh {
        const vectorPoints = inputs.points;
        let coloursHex: string[] = [];
        if (Array.isArray(inputs.colours)) {
            coloursHex = inputs.colours;
            if (coloursHex.length === 1) {
                coloursHex = inputs.points.map(() => coloursHex[0]);
            }
        } else {
            coloursHex = inputs.points.map(() => inputs.colours as string);
        }
        if (inputs.pointsMesh && inputs.updatable) {
            if (inputs.pointsMesh.getChildMeshes().length === vectorPoints.length) {
                this.updatePointsInstances(inputs.pointsMesh, vectorPoints);
            } else {
                inputs.pointsMesh.dispose();
                inputs.pointsMesh = this.createPointSpheresMesh(
                    `pointsMesh${Math.random()}`, vectorPoints, coloursHex, inputs.opacity, inputs.size, inputs.updatable
                );
            }
        } else {
            inputs.pointsMesh = this.createPointSpheresMesh(
                `pointsMesh${Math.random()}`, vectorPoints, coloursHex, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointsMesh;
    }


    updatePointsInstances(mesh: BABYLON.Mesh, positions: any[]): void {

        const children = mesh.getChildMeshes();
        const po = {};
        positions.forEach((pos, index) => {
            po[index] = new BABYLON.Vector3(pos[0], pos[1], pos[2]);
        });

        children.forEach((child: BABYLON.InstancedMesh) => {
            child.position = po[child.metadata.index];
        });
    }

    private setUpPositionsAndColours(vectorPoints: number[][], colours: BABYLON.Color3[]): { positions, colors } {
        const positions = [];
        const colors = [];

        if (colours.length === vectorPoints.length) {
            vectorPoints.forEach((p, index) => {
                positions.push(...p);
                colors.push(colours[index].r, colours[index].g, colours[index].b, 1);
            });
        } else {
            vectorPoints.forEach((p, index) => {
                positions.push(...p);
                colors.push(colours[0].r, colours[0].g, colours[0].b, 1);
            });
        }

        return { positions, colors };
    }

    private createPointSpheresMesh(
        meshName: string, positions: Inputs.Base.Point3[], colors: string[], opacity: number, size: number, updatable: boolean): BABYLON.Mesh {

        const positionsModel = positions.map((pos, index) => {
            return {
                position: pos,
                color: colors[index],
                index
            };
        });

        const colorSet = Array.from(new Set(colors));
        const materialSet = colorSet.map((colour, index) => {

            const mat = new BABYLON.StandardMaterial(`mat${Math.random()}`, this.context.scene);

            mat.disableLighting = true;
            mat.emissiveColor = BABYLON.Color3.FromHexString(colour);
            mat.alpha = opacity;

            const positions = positionsModel.filter(s => s.color === colour);

            return { hex: colorSet, material: mat, positions };
        });

        const pointsMesh = new BABYLON.Mesh(meshName, this.context.scene);
        materialSet.forEach(ms => {
            const segments = ms.positions.length > 1000 ? 1 : 6;
            let pointMesh;
            if (ms.positions.length < 10000) {
                pointMesh = BABYLON.MeshBuilder.CreateSphere(`point${Math.random()}`, { diameter: size, segments, updatable }, this.context.scene);
            } else {
                pointMesh = BABYLON.MeshBuilder.CreateBox(`point${Math.random()}`, { size, updatable }, this.context.scene);
            }
            pointMesh.material = ms.material;
            pointMesh.isVisible = false;

            ms.positions.forEach((pos, index) => {
                const instance = pointMesh.createInstance(`point-${index}-${Math.random()}`);
                instance.position = new BABYLON.Vector3(pos.position[0], pos.position[1], pos.position[2]);
                instance.metadata = { index: pos.index };
                instance.parent = pointsMesh;
                instance.isVisible = true;
            });
        });

        return pointsMesh;
    }

    /**
     * Draws a single solids
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto<BABYLON.Mesh>): Promise<BABYLON.Mesh> {
        const res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
        } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        let meshToUpdate;
        if (inputs.jscadMesh && inputs.updatable) {
            meshToUpdate = inputs.jscadMesh;
        } else {
            meshToUpdate = new BABYLON.Mesh(`jscadMesh${Math.random()}`, this.context.scene);
        }
        let colour;
        if (inputs.mesh.color && inputs.mesh.color.length > 0) {
            // if jscad geometry is colorized and color is baked on geometry it will be used over anything that set in the draw options
            colour = BABYLON.Color3.FromArray(inputs.mesh.color).toHexString();
        } else {
            colour = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
        }

        const s = this.makeMesh({ ...inputs, colour }, meshToUpdate, res);
        inputs.jscadMesh = s;
        return s;
    }

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean }, meshToUpdate: BABYLON.Mesh, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }) {
        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable);
        meshToUpdate.material = new BABYLON.PBRMetallicRoughnessMaterial(`jscadMaterial${Math.random()}`, this.context.scene);
        meshToUpdate.flipFaces(false);
        const pbr = meshToUpdate.material as BABYLON.PBRMetallicRoughnessMaterial;
        pbr.baseColor = BABYLON.Color3.FromHexString(inputs.colour);
        pbr.metallic = 1.0;
        pbr.roughness = 0.6;
        pbr.alpha = inputs.opacity;
        pbr.alphaMode = 1;
        pbr.backFaceCulling = true;
        pbr.zOffset = 0;
        meshToUpdate.isPickable = false;
        if (inputs.hidden) {
            meshToUpdate.isVisible = false;
        }
        return meshToUpdate;
    }

    /**
     * Draws multiple solids
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto<BABYLON.Mesh>): Promise<BABYLON.Mesh> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs).then((res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
            color?: number[]
        }[]) => {

            let localOrigin: BABYLON.Mesh;
            if (inputs.jscadMesh && inputs.updatable) {
                localOrigin = inputs.jscadMesh as BABYLON.Mesh;
                const children = localOrigin.getChildMeshes();
                children.forEach(mesh => { mesh.dispose(); localOrigin.removeChild(mesh); });
            } else {
                localOrigin = new BABYLON.Mesh("local_origin" + Math.random(), this.context.scene);
            }

            localOrigin.isVisible = false;

            const colourIsArrayAndMatches = Array.isArray(inputs.colours) && inputs.colours.length === res.length;
            const colorsAreArrays = Array.isArray(inputs.colours);

            res.map((r, index) => {
                const meshToUpdate = new BABYLON.Mesh(`jscadMesh${Math.random()}`, this.context.scene);
                let colour;
                if (r.color) {
                    colour = BABYLON.Color3.FromArray(r.color).toHexString();
                } else if (colourIsArrayAndMatches) {
                    colour = inputs.colours[index];
                } else if (colorsAreArrays) {
                    colour = inputs.colours[0];
                } else {
                    colour = inputs.colours;
                }
                const m = this.makeMesh({ ...inputs, colour }, meshToUpdate, r);
                m.parent = localOrigin;
            });
            inputs.jscadMesh = localOrigin;
            return localOrigin;
        });
    }

    /**
     * Draws a 2D path
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     * @group jscad
     * @shortname draw solid
     * @ignore true
     */
    async drawPath(inputs: Inputs.JSCAD.DrawPathDto<BABYLON.GreasedLineMesh>): Promise<BABYLON.GreasedLineMesh> {
        return new Promise(resolve => {

            if (inputs.path.points) {
                if (inputs.path.isClosed) {
                    const pt = inputs.path.points[0];
                    inputs.path.points.push([pt[0], 0, pt[1]]);
                }
            }

            let colour = inputs.colour;
            if (inputs.path.color) {
                colour = BABYLON.Color3.FromArray(inputs.path.color).toHexString();
            }

            resolve(this.drawPolyline(
                inputs.pathMesh,
                inputs.path.points,
                inputs.updatable,
                inputs.width,
                inputs.opacity,
                colour
            ));
        });

    }


    /**
     * Draws OpenCascade shape by going through faces and edges
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     * @group drawing
     * @shortname draw shape
     * @drawable false
     * @ignore true
     */
    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        return this.handleDecomposedMesh(inputs, decomposedMesh, options);
    }

    /**
     * Draws OpenCascade shape by going through faces and edges
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     * @group drawing
     * @shortname draw shape
     * @drawable false
     * @ignore true
     */
    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
        const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, options)));
        const shapesMeshContainer = new BABYLON.Mesh("shapesMeshContainer" + Math.random(), this.context.scene);
        meshesSolved.forEach(mesh => {
            mesh.parent = shapesMeshContainer;
        });
        return shapesMeshContainer;
    }

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: { shape?: Inputs.OCCT.TopoDSShapePointer; faceOpacity: number; edgeOpacity: number; edgeColour: string; faceMaterial?: any; faceColour: string; edgeWidth: number; drawEdges: boolean; drawFaces: boolean; precision: number; drawEdgeIndexes: boolean; edgeIndexHeight: number; edgeIndexColour: string; drawFaceIndexes: boolean; faceIndexHeight: number; faceIndexColour: string; }) {
        const shapeMesh = new BABYLON.Mesh("brepMesh" + Math.random(), this.context.scene);
        shapeMesh.isVisible = false;
        let dummy;

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr;

            if (options.faceMaterial) {
                pbr = options.faceMaterial;
            } else {
                const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
                const alpha = inputs.faceOpacity;
                const zOffset = inputs.drawEdges ? 2 : 0;
                const materialCached = this.usedMaterials.find(s => s.sceneId === this.context.scene.uid && s.hex === hex && s.alpha === alpha && s.zOffset === zOffset);
                this.usedMaterials = this.usedMaterials.filter(s => s.sceneId === this.context.scene.uid);
                if (materialCached) {
                    pbr = materialCached.material;
                } else {
                    const pbmat = new BABYLON.PBRMetallicRoughnessMaterial("pbr" + Math.random(), this.context.scene);
                    pbmat.baseColor = BABYLON.Color3.FromHexString(hex);
                    pbmat.metallic = 1.0;
                    pbmat.roughness = 0.6;
                    pbmat.alpha = alpha;
                    pbmat.alphaMode = 1;
                    pbmat.backFaceCulling = true;
                    pbmat.doubleSided = false;
                    pbmat.zOffset = zOffset;
                    this.usedMaterials.push({
                        sceneId: this.context.scene.uid,
                        hex,
                        alpha: alpha,
                        zOffset: zOffset,
                        material: pbmat
                    });
                    pbr = pbmat;
                }
            }

            const meshData = decomposedMesh.faceList.map(face => {
                return {
                    positions: face.vertex_coord,
                    normals: face.normal_coord,
                    indices: face.tri_indexes,
                    uvs: face.uvs,
                };
            });

            const mesh = this.createOrUpdateSurfacesMesh(meshData, dummy, false, pbr, true, false);
            mesh.parent = shapeMesh;
        }
        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {
            const evs = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertex_coord.filter(s => s !== undefined);
                evs.push(ev);
            });
            const mesh = this.drawPolylines(dummy, evs, false, inputs.edgeWidth, inputs.edgeOpacity, inputs.edgeColour);
            mesh.parent = shapeMesh;
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                pointsMesh: dummy,
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            mesh.parent = shapeMesh;
        }

        if (inputs.drawEdgeIndexes) {
            const promises = decomposedMesh.edgeList.map(async (edge) => {
                const edgeMiddle = this.computeEdgeMiddlePos(edge);
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${edge.edge_index + 1}`;
                tdto.height = inputs.edgeIndexHeight;
                tdto.lineSpacing = 1.5;
                const t = await this.solidText.createVectorText(tdto);
                const texts = t.map(s => {
                    const res = s.map(c => {
                        return [
                            c[0],
                            c[1] + 0.05,
                            0
                        ] as Inputs.Base.Vector3;
                    });
                    const movedOnPosition = res.map(r => this.vector.add({ first: r, second: edgeMiddle }));
                    return movedOnPosition;
                });

                // texts.forEach(te => textPolylines.push(te));
                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(null, textPolylines.flat(), false, 0.2, 1, inputs.edgeIndexColour);
            edgeMesh.parent = shapeMesh;
            edgeMesh.material.zOffset = -2;
        }
        if (inputs.drawFaceIndexes) {
            // const textPolylines: number[][][] = [];
            const promises = decomposedMesh.faceList.map(async (face) => {
                const faceMiddle = this.computeFaceMiddlePos(face.vertex_coord_vec) as Inputs.Base.Point3;
                const tdto = new Inputs.JSCAD.TextDto();
                tdto.text = `${face.face_index}`;
                tdto.height = inputs.faceIndexHeight;
                tdto.lineSpacing = 1.5;
                const t = await this.solidText.createVectorText(tdto);
                const texts = t.map(s => {
                    const res = s.map(c => {
                        return [
                            c[0],
                            c[1] + 0.05,
                            0
                        ] as Inputs.Base.Point3;
                    });
                    const movedOnPosition = res.map(r => this.vector.add({ first: r, second: faceMiddle }));
                    return movedOnPosition;
                });
                // texts.forEach(te => textPolylines.push(te));
                return texts;
            });
            const textPolylines = await Promise.all(promises);

            const faceMesh = this.drawPolylines(null, textPolylines.flat(), false, 0.2, 1, inputs.faceIndexColour);
            faceMesh.parent = shapeMesh;
            if (inputs.drawEdges) {
                faceMesh.material.zOffset = -2;
            }
        }
        return shapeMesh;
    }

    private computeFaceMiddlePos(vertexCoordVec: number[][]): number[] {
        let x = 0;
        let y = 0;
        let z = 0;

        let realLength = 0;
        vertexCoordVec.forEach(v => {
            x += v[0];
            y += v[1];
            z += v[2];
            realLength++;
        });

        return [x / realLength, y / realLength, z / realLength];
    }

    private computeEdgeMiddlePos(edge: { edge_index: number; vertex_coord: Inputs.Base.Point3[]; }): Inputs.Base.Point3 {
        let pos;
        if (edge.vertex_coord.length === 2) {
            const midFloor = edge.vertex_coord[0];
            const midCeil = edge.vertex_coord[1];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        } else if (edge.vertex_coord.length === 3) {
            pos = edge.vertex_coord[1];
        } else {
            const midFloor = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2)];
            const midCeil = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2 + 1)];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        }
        return pos;
    }

    private createLineSystemMesh(updatable: boolean, lines: BABYLON.Vector3[][], colors: BABYLON.Color4[][]): BABYLON.LinesMesh {
        return BABYLON.MeshBuilder.CreateLineSystem(`lines${Math.random()}`,
            {
                lines,
                colors,
                useVertexAlpha: true,
                updatable
            }, this.context.scene);
    }


    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: BABYLON.Mesh, transforms: number[], updatable: boolean
    ): void {
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals, { useRightHandedSystem: true });
        vertexData.normals = normals;

        vertexData.applyToMesh(jscadMesh, updatable);
        jscadMesh.setPreTransformMatrix(BABYLON.Matrix.FromArray(transforms));
    }

    private parseFaces(
        faceIndices: any,
        meshData: any,
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; },
        countIndices: number): number {
        faceIndices.reverse().forEach((x) => {
            const vn = meshData.normals[x];
            meshDataConverted.normals.push(vn[0], vn[1], vn[2]);
            const pt = meshData.points[x];
            meshDataConverted.positions.push(pt[0], pt[1], pt[2]);
            meshDataConverted.indices.push(countIndices);
            countIndices++;
        });
        return countIndices;
    }
}
