
import { Context } from "./context";
import * as Inputs from "./inputs/inputs";
import { DrawHelperCore } from "@bitbybit-dev/core";
import { JSCADText } from "@bitbybit-dev/jscad-worker";
import { Vector } from "@bitbybit-dev/base";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import * as THREEJS from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
export class DrawHelper extends DrawHelperCore {

    private usedMaterials: {
        sceneId: number,
        hex: string,
        alpha: number,
        zOffset: number,
        material: THREEJS.MeshPhysicalMaterial
    }[] = [];

    constructor(
        private readonly context: Context,
        private readonly solidText: JSCADText,
        public readonly vector: Vector,
        private readonly jscadWorkerManager: JSCADWorkerManager,
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
        private readonly occWorkerManager: OCCTWorkerManager
    ) {
        super(vector);
    }

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>): Promise<THREEJS.Group> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", inputs);
        const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, options)).filter(s => s !== undefined);
        const manifoldMeshContainer = new THREEJS.Group();
        manifoldMeshContainer.name = "manifoldMeshContainer-" + Math.random();
        meshes.forEach(mesh => {
            mesh.parent = manifoldMeshContainer;
        });
        this.context.scene.add(manifoldMeshContainer);
        return manifoldMeshContainer;
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, THREEJS.MeshPhysicalMaterial>): Promise<THREEJS.Group> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", inputs);
        return this.handleDecomposedManifold(decomposedMesh, options);
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<THREEJS.Group> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        return this.handleDecomposedMesh(inputs, decomposedMesh, options);
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<THREEJS.Group> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
        const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, options)));
        const shapesMeshContainer = new THREEJS.Group();
        shapesMeshContainer.name = "shapesMeshContainer-" + Math.random();
        this.context.scene.add(shapesMeshContainer);
        meshesSolved.forEach(mesh => {
            shapesMeshContainer.add(mesh);
        });
        return shapesMeshContainer;
    }

    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto<THREEJS.Group>): Promise<THREEJS.Group> {
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
            meshToUpdate = new THREEJS.Group();
            meshToUpdate.name = `jscadMesh-${Math.random()}`;
            this.context.scene.add(meshToUpdate);
        }
        let colour;
        if (inputs.mesh.color && inputs.mesh.color.length > 0) {
            // if jscad geometry is colorized and color is baked on geometry it will be used over anything that set in the draw options
            const c = inputs.mesh.color;
            colour = "#" + new THREEJS.Color(c[0], c[1], c[2]).getHexString();
        } else {
            colour = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
        }
        const s = this.makeMesh({ ...inputs, colour }, meshToUpdate, res);
        inputs.jscadMesh = s;
        return s;
    }

    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto<THREEJS.Group>): Promise<THREEJS.Group> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs).then((res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
            color?: number[]
        }[]) => {

            let localOrigin: THREEJS.Group;
            if (inputs.jscadMesh && inputs.updatable) {
                localOrigin = inputs.jscadMesh;
                localOrigin.clear();
            } else {
                localOrigin = new THREEJS.Group();
                localOrigin.name = `jscadMeshes-${Math.random()}`;
            }

            const colourIsArrayAndMatches = Array.isArray(inputs.colours) && inputs.colours.length === res.length;
            const colorsAreArrays = Array.isArray(inputs.colours);

            res.map((r, index) => {
                const meshToUpdate = new THREEJS.Group();
                meshToUpdate.name = `jscadMeshes-${Math.random()}`;
                let colour;
                if (r.color) {
                    const c = r.color;
                    colour = "#" + new THREEJS.Color(c[0], c[1], c[2]).getHexString();
                } else if (colourIsArrayAndMatches) {
                    colour = inputs.colours[index];
                } else if (colorsAreArrays) {
                    colour = inputs.colours[0];
                } else {
                    colour = inputs.colours;
                }
                const m = this.makeMesh({ ...inputs, colour }, meshToUpdate, r);
                localOrigin.add(m);
            });
            this.context.scene.add(localOrigin);
            inputs.jscadMesh = localOrigin;
            return localOrigin;
        });
    }

    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<THREEJS.Group>) {
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
                    colours[index] = "#" + new THREEJS.Color(s.color[0], s.color[1], s.color[2]).getHexString();
                } else {
                    colours[index] = s.color;
                }
            }
            return pts;
        });

        let lineSegments: THREEJS.LineSegments;
        if (inputs.polylinesMesh && inputs.updatable) {
            lineSegments = inputs.polylinesMesh.children[0] as THREEJS.LineSegments;
        }
        const polylines = this.drawPolylines(
            lineSegments,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            colours
        );
        if (inputs.polylinesMesh && inputs.updatable) {
            if (inputs.polylinesMesh.children[0].name !== polylines.name) {
                const group = new THREEJS.Group();
                group.name = `polylines-${Math.random()}`;
                group.add(polylines);
                this.context.scene.add(group);
                return group;
            } else {
                return inputs.polylinesMesh;
            }
        } else {
            const group = new THREEJS.Group();
            group.name = `polylines-${Math.random()}`;
            group.add(polylines);
            this.context.scene.add(group);
            return group;
        }
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<THREEJS.Group>): THREEJS.Group {
        const vectorPoints = [inputs.point];

        let colorsHex: string[] = [];
        if (Array.isArray(inputs.colours)) {
            colorsHex = inputs.colours;
        } else {
            colorsHex = [inputs.colours];
        }
        if (inputs.pointMesh && inputs.updatable) {
            this.updatePointsInstances(inputs.pointMesh, vectorPoints);
        } else {
            inputs.pointMesh = this.createPointSpheresMesh(
                `pointMesh-${Math.random()}`, vectorPoints, colorsHex, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointMesh;
    }

    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<THREEJS.Group>): THREEJS.Group {
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

    drawPolyline(mesh: THREEJS.Group,
        pointsToDraw: Inputs.Base.Point3[],
        updatable: boolean, size: number, opacity: number, colours: string | string[]): THREEJS.Group {
        let lineSegments: THREEJS.LineSegments;
        if (mesh && mesh.children.length > 0) {
            lineSegments = mesh.children[0] as THREEJS.LineSegments;
        }
        const polylines = this.drawPolylines(lineSegments, [pointsToDraw], updatable, size, opacity, colours);
        if (!mesh) {
            mesh = new THREEJS.Group();
            mesh.name = `polyline-${Math.random()}`;
            mesh.add(polylines);
            this.context.scene.add(mesh);
        }
        return mesh;
    }

    drawCurve(inputs: Inputs.Verb.DrawCurveDto<THREEJS.Group>): THREEJS.Group {
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

    drawPoints(inputs: Inputs.Point.DrawPointsDto<THREEJS.Group>): THREEJS.Group {
        const vectorPoints = inputs.points;
        let coloursHex: string[] = [];
        if (Array.isArray(inputs.colours)) {
            coloursHex = inputs.colours;
            if (coloursHex.length !== inputs.points.length) {
                coloursHex = inputs.points.map(() => coloursHex[0]);
            }
        } else {
            coloursHex = inputs.points.map(() => inputs.colours as string);
        }
        if (inputs.pointsMesh && inputs.updatable) {
            if (inputs.pointsMesh.children.length === vectorPoints.length) {
                this.updatePointsInstances(inputs.pointsMesh, vectorPoints);
            } else {
                inputs.pointsMesh.remove();
                inputs.pointsMesh = this.createPointSpheresMesh(
                    `pointsMesh-${Math.random()}`, vectorPoints, coloursHex, inputs.opacity, inputs.size, inputs.updatable
                );
            }
        } else {
            inputs.pointsMesh = this.createPointSpheresMesh(
                `pointsMesh-${Math.random()}`, vectorPoints, coloursHex, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointsMesh;
    }

    updatePointsInstances(group: THREEJS.Group, positions: Inputs.Base.Point3[]): void {
        const children = group.children as THREEJS.InstancedMesh[];
        const po = {};
        positions.forEach((pos, index) => {
            po[index] = new THREEJS.Vector3(pos[0], pos[1], pos[2]);
        });

        children.forEach((child: THREEJS.InstancedMesh) => {
            const index = child.userData.index;
            const p = po[index];
            child.position.set(p.x, p.y, p.z);
        });
    }

    drawCurves(inputs: Inputs.Verb.DrawCurvesDto<THREEJS.Group>): THREEJS.Group {
        const points = inputs.curves.map(s => ({ points: s.tessellate() }));
        return this.drawPolylinesWithColours({ polylines: points, polylinesMesh: inputs.curvesMesh, ...inputs });
    }

    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<THREEJS.Group>): THREEJS.Group {
        if (inputs.surfacesMesh && inputs.updatable) {
            inputs.surfacesMesh.clear();
        } else {
            inputs.surfacesMesh = new THREEJS.Group();
            inputs.surfacesMesh.name = `colouredSurfaces-${Math.random()}`;
            this.context.scene.add(inputs.surfacesMesh);
        }

        if (Array.isArray(inputs.colours)) {
            inputs.surfaces.forEach((surface, index) => {
                const srf = this.drawSurface({
                    surface,
                    colours: inputs.colours[index] ? inputs.colours[index] : inputs.colours[0],
                    updatable: inputs.updatable,
                    opacity: inputs.opacity,
                    hidden: inputs.hidden,
                });
                inputs.surfacesMesh.add(srf);
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
                inputs.surfacesMesh.add(srf);
            });
        }

        return inputs.surfacesMesh;
    }

    private createPointSpheresMesh(
        meshName: string, positions: Inputs.Base.Point3[], colors: string[], opacity: number, size: number, updatable: boolean): THREEJS.Group {
        const positionsModel = positions.map((pos, index) => {
            return {
                position: pos,
                color: colors[index],
                index
            };
        });

        const colorSet = Array.from(new Set(colors));
        const materialSet = colorSet.map((colour, index) => {

            const mat = new THREEJS.MeshBasicMaterial({ name: `mat-${Math.random()}` });
            mat.opacity = opacity;
            mat.color = new THREEJS.Color(colour);
            const positions = positionsModel.filter(s => s.color === colour);

            return { hex: colorSet, material: mat, positions };
        });

        const pointsGroup = new THREEJS.Group();
        pointsGroup.name = meshName;
        this.context.scene.add(pointsGroup);
        materialSet.forEach(ms => {
            const segments = ms.positions.length > 1000 ? 1 : 6;
            const geom = new THREEJS.SphereGeometry(size, segments, segments);

            ms.positions.forEach((pos, index) => {
                const instance = new THREEJS.InstancedMesh(geom, ms.material, 1);
                instance.name = `point-${index}-${Math.random()}`;
                instance.position.set(pos.position[0], pos.position[1], pos.position[2]);
                instance.userData = { index: pos.index };
                instance.visible = true;
                pointsGroup.add(instance);
            });
        });

        return pointsGroup;
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] }[],
        group: THREEJS.Group, updatable: boolean, material: THREEJS.MeshPhysicalMaterial, addToScene: boolean, hidden: boolean
    ): THREEJS.Group {
        const createMesh = () => {
            const geometries: THREEJS.BufferGeometry[] = [];

            meshDataConverted.forEach(mesh => {
                const geometry = new THREEJS.BufferGeometry();
                geometry.setAttribute("position", new THREEJS.BufferAttribute(Float32Array.from(mesh.positions), 3));
                geometry.setAttribute("normal", new THREEJS.BufferAttribute(Float32Array.from(mesh.normals), 3));
                if (mesh.uvs) {
                    geometry.setAttribute("uv", new THREEJS.BufferAttribute(Uint32Array.from(mesh.uvs), 2));
                    geometry.setAttribute("uv2", new THREEJS.BufferAttribute(Uint32Array.from(mesh.uvs), 2));
                }
                geometry.setIndex(new THREEJS.BufferAttribute(Uint32Array.from(mesh.indices), 1));
                geometries.push(geometry);
            });
            const geometry = BufferGeometryUtils.mergeGeometries(geometries, false);
            return geometry;
        };

        if (group && updatable) {
            group.clear();
            const geometry = createMesh();
            if (material) {
                group.add(new THREEJS.Mesh(geometry, material));
            } else {
                group.add(new THREEJS.Mesh(geometry));
            }
        } else {
            let scene = null;
            if (addToScene) {
                scene = this.context.scene;
            }

            group = new THREEJS.Group();
            group.name = `surface-${Math.random()}`;
            scene.add(group);
            const geometry = createMesh();
            if (material) {
                group.add(new THREEJS.Mesh(geometry, material));
            } else {
                group.add(new THREEJS.Mesh(geometry));
            }
        }
        if (hidden) {
            group.visible = false;
        }
        return group;
    }

    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto<THREEJS.Group>): THREEJS.Group {
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

        const pbr = new THREEJS.MeshPhysicalMaterial();
        pbr.name = `pbr-${Math.random()}`;

        pbr.color = new THREEJS.Color(Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours);
        pbr.metalness = 0.5;
        pbr.roughness = 0.7;
        pbr.opacity = inputs.opacity;
        pbr.alphaTest = 1;

        return this.createOrUpdateSurfacesMesh(
            [meshDataConverted],
            inputs.surfaceMesh,
            inputs.updatable,
            pbr,
            true,
            inputs.hidden,
        );
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

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean }, meshToUpdate: THREEJS.Group, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }) {
        const pbr = new THREEJS.MeshPhysicalMaterial();
        pbr.name = `jscadMaterial-${Math.random()}`;
        pbr.color = new THREEJS.Color(inputs.colour);
        pbr.metalness = 0.4;
        pbr.roughness = 0.6;
        pbr.alphaTest = inputs.opacity;
        pbr.polygonOffsetFactor = 0;

        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable, pbr);
        if (inputs.hidden) {
            meshToUpdate.visible = false;
        }
        return meshToUpdate;
    }

    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: THREEJS.Group, transforms: number[], updatable: boolean, material: THREEJS.MeshPhysicalMaterial
    ): void {
        const geometry = new THREEJS.BufferGeometry();
        geometry.setAttribute("position", new THREEJS.BufferAttribute(Float32Array.from(positions), 3));
        geometry.setIndex(new THREEJS.BufferAttribute(Uint32Array.from(indices), 1));
        geometry.computeVertexNormals();
        const matrix4 = new THREEJS.Matrix4();
        matrix4.fromArray(transforms);
        jscadMesh.clear();
        jscadMesh.add(new THREEJS.Mesh(geometry, material));
        jscadMesh.applyMatrix4(matrix4);
    }

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Inputs.Draw.DrawOcctShapeOptions) {
        const shapeGroup = new THREEJS.Group();
        shapeGroup.name = "brepMesh-" + Math.random();
        this.context.scene.add(shapeGroup);
        let dummy;

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr;

            if (options.faceMaterial) {
                pbr = options.faceMaterial;
            } else {
                const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
                const alpha = inputs.faceOpacity;
                const zOffset = inputs.drawEdges ? 2 : 0;
                const materialCached = this.usedMaterials.find(s => s.sceneId === this.context.scene.id && s.hex === hex && s.alpha === alpha && s.zOffset === zOffset);
                this.usedMaterials = this.usedMaterials.filter(s => s.sceneId === this.context.scene.id);
                if (materialCached) {
                    pbr = materialCached.material;
                } else {
                    const pbmat = new THREEJS.MeshPhysicalMaterial();

                    pbmat.color = new THREEJS.Color(hex);
                    pbmat.metalness = 0.4;
                    pbmat.roughness = 0.8;
                    pbmat.alphaTest = alpha;
                    pbmat.polygonOffset = true;
                    pbmat.polygonOffsetFactor = zOffset;
                    this.usedMaterials.push({
                        sceneId: this.context.scene.id,
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
            shapeGroup.add(mesh);
        }
        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {

            const polylineEdgePoints = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertex_coord.filter(s => s !== undefined);
                polylineEdgePoints.push(ev);
            });
            const line = this.drawPolylines(undefined, polylineEdgePoints, false, inputs.edgeWidth, inputs.edgeOpacity, inputs.edgeColour);
            shapeGroup.add(line);
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            shapeGroup.add(mesh);
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
                    return movedOnPosition as Inputs.Base.Vector3[];
                });

                // texts.forEach(te => textPolylines.push(te));
                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, inputs.edgeIndexColour);
            shapeGroup.add(edgeMesh);
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
                    return movedOnPosition as Inputs.Base.Point3[];
                });
                return texts;
            });
            const textPolylines = await Promise.all(promises);

            const faceMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, inputs.faceIndexColour);
            faceMesh.parent = shapeGroup;
        }
        return shapeGroup;
    }

    private drawPolylines(lineSegments: THREEJS.LineSegments, polylinesPoints: Inputs.Base.Vector3[][], updatable: boolean,
        size: number, opacity: number, colours: string | string[]) {
        if (polylinesPoints && polylinesPoints.length > 0) {
            const lineVertices = [];

            polylinesPoints.forEach(pts => {
                for (let i = 0; i < pts.length - 1; i++) {
                    const c = pts[i];
                    const n = pts[i + 1];

                    lineVertices.push(new THREEJS.Vector3(
                        c[0],
                        c[1],
                        c[2]
                    ));
                    lineVertices.push(new THREEJS.Vector3(
                        n[0],
                        n[1],
                        n[2]
                    ));
                }
            });
            let lines: THREEJS.LineSegments;
            if (lineSegments && updatable) {
                if (lineSegments?.userData?.linesForRenderLengths === polylinesPoints.map(l => l.length).toString()) {
                    lineSegments.geometry.clearGroups();
                    lineSegments.geometry.setFromPoints(lineVertices);
                    return lineSegments;
                } else {
                    lines = this.createLineGeometry(lineVertices, colours, size);
                    lines.userData = { linesForRenderLengths: polylinesPoints.map(l => l.length).toString() };
                    return lines;
                }
            } else {
                lines = this.createLineGeometry(lineVertices, colours, size);
                lines.userData = { linesForRenderLengths: polylinesPoints.map(l => l.length).toString() };
                return lines;
            }
        } else {
            return undefined;
        }
    }

    private createLineGeometry(lineVertices: any[], colours: string | string[], size: number) {
        const lineGeometry = new THREEJS.BufferGeometry().setFromPoints(lineVertices);

        const color = Array.isArray(colours) ? new THREEJS.Color(colours[0]) : new THREEJS.Color(colours);

        const lineColors = [];
        for (let i = 0; i < lineVertices.length; i++) {
            lineColors.push(color.r, color.g, color.b);
        }

        lineGeometry.setAttribute("color", new THREEJS.Float32BufferAttribute(lineColors, 3));
        const lineMaterial = new THREEJS.LineBasicMaterial({
            color: 0xffffff, linewidth: size, vertexColors: true
        });
        const line = new THREEJS.LineSegments(lineGeometry, lineMaterial);
        line.name = "lines-" + Math.random();
        return line;
    }

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][],
        options: Inputs.Draw.DrawManifoldOrCrossSectionOptions): THREEJS.Group {
        if ((decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto).vertProperties) {
            const decomposedMesh = decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto;
            if (decomposedMesh.triVerts.length !== 0) {
                const geometry = new THREEJS.BufferGeometry();
                geometry.setAttribute("position", new THREEJS.BufferAttribute(decomposedMesh.vertProperties, 3));
                geometry.setIndex(new THREEJS.BufferAttribute(decomposedMesh.triVerts, 1));
                geometry.computeVertexNormals();

                const group = new THREEJS.Group();
                group.name = `manifoldMesh-${Math.random()}`;

                if (options.faceMaterial === undefined) {
                    const material = new THREEJS.MeshPhysicalMaterial();
                    material.name = `pbr-${Math.random()}`;

                    material.color = new THREEJS.Color(options.faceColour);
                    material.metalness = 0.5;
                    material.roughness = 0.7;
                    material.opacity = options.faceOpacity;
                    material.alphaTest = 1;
                    if (!options.computeNormals) {
                        material.flatShading = true;
                    }
                    group.add(new THREEJS.Mesh(geometry, material));
                } else {
                    group.add(new THREEJS.Mesh(geometry, options.faceMaterial));
                }
                this.context.scene.add(group);
                return group;
            } else {
                return undefined;
            }
        } else {
            const decompsoedPolygons = decomposedManifold as Inputs.Base.Vector2[][];
            if (decompsoedPolygons.length > 0) {

                const group = new THREEJS.Group();
                group.name = `manifoldCrossSection-${Math.random()}`;
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
                polylineMesh.parent = group;
                this.context.scene.add(group);
                return group;
            }
            else {
                return undefined;
            }
        }

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
