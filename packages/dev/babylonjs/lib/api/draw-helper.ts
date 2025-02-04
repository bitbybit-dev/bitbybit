import * as BABYLON from "@babylonjs/core";
import { Context } from "./context";
import * as Inputs from "./inputs";
import { DrawHelperCore } from "@bitbybit-dev/core";
import { Vector } from "@bitbybit-dev/base";
import { JSCADWorkerManager, JSCADText } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";

export class DrawHelper extends DrawHelperCore {

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
        override readonly vector: Vector,
        private readonly jscadWorkerManager: JSCADWorkerManager,
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
        private readonly occWorkerManager: OCCTWorkerManager) {
        super(vector);
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] }[],
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
                if (meshData.uvs) {
                    vertexData.uvs = meshData.uvs;
                }
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

        return this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            inputs.surfaceMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden,
        );
    }

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

        return this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            inputs.surfacesMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden
        );
    }

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
                materialType: BABYLON.GreasedLineMeshMaterialType.MATERIAL_TYPE_PBR,
                color,
                createAndAssignMaterial: true,
            },
            this.context.scene
        );
        (result.material as BABYLON.PBRMaterial).albedoColor = color;
        result.material.alpha = visibility;
        return result as BABYLON.GreasedLineMesh;
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

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", inputs);
        const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, options));
        const manifoldMeshContainer = new BABYLON.Mesh("manifoldMeshContainer" + Math.random(), this.context.scene);
        meshes.filter(s => s !== undefined).forEach(mesh => {
            mesh.parent = manifoldMeshContainer;
        });
        return manifoldMeshContainer;
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, BABYLON.PBRMetallicRoughnessMaterial>): Promise<BABYLON.Mesh> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", inputs);
        return this.handleDecomposedManifold(decomposedMesh, options);
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        return this.handleDecomposedMesh(inputs, decomposedMesh, options);
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<BABYLON.Mesh> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
        const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, options)));
        const shapesMeshContainer = new BABYLON.Mesh("shapesMeshContainer" + Math.random(), this.context.scene);
        meshesSolved.forEach(mesh => {
            mesh.parent = shapesMeshContainer;
        });
        return shapesMeshContainer;
    }

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Inputs.Draw.DrawOcctShapeOptions): Promise<BABYLON.Mesh> {
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
                let edgeMiddle = edge.middle_point;
                if (edgeMiddle === undefined) {
                    edgeMiddle = this.computeEdgeMiddlePos(edge);
                }
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
                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(null, textPolylines.flat(), false, 0.2, 1, inputs.edgeIndexColour);
            edgeMesh.parent = shapeMesh;
            edgeMesh.material.zOffset = -2;
        }
        if (inputs.drawFaceIndexes) {
            const promises = decomposedMesh.faceList.map(async (face) => {
                let faceMiddle = face.center_point;
                if (faceMiddle === undefined) {
                    faceMiddle = this.computeFaceMiddlePos(face.vertex_coord_vec) as Inputs.Base.Point3;
                }
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

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][], options: Inputs.Draw.DrawManifoldOrCrossSectionOptions): BABYLON.Mesh {
        if ((decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto).vertProperties) {
            const decomposedMesh = decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto;
            if (decomposedMesh.triVerts.length > 0) {
                const mesh = new BABYLON.Mesh(`manifoldMesh-${Math.random()}`, this.context.scene);

                const vertexData = new BABYLON.VertexData();

                vertexData.indices = decomposedMesh.triVerts.length > 65535 ? new Uint32Array(decomposedMesh.triVerts) : new Uint16Array(decomposedMesh.triVerts);

                for (let i = 0; i < decomposedMesh.triVerts.length; i += 3) {
                    vertexData.indices[i] = decomposedMesh.triVerts[i + 2];
                    vertexData.indices[i + 1] = decomposedMesh.triVerts[i + 1];
                    vertexData.indices[i + 2] = decomposedMesh.triVerts[i];
                }

                const vertexCount = decomposedMesh.vertProperties.length / decomposedMesh.numProp;

                // Attributes
                let offset = 0;
                for (let componentIndex = 0; componentIndex < 1; componentIndex++) {
                    const component = { stride: 3, kind: "position" };

                    const data = new Float32Array(vertexCount * component.stride);
                    for (let i = 0; i < vertexCount; i++) {
                        for (let strideIndex = 0; strideIndex < component.stride; strideIndex++) {
                            data[i * component.stride + strideIndex] = decomposedMesh.vertProperties[i * decomposedMesh.numProp + offset + strideIndex];
                        }
                    }
                    vertexData.set(data, component.kind);
                    offset += component.stride;
                }
                if (options.computeNormals) {
                    const normals = [];
                    BABYLON.VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);
                    vertexData.normals = normals;
                }
                vertexData.applyToMesh(mesh, false);

                if (options.faceMaterial === undefined) {
                    const material = new BABYLON.PBRMetallicRoughnessMaterial("pbr" + Math.random(), this.context.scene);
                    material.baseColor = BABYLON.Color3.FromHexString(options.faceColour);
                    material.metallic = 1.0;
                    material.roughness = 0.6;
                    material.alpha = options.faceOpacity;
                    material.alphaMode = 1;
                    material.backFaceCulling = true;
                    material.doubleSided = false;
                    mesh.material = material;
                } else {
                    mesh.material = options.faceMaterial;
                }

                return mesh;
            } else {
                return undefined;
            }
        } else {
            if ((decomposedManifold as Inputs.Base.Vector2[][]).length > 0) {
                const mesh = new BABYLON.Mesh(`manifoldCrossSection-${Math.random()}`, this.context.scene);
                const decompsoedPolygons = decomposedManifold as Inputs.Base.Vector2[][];
                const polylines = decompsoedPolygons.map(polygon => ({
                    points: polygon.map(p => [p[0], p[1], 0] as Inputs.Base.Point3),
                    isClosed: true
                }));
                const polylineMesh = this.drawPolylinesWithColours({
                    polylinesMesh: undefined,
                    polylines,
                    updatable: false,
                    size: options.crossSectionWidth,
                    opacity: options.crossSectionOpacity,
                    colours: options.crossSectionColour
                });
                polylineMesh.parent = mesh;
                return mesh;
            } else {
                return undefined;
            }
        }
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

    // sometimes we must delete face material property for the web worker not to complain about complex (circular) objects and use cloned object later
    private deleteFaceMaterialForWorker(inputs: any) {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        return options;
    }
}
