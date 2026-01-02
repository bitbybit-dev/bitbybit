
import { Context } from "./context";
import * as Inputs from "./inputs/inputs";
import { DrawHelperCore } from "@bitbybit-dev/core";
import { JSCADText } from "@bitbybit-dev/jscad-worker";
import { Vector } from "@bitbybit-dev/base";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import * as pc from "playcanvas";

// Type alias for polyline entities with user data
type PolylineEntity = Inputs.Draw.PolylineEntity;

export class DrawHelper extends DrawHelperCore {

    private usedMaterials: {
        hex: string,
        alpha: number,
        zOffset: number,
        material: pc.StandardMaterial
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

    async drawManifoldsOrCrossSections(inputs: Inputs.Manifold.DrawManifoldsOrCrossSectionsDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>): Promise<pc.Entity> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto[] = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldsOrCrossSections", inputs);
        const meshes = decomposedMesh.map(dec => this.handleDecomposedManifold(dec, options)).filter(s => s !== undefined);
        const manifoldMeshContainer = new pc.Entity("manifoldMeshContainer-" + Math.random());
        meshes.forEach(mesh => {
            manifoldMeshContainer.addChild(mesh);
        });
        this.context.scene.addChild(manifoldMeshContainer);
        return manifoldMeshContainer;
    }

    async drawManifoldOrCrossSection(inputs: Inputs.Manifold.DrawManifoldOrCrossSectionDto<Inputs.Manifold.ManifoldPointer | Inputs.Manifold.CrossSectionPointer, pc.StandardMaterial>): Promise<pc.Entity> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.Manifold.DecomposedManifoldMeshDto = await this.manifoldWorkerManager.genericCallToWorkerPromise("decomposeManifoldOrCrossSection", inputs);
        return this.handleDecomposedManifold(decomposedMesh, options);
    }

    async drawShape(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<pc.Entity> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const decomposedMesh: Inputs.OCCT.DecomposedMeshDto = await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        return this.handleDecomposedMesh(inputs, decomposedMesh, options);
    }

    async drawShapes(inputs: Inputs.OCCT.DrawShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<pc.Entity> {
        const options = this.deleteFaceMaterialForWorker(inputs);
        const meshes: Inputs.OCCT.DecomposedMeshDto[] = await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
        const meshesSolved = await Promise.all(meshes.map(async decomposedMesh => this.handleDecomposedMesh(inputs, decomposedMesh, options)));
        const shapesMeshContainer = new pc.Entity("shapesMeshContainer-" + Math.random());
        this.context.scene.addChild(shapesMeshContainer);
        meshesSolved.forEach(mesh => {
            shapesMeshContainer.addChild(mesh);
        });
        return shapesMeshContainer;
    }

    async drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto<pc.Entity>): Promise<pc.Entity> {
        const res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
        } = await this.jscadWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
        let meshToUpdate: pc.Entity;
        if (inputs.jscadMesh && inputs.updatable) {
            meshToUpdate = inputs.jscadMesh;
        } else {
            meshToUpdate = new pc.Entity(`jscadMesh-${Math.random()}`);
            this.context.scene.addChild(meshToUpdate);
        }
        let colour;
        if (inputs.mesh.color && inputs.mesh.color.length > 0) {
            // if jscad geometry is colorized and color is baked on geometry it will be used over anything that set in the draw options
            const c = inputs.mesh.color;
            colour = this.colorToHex(c[0], c[1], c[2]);
        } else {
            colour = Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours;
        }
        const s = this.makeMesh({ ...inputs, colour }, meshToUpdate, res);
        inputs.jscadMesh = s;
        return s;
    }

    async drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidMeshesDto<pc.Entity>): Promise<pc.Entity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs).then((res: {
            positions: number[],
            normals: number[],
            indices: number[],
            transforms: [],
            color?: number[]
        }[]) => {

            let localOrigin: pc.Entity;
            if (inputs.jscadMesh && inputs.updatable) {
                localOrigin = inputs.jscadMesh;
                this.clearEntity(localOrigin);
            } else {
                localOrigin = new pc.Entity(`jscadMeshes-${Math.random()}`);
            }

            const colourIsArrayAndMatches = Array.isArray(inputs.colours) && inputs.colours.length === res.length;
            const colorsAreArrays = Array.isArray(inputs.colours);

            res.map((r, index) => {
                const meshToUpdate = new pc.Entity(`jscadMeshes-${Math.random()}`);
                let colour;
                if (r.color) {
                    const c = r.color;
                    colour = this.colorToHex(c[0], c[1], c[2]);
                } else if (colourIsArrayAndMatches) {
                    colour = inputs.colours[index];
                } else if (colorsAreArrays) {
                    colour = inputs.colours[0];
                } else {
                    colour = inputs.colours;
                }
                const m = this.makeMesh({ ...inputs, colour }, meshToUpdate, r);
                localOrigin.addChild(m);
            });
            this.context.scene.addChild(localOrigin);
            inputs.jscadMesh = localOrigin;
            return localOrigin;
        });
    }

    drawPolylinesWithColours(inputs: Inputs.Polyline.DrawPolylinesDto<pc.Entity>): pc.Entity {
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
                    colours[index] = this.colorToHex(s.color[0], s.color[1], s.color[2]);
                } else {
                    colours[index] = s.color;
                }
            }
            return pts;
        });

        let existingMesh: pc.Entity | undefined;
        if (inputs.polylinesMesh && inputs.updatable) {
            existingMesh = inputs.polylinesMesh.children[0] as pc.Entity;
        }
        const polylines = this.drawPolylines(
            existingMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            colours
        );
        if (inputs.polylinesMesh && inputs.updatable) {
            if (inputs.polylinesMesh.children[0].name !== polylines.name) {
                const group = new pc.Entity(`polylines-${Math.random()}`);
                group.addChild(polylines);
                this.context.scene.addChild(group);
                return group;
            } else {
                return inputs.polylinesMesh;
            }
        } else {
            const group = new pc.Entity(`polylines-${Math.random()}`);
            group.addChild(polylines);
            this.context.scene.addChild(group);
            return group;
        }
    }

    drawPoint(inputs: Inputs.Point.DrawPointDto<pc.Entity>): pc.Entity {
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

    drawPolylineClose(inputs: Inputs.Polyline.DrawPolylineDto<pc.Entity>): pc.Entity {
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

    drawPolyline(mesh: pc.Entity,
        pointsToDraw: Inputs.Base.Point3[],
        updatable: boolean, size: number, opacity: number, colours: string | string[]): pc.Entity {
        const polylines = this.drawPolylines(mesh, [pointsToDraw], updatable, size, opacity, colours);
        if (!mesh) {
            mesh = new pc.Entity(`polyline-${Math.random()}`);
            mesh.addChild(polylines);
            this.context.scene.addChild(mesh);
        }
        return mesh;
    }

    drawCurve(inputs: Inputs.Verb.DrawCurveDto<pc.Entity>): pc.Entity {
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

    drawPoints(inputs: Inputs.Point.DrawPointsDto<pc.Entity>): pc.Entity {
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
            const children = inputs.pointsMesh.children;
            if (children.length === vectorPoints.length) {
                this.updatePointsInstances(inputs.pointsMesh, vectorPoints);
            } else {
                inputs.pointsMesh.destroy();
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

    updatePointsInstances(group: pc.Entity, positions: Inputs.Base.Point3[]): void {
        const children = group.children;
        positions.forEach((pos, index) => {
            if (children[index]) {
                children[index].setLocalPosition(pos[0], pos[1], pos[2]);
            }
        });
    }

    drawCurves(inputs: Inputs.Verb.DrawCurvesDto<pc.Entity>): pc.Entity {
        const points = inputs.curves.map(s => ({ points: s.tessellate() }));
        return this.drawPolylinesWithColours({ polylines: points, polylinesMesh: inputs.curvesMesh, ...inputs });
    }

    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto<pc.Entity>): pc.Entity {
        if (inputs.surfacesMesh && inputs.updatable) {
            this.clearEntity(inputs.surfacesMesh);
        } else {
            inputs.surfacesMesh = new pc.Entity(`colouredSurfaces-${Math.random()}`);
            this.context.scene.addChild(inputs.surfacesMesh);
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
                inputs.surfacesMesh.addChild(srf);
            });
        } else {
            inputs.surfaces.forEach((surface) => {
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

    private createPointSpheresMesh(
        meshName: string, positions: Inputs.Base.Point3[], colors: string[], opacity: number, size: number, _updatable: boolean): pc.Entity {
        const positionsModel = positions.map((pos, index) => {
            return {
                position: pos,
                color: colors[index],
                index
            };
        });

        const colorSet = Array.from(new Set(colors));
        const materialSet = colorSet.map((colour) => {
            const mat = new pc.StandardMaterial();
            mat.name = `mat-${Math.random()}`;
            mat.opacity = opacity;
            mat.emissive = this.hexToColor(colour);
            mat.diffuse = this.hexToColor(colour);
            mat.useLighting = false;
            mat.update();
            const positionsFiltered = positionsModel.filter(s => s.color === colour);

            return { hex: colorSet, material: mat, positions: positionsFiltered };
        });

        const pointsGroup = new pc.Entity(meshName);
        this.context.scene.addChild(pointsGroup);
        
        materialSet.forEach(ms => {
            
            ms.positions.forEach((pos, index) => {
                const sphereEntity = new pc.Entity(`point-${index}-${Math.random()}`);
                sphereEntity.addComponent("render", {
                    type: "sphere",
                    material: ms.material
                });
                sphereEntity.setLocalScale(size * 2, size * 2, size * 2);
                sphereEntity.setLocalPosition(pos.position[0], pos.position[1], pos.position[2]);
                pointsGroup.addChild(sphereEntity);
            });
        });

        return pointsGroup;
    }

    createOrUpdateSurfacesMesh(
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; uvs?: number[] }[],
        group: pc.Entity, updatable: boolean, material: pc.StandardMaterial, addToScene: boolean, hidden: boolean
    ): pc.Entity {
        const createMesh = () => {
            // Merge all geometries into one
            const totalPositions: number[] = [];
            let totalNormals: number[] = [];
            const totalIndices: number[] = [];
            const totalUvs: number[] = [];
            let indexOffset = 0;

            meshDataConverted.forEach(meshItem => {
                totalPositions.push(...meshItem.positions);
                if (meshItem.normals && meshItem.normals.length > 0) {
                    totalNormals.push(...meshItem.normals);
                }
                if (meshItem.uvs) {
                    totalUvs.push(...meshItem.uvs);
                }
                // Offset indices
                const offsetIndices = meshItem.indices.map(i => i + indexOffset);
                totalIndices.push(...offsetIndices);
                indexOffset += meshItem.positions.length / 3;
            });

            // Compute normals if they're missing
            if (totalNormals.length === 0 && totalPositions.length > 0) {
                totalNormals = this.computeNormals(totalPositions, totalIndices);
            }

            const mesh = new pc.Mesh(this.context.app.graphicsDevice);
            mesh.setPositions(totalPositions);
            mesh.setNormals(totalNormals);
            mesh.setIndices(totalIndices);
            if (totalUvs.length > 0) {
                mesh.setUvs(0, totalUvs);
            }
            mesh.update(pc.PRIMITIVE_TRIANGLES);
            return mesh;
        };

        if (group && updatable) {
            this.clearEntity(group);
            const mesh = createMesh();
            const meshInstance = new pc.MeshInstance(mesh, material);
            const entity = new pc.Entity(`surface-child-${Math.random()}`);
            entity.addComponent("render", {
                meshInstances: [meshInstance]
            });
            group.addChild(entity);
        } else {
            group = new pc.Entity(`surface-${Math.random()}`);
            if (addToScene) {
                this.context.scene.addChild(group);
            }
            const mesh = createMesh();
            const meshInstance = new pc.MeshInstance(mesh, material);
            const entity = new pc.Entity(`surface-child-${Math.random()}`);
            entity.addComponent("render", {
                meshInstances: [meshInstance]
            });
            group.addChild(entity);
        }
        if (hidden) {
            group.enabled = false;
        }
        return group;
    }

    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto<pc.Entity>): pc.Entity {
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

        const pbr = new pc.StandardMaterial();
        pbr.name = `pbr-${Math.random()}`;

        pbr.diffuse = this.hexToColor(Array.isArray(inputs.colours) ? inputs.colours[0] : inputs.colours);
        pbr.metalness = 0.5;
        pbr.gloss = 0.3;
        pbr.opacity = inputs.opacity;
        pbr.update();

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
        faceIndices: number[],
        meshData: { points: number[][]; normals: number[][]; },
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

    private makeMesh(inputs: { updatable: boolean, opacity: number, colour: string, hidden: boolean }, meshToUpdate: pc.Entity, res: { positions: number[]; normals: number[]; indices: number[]; transforms: []; }): pc.Entity {
        const pbr = new pc.StandardMaterial();
        pbr.name = `jscadMaterial-${Math.random()}`;
        pbr.diffuse = this.hexToColor(inputs.colour);
        pbr.metalness = 0.4;
        pbr.gloss = 0.4;
        pbr.opacity = inputs.opacity;
        pbr.update();

        this.createMesh(res.positions, res.indices, res.normals, meshToUpdate, res.transforms, inputs.updatable, pbr);
        if (inputs.hidden) {
            meshToUpdate.enabled = false;
        }
        return meshToUpdate;
    }

    private createMesh(
        positions: number[], indices: number[], normals: number[], jscadMesh: pc.Entity, transforms: number[], updatable: boolean, material: pc.StandardMaterial
    ): void {
        const mesh = new pc.Mesh(this.context.app.graphicsDevice);
        mesh.setPositions(positions);
        mesh.setIndices(indices);
        
        // Compute normals if they're missing or empty
        if (!normals || normals.length === 0) {
            const computedNormals = this.computeNormals(positions, indices);
            mesh.setNormals(computedNormals);
        } else {
            mesh.setNormals(normals);
        }
        
        mesh.update(pc.PRIMITIVE_TRIANGLES);
        
        const meshInstance = new pc.MeshInstance(mesh, material);
        this.clearEntity(jscadMesh);
        
        const entity = new pc.Entity(`jscadMeshChild-${Math.random()}`);
        entity.addComponent("render", {
            meshInstances: [meshInstance]
        });
        jscadMesh.addChild(entity);
        
        // Apply transforms
        if (transforms && transforms.length === 16) {
            const mat4 = new pc.Mat4();
            mat4.data = new Float32Array(transforms);
            const pos = new pc.Vec3();
            const rot = new pc.Quat();
            const scale = new pc.Vec3();
            mat4.getTranslation(pos);
            mat4.getScale(scale);
            rot.setFromMat4(mat4);
            jscadMesh.setLocalPosition(pos);
            jscadMesh.setLocalRotation(rot);
            jscadMesh.setLocalScale(scale);
        }
    }

    /**
     * Compute flat normals for a mesh when normals are not provided
     */
    private computeNormals(positions: number[], indices: number[]): number[] {
        const numVertices = positions.length / 3;
        const normals = new Float32Array(positions.length);
        
        // For each triangle, compute face normal and accumulate
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i];
            const i1 = indices[i + 1];
            const i2 = indices[i + 2];
            
            // Get vertices
            const v0x = positions[i0 * 3];
            const v0y = positions[i0 * 3 + 1];
            const v0z = positions[i0 * 3 + 2];
            
            const v1x = positions[i1 * 3];
            const v1y = positions[i1 * 3 + 1];
            const v1z = positions[i1 * 3 + 2];
            
            const v2x = positions[i2 * 3];
            const v2y = positions[i2 * 3 + 1];
            const v2z = positions[i2 * 3 + 2];
            
            // Compute edge vectors
            const e1x = v1x - v0x;
            const e1y = v1y - v0y;
            const e1z = v1z - v0z;
            
            const e2x = v2x - v0x;
            const e2y = v2y - v0y;
            const e2z = v2z - v0z;
            
            // Cross product
            const nx = e1y * e2z - e1z * e2y;
            const ny = e1z * e2x - e1x * e2z;
            const nz = e1x * e2y - e1y * e2x;
            
            // Accumulate normals for each vertex
            normals[i0 * 3] += nx;
            normals[i0 * 3 + 1] += ny;
            normals[i0 * 3 + 2] += nz;
            
            normals[i1 * 3] += nx;
            normals[i1 * 3 + 1] += ny;
            normals[i1 * 3 + 2] += nz;
            
            normals[i2 * 3] += nx;
            normals[i2 * 3 + 1] += ny;
            normals[i2 * 3 + 2] += nz;
        }
        
        // Normalize all normals
        for (let i = 0; i < numVertices; i++) {
            const x = normals[i * 3];
            const y = normals[i * 3 + 1];
            const z = normals[i * 3 + 2];
            const len = Math.sqrt(x * x + y * y + z * z);
            if (len > 0) {
                normals[i * 3] = x / len;
                normals[i * 3 + 1] = y / len;
                normals[i * 3 + 2] = z / len;
            }
        }
        
        return Array.from(normals);
    }

    private async handleDecomposedMesh(inputs: Inputs.OCCT.DrawShapeDto<Inputs.OCCT.TopoDSShapePointer>, decomposedMesh: Inputs.OCCT.DecomposedMeshDto, options: Inputs.Draw.DrawOcctShapeOptions): Promise<pc.Entity> {
        const shapeGroup = new pc.Entity("brepMesh-" + Math.random());
        this.context.scene.addChild(shapeGroup);

        if (inputs.drawFaces && decomposedMesh && decomposedMesh.faceList && decomposedMesh.faceList.length) {

            let pbr: pc.StandardMaterial;

            if (options.faceMaterial) {
                pbr = options.faceMaterial;
            } else {
                const hex = Array.isArray(inputs.faceColour) ? inputs.faceColour[0] : inputs.faceColour;
                const alpha = inputs.faceOpacity;
                const zOffset = inputs.drawEdges ? 2 : 0;
                const slopeOffset = inputs.drawEdges ? 2 : 0;
                const materialCached = this.usedMaterials.find(s => s.hex === hex && s.alpha === alpha && s.zOffset === zOffset);
                if (materialCached) {
                    pbr = materialCached.material;
                } else {
                    const pbmat = new pc.StandardMaterial();

                    pbmat.diffuse = this.hexToColor(hex);
                    pbmat.metalness = 0.4;
                    pbmat.gloss = 0.2;
                    pbmat.opacity = alpha;
                    // Use both depthBias and slopeDepthBias to push faces behind edges
                    pbmat.depthBias = zOffset;
                    pbmat.slopeDepthBias = slopeOffset;
                    pbmat.update();
                    
                    this.usedMaterials.push({
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

            const mesh = this.createOrUpdateSurfacesMesh(meshData, undefined, false, pbr, false, false);
            shapeGroup.addChild(mesh);
        }
        if (inputs.drawEdges && decomposedMesh && decomposedMesh.edgeList && decomposedMesh.edgeList.length) {

            const polylineEdgePoints = [];
            decomposedMesh.edgeList.forEach(edge => {
                const ev = edge.vertex_coord.filter(s => s !== undefined);
                polylineEdgePoints.push(ev);
            });
            const line = this.drawPolylines(undefined, polylineEdgePoints, false, inputs.edgeWidth, inputs.edgeOpacity, inputs.edgeColour);
            shapeGroup.addChild(line);
        }

        if (inputs.drawVertices && decomposedMesh && decomposedMesh.pointsList && decomposedMesh.pointsList.length) {
            const mesh = this.drawPoints({
                points: decomposedMesh.pointsList,
                opacity: 1,
                size: inputs.vertexSize,
                colours: inputs.vertexColour,
                updatable: false,
            });
            shapeGroup.addChild(mesh);
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

                return texts;
            });
            const textPolylines = await Promise.all(promises);
            const edgeMesh = this.drawPolylines(undefined, textPolylines.flat(), false, 0.2, 1, inputs.edgeIndexColour);
            shapeGroup.addChild(edgeMesh);
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
            shapeGroup.addChild(faceMesh);
        }
        return shapeGroup;
    }

    private drawPolylines(existingEntity: pc.Entity | undefined, polylinesPoints: Inputs.Base.Vector3[][], updatable: boolean,
        size: number, opacity: number, colours: string | string[]): pc.Entity {
        if (polylinesPoints && polylinesPoints.length > 0) {
            const linePositions: number[] = [];

            polylinesPoints.forEach(pts => {
                for (let i = 0; i < pts.length - 1; i++) {
                    const c = pts[i];
                    const n = pts[i + 1];

                    linePositions.push(c[0], c[1], c[2]);
                    linePositions.push(n[0], n[1], n[2]);
                }
            });

            let lines: PolylineEntity;
            if (existingEntity && updatable) {
                const polylineEntity = existingEntity as PolylineEntity;
                // Check if polyline lengths match - if they do, update; if not, create new
                if (polylineEntity.bitbybitMeta?.linesForRenderLengths === polylinesPoints.map(l => l.length).toString()) {
                    const renderComponent = existingEntity.render;
                    if (renderComponent && renderComponent.meshInstances.length > 0) {
                        const mesh = renderComponent.meshInstances[0].mesh;
                        mesh.setPositions(linePositions);
                        mesh.update(pc.PRIMITIVE_LINES);
                        return existingEntity;
                    }
                } else {
                    lines = this.createLineEntity(linePositions, colours, size) as PolylineEntity;
                    lines.bitbybitMeta = { linesForRenderLengths: polylinesPoints.map(l => l.length).toString() };
                    return lines;
                }
            } else {
                lines = this.createLineEntity(linePositions, colours, size) as PolylineEntity;
                lines.bitbybitMeta = { linesForRenderLengths: polylinesPoints.map(l => l.length).toString() };
                return lines;
            }
        } else {
            return undefined;
        }
    }

    private createLineEntity(linePositions: number[], colours: string | string[], _size: number): pc.Entity {
        const color = Array.isArray(colours) ? this.hexToColor(colours[0]) : this.hexToColor(colours);

        const mesh = new pc.Mesh(this.context.app.graphicsDevice);
        mesh.setPositions(linePositions);
        mesh.update(pc.PRIMITIVE_LINES);

        const material = new pc.StandardMaterial();
        material.emissive = color;
        material.diffuse = color;
        material.useLighting = false;
        material.update();

        const meshInstance = new pc.MeshInstance(mesh, material);
        const lineEntity = new pc.Entity("lines-" + Math.random());
        lineEntity.addComponent("render", {
            meshInstances: [meshInstance]
        });
        return lineEntity;
    }

    private handleDecomposedManifold(
        decomposedManifold: Inputs.Manifold.DecomposedManifoldMeshDto | Inputs.Base.Vector2[][],
        options: Inputs.Draw.DrawManifoldOrCrossSectionOptions): pc.Entity {
        if ((decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto).vertProperties) {
            const decomposedMesh = decomposedManifold as Inputs.Manifold.DecomposedManifoldMeshDto;
            if (decomposedMesh.triVerts.length !== 0) {
                const numProp = decomposedMesh.numProp || 3;
                const vertProperties = decomposedMesh.vertProperties;
                const triVerts = decomposedMesh.triVerts;
                
                // Extract indexed positions based on numProp stride
                let indexedPositions: number[];
                if (numProp === 3) {
                    indexedPositions = Array.from(vertProperties);
                } else {
                    const numVerts = vertProperties.length / numProp;
                    indexedPositions = [];
                    for (let i = 0; i < numVerts; i++) {
                        const baseIdx = i * numProp;
                        indexedPositions.push(vertProperties[baseIdx], vertProperties[baseIdx + 1], vertProperties[baseIdx + 2]);
                    }
                }
                
                // Unindex the mesh for flat shading - each triangle gets unique vertices
                const positions: number[] = [];
                const normals: number[] = [];
                const indices: number[] = [];
                
                for (let i = 0; i < triVerts.length; i += 3) {
                    const i0 = triVerts[i];
                    const i1 = triVerts[i + 1];
                    const i2 = triVerts[i + 2];
                    
                    // Get vertex positions
                    const v0x = indexedPositions[i0 * 3];
                    const v0y = indexedPositions[i0 * 3 + 1];
                    const v0z = indexedPositions[i0 * 3 + 2];
                    
                    const v1x = indexedPositions[i1 * 3];
                    const v1y = indexedPositions[i1 * 3 + 1];
                    const v1z = indexedPositions[i1 * 3 + 2];
                    
                    const v2x = indexedPositions[i2 * 3];
                    const v2y = indexedPositions[i2 * 3 + 1];
                    const v2z = indexedPositions[i2 * 3 + 2];
                    
                    // Compute face normal
                    const e1x = v1x - v0x;
                    const e1y = v1y - v0y;
                    const e1z = v1z - v0z;
                    
                    const e2x = v2x - v0x;
                    const e2y = v2y - v0y;
                    const e2z = v2z - v0z;
                    
                    let nx = e1y * e2z - e1z * e2y;
                    let ny = e1z * e2x - e1x * e2z;
                    let nz = e1x * e2y - e1y * e2x;
                    
                    // Normalize
                    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                    if (len > 0) {
                        nx /= len;
                        ny /= len;
                        nz /= len;
                    }
                    
                    // Add 3 unique vertices for this triangle
                    const baseIndex = positions.length / 3;
                    
                    positions.push(v0x, v0y, v0z);
                    positions.push(v1x, v1y, v1z);
                    positions.push(v2x, v2y, v2z);
                    
                    // Same normal for all 3 vertices (flat shading)
                    normals.push(nx, ny, nz);
                    normals.push(nx, ny, nz);
                    normals.push(nx, ny, nz);
                    
                    indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
                }
                
                const mesh = new pc.Mesh(this.context.app.graphicsDevice);
                mesh.setPositions(positions);
                mesh.setIndices(indices);
                mesh.setNormals(normals);
                mesh.update(pc.PRIMITIVE_TRIANGLES);

                const group = new pc.Entity(`manifoldMesh-${Math.random()}`);

                let material: pc.StandardMaterial;
                if (options.faceMaterial === undefined) {
                    material = new pc.StandardMaterial();
                    material.name = `pbr-${Math.random()}`;

                    material.diffuse = this.hexToColor(options.faceColour);
                    material.metalness = 0.5;
                    material.gloss = 0.3;
                    material.opacity = options.faceOpacity;
                    material.update();
                } else {
                    material = options.faceMaterial;
                }

                const meshInstance = new pc.MeshInstance(mesh, material);
                const childEntity = new pc.Entity(`manifoldMeshChild-${Math.random()}`);
                childEntity.addComponent("render", {
                    meshInstances: [meshInstance]
                });
                group.addChild(childEntity);
                
                this.context.scene.addChild(group);
                return group;
            } else {
                return undefined;
            }
        } else {
            const decompsoedPolygons = decomposedManifold as Inputs.Base.Vector2[][];
            if (decompsoedPolygons.length > 0) {

                const group = new pc.Entity(`manifoldCrossSection-${Math.random()}`);
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
                group.addChild(polylineMesh);
                this.context.scene.addChild(group);
                return group;
            }
            else {
                return undefined;
            }
        }
    }

    private clearEntity(entity: pc.Entity): void {
        while (entity.children.length > 0) {
            const child = entity.children[0];
            child.destroy();
        }
    }

    private hexToColor(hex: string): pc.Color {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return new pc.Color(
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255
            );
        }
        return new pc.Color(1, 0, 0);
    }

    private colorToHex(r: number, g: number, b: number): string {
        const toHex = (n: number) => {
            const hex = Math.round(n * 255).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + toHex(r) + toHex(g) + toHex(b);
    }

    // sometimes we must delete face material property for the web worker not to complain about complex (circular) objects and use cloned object later
    private deleteFaceMaterialForWorker<T extends { faceMaterial?: pc.StandardMaterial }>(inputs: T): T {
        const options = { ...inputs };
        if (inputs.faceMaterial) {
            delete inputs.faceMaterial;
        }
        return options;
    }
}
