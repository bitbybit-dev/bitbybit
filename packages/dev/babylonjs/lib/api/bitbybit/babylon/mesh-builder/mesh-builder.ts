
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs/inputs";
import { BabylonMesh } from "../mesh";
import * as earcut from "earcut";
export class BabylonMeshBuilder {

    constructor(private readonly context: Context, private readonly mesh: BabylonMesh) {
    }

    /**
     * Creates a box mesh
     * @param inputs required to set up basic box
     * @returns Babylon mesh
     * @group create simple
     * @shortname create box
     * @disposableOutput true
     * @drawable true
     */
    createBox(inputs: Inputs.BabylonMeshBuilder.CreateBoxDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateBox("BabylonMesh" + Math.random(), {
            width: inputs.width,
            height: inputs.height,
            depth: inputs.depth,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);

        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Creates a cube mesh
     * @param inputs required to set up basic cube
     * @returns Babylon mesh
     * @group create simple
     * @shortname create cube
     * @disposableOutput true
     * @drawable true
     */
    createCube(inputs: Inputs.BabylonMeshBuilder.CreateCubeDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateBox("BabylonMesh" + Math.random(), {
            size: inputs.size,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Creates a square plane mesh
     * @param inputs required to set up basic cube
     * @returns Babylon mesh
     * @group create simple
     * @shortname square plane
     * @disposableOutput true
     * @drawable true
     */
    createSquarePlane(inputs: Inputs.BabylonMeshBuilder.CreateSquarePlaneDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreatePlane("BabylonMesh" + Math.random(), {
            size: inputs.size,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Creates a sphere mesh
     * @param inputs required to set up basic sphere
     * @returns Babylon mesh
     * @group create simple
     * @shortname create sphere
     * @disposableOutput true
     * @drawable true
     */
    createSphere(inputs: Inputs.BabylonMeshBuilder.CreateSphereDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateSphere("BabylonMesh" + Math.random(), {
            diameter: inputs.diameter,
            segments: inputs.segments,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create ico sphere
     * @param inputs required to set up a ico sphere 
     * @returns Babylon mesh
     * @group create simple
     * @shortname create ico sphere
     * @disposableOutput true
     * @drawable true
     */
    createIcoSphere(inputs: Inputs.BabylonMeshBuilder.CreateIcoSphereDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateIcoSphere("BabylonMesh" + Math.random(), {
            radius: inputs.radius,
            radiusX: inputs.radiusX,
            radiusY: inputs.radiusY,
            radiusZ: inputs.radiusZ,
            flat: inputs.flat,
            subdivisions: inputs.subdivisions,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Creates a disc
     * @param inputs required to set up a disc
     * @returns Babylon mesh
     * @group create simple
     * @shortname create disc
     * @disposableOutput true
     * @drawable true
     */
    createDisc(inputs: Inputs.BabylonMeshBuilder.CreateDiscDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateDisc("BabylonMesh" + Math.random(), {
            radius: inputs.radius,
            tessellation: inputs.tessellation,
            arc: inputs.arc,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create a torus mesh
     * @param inputs required to set up a torus
     * @returns Babylon mesh
     * @group create simple
     * @shortname create torus
     * @disposableOutput true
     * @drawable true
     */
    createTorus(inputs: Inputs.BabylonMeshBuilder.CreateTorusDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateTorus("BabylonMesh" + Math.random(), {
            diameter: inputs.diameter,
            thickness: inputs.thickness,
            tessellation: inputs.tessellation,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create a torus knot mesh
     * @param inputs required to set up a torus knot
     * @returns Babylon mesh
     * @group create simple
     * @shortname create torus knot
     * @disposableOutput true
     * @drawable true
     */
    createTorusKnot(inputs: Inputs.BabylonMeshBuilder.CreateTorusKnotDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateTorusKnot("BabylonMesh" + Math.random(), {
            radius: inputs.radius,
            tube: inputs.tube,
            radialSegments: inputs.radialSegments,
            tubularSegments: inputs.tubularSegments,
            p: inputs.p,
            q: inputs.q,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create a polygon mesh
     * @param inputs required to set up a polygon
     * @returns Babylon mesh
     * @group create simple
     * @shortname create polygon
     * @disposableOutput true
     * @drawable true
     */
    createPolygon(inputs: Inputs.BabylonMeshBuilder.CreatePolygonDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreatePolygon("BabylonMesh" + Math.random(), {
            shape: inputs.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2])),
            holes: inputs.holes?.map(h => h.map(p => new BABYLON.Vector3(p[0], p[1], p[2]))),
            depth: inputs.depth,
            smoothingThreshold: inputs.smoothingThreshold,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
            wrap: inputs.wrap,
        }, this.context.scene, earcut);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Create extruded polygon mesh
     * @param inputs required to set up a extrude polygon
     * @returns Babylon mesh
     * @group create simple
     * @shortname create extrude polygon
     * @disposableOutput true
     * @drawable true
     */
    extrudePolygon(inputs: Inputs.BabylonMeshBuilder.ExtrudePolygonDto): BABYLON.Mesh {
        console.log(earcut);
        const mesh = BABYLON.MeshBuilder.ExtrudePolygon("BabylonMesh" + Math.random(), {
            shape: inputs.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2])),
            holes: inputs.holes?.map(h => h.map(p => new BABYLON.Vector3(p[0], p[1], p[2]))),
            depth: inputs.depth,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
            wrap: inputs.wrap,
        }, this.context.scene, earcut);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Create a tube mesh
     * @param inputs required to set up a tube
     * @returns Babylon mesh
     * @group create simple
     * @shortname create tube
     * @disposableOutput true
     * @drawable true
     */
    createTube(inputs: Inputs.BabylonMeshBuilder.CreateTubeDto): BABYLON.Mesh {
        const path = inputs.path.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const mesh = BABYLON.MeshBuilder.CreateTube("BabylonMesh" + Math.random(), {
            path,
            radius: inputs.radius,
            tessellation: inputs.tessellation,
            cap: inputs.cap,
            arc: inputs.arc,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create a polyhedron mesh
     * @param inputs required to set up a polyhedron
     * @returns Babylon mesh
     * @group create simple
     * @shortname create polyhedron
     * @disposableOutput true
     * @drawable true
     */
    createPolyhedron(inputs: Inputs.BabylonMeshBuilder.CreatePolyhedronDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreatePolyhedron("BabylonMesh" + Math.random(), {
            type: inputs.type,
            size: inputs.size,
            sizeX: inputs.sizeX,
            sizeY: inputs.sizeY,
            sizeZ: inputs.sizeZ,
            custom: inputs.custom,
            flat: inputs.flat,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Create geodesic mesh
     * @param inputs required to set up a geodesic
     * @returns Babylon mesh
     * @group create simple
     * @shortname create geodesic
     * @disposableOutput true
     * @drawable true
     */
    createGeodesic(inputs: Inputs.BabylonMeshBuilder.CreateGeodesicDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateGeodesic("BabylonMesh" + Math.random(), {
            m: inputs.m,
            n: inputs.n,
            size: inputs.size,
            sizeX: inputs.sizeX,
            sizeY: inputs.sizeY,
            sizeZ: inputs.sizeZ,
            flat: inputs.flat,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Create goldberg mesh
     * @param inputs required to set up a goldberg mesh
     * @returns Babylon mesh
     * @group create simple
     * @shortname create goldberg
     * @disposableOutput true
     * @drawable true
     */
    createGoldberg(inputs: Inputs.BabylonMeshBuilder.CreateGoldbergDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateGoldberg("BabylonMesh" + Math.random(), {
            n: inputs.n,
            m: inputs.m,
            size: inputs.size,
            sizeX: inputs.sizeX,
            sizeY: inputs.sizeY,
            sizeZ: inputs.sizeZ,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Create capsule mesh
     * @param inputs required to set up a capsule
     * @returns Babylon mesh
     * @group create simple
     * @shortname create capsule
     * @disposableOutput true
     * @drawable true
     */
    createCapsule(inputs: Inputs.BabylonMeshBuilder.CreateCapsuleDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateCapsule("BabylonMesh" + Math.random(), {
            orientation: new BABYLON.Vector3(...inputs.orientation),
            subdivisions: inputs.subdivisions,
            tessellation: inputs.tessellation,
            height: inputs.height,
            radius: inputs.radius,
            capSubdivisions: inputs.capSubdivisions,
            radiusTop: inputs.radiusTop,
            radiusBottom: inputs.radiusBottom,
            topCapSubdivisions: inputs.topCapSubdivisions,
            bottomCapSubdivisions: inputs.bottomCapSubdivisions
        }, this.context.scene);
        mesh.sideOrientation = this.mesh.getSideOrientation(inputs.sideOrientation);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Create a cylinder mesh
     * @param inputs required to set up a cylinder
     * @returns Babylon mesh
     * @group create simple
     * @shortname create cylinder
     * @disposableOutput true
     * @drawable true
     */
    createCylinder(inputs: Inputs.BabylonMeshBuilder.CreateCylinderDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateCylinder("BabylonMesh" + Math.random(), {
            height: inputs.height,
            diameterTop: inputs.diameterTop,
            diameterBottom: inputs.diameterBottom,
            tessellation: inputs.tessellation,
            subdivisions: inputs.subdivisions,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create extruded shape
     * @param inputs required to set up a extrude shape
     * @returns Babylon mesh
     * @group create simple
     * @shortname create extruded shape
     * @disposableOutput true
     * @drawable true
     */
    createExtrudedSahpe(inputs: Inputs.BabylonMeshBuilder.CreateExtrudedShapeDto): BABYLON.Mesh {
        const shape = inputs.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const path = inputs.path.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const mesh = BABYLON.MeshBuilder.ExtrudeShape("BabylonMesh" + Math.random(), {
            shape: shape,
            path: path,
            scale: inputs.scale,
            rotation: inputs.rotation,
            closeShape: inputs.closeShape,
            closePath: inputs.closePath,
            cap: inputs.cap,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create a ribbon mesh
     * @param inputs required to set up a ribbon
     * @returns Babylon mesh
     * @group create simple
     * @shortname create ribbon
     * @disposableOutput true
     * @drawable true
     */
    createRibbon(inputs: Inputs.BabylonMeshBuilder.CreateRibbonDto): BABYLON.Mesh {
        const pathArray = inputs.pathArray.map(p => {
            return p.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        });
        const mesh = BABYLON.MeshBuilder.CreateRibbon("BabylonMesh" + Math.random(), {
            pathArray: pathArray,
            closeArray: inputs.closeArray,
            closePath: inputs.closePath,
            offset: inputs.offset,
            updatable: inputs.updatable,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create lathe mesh
     * @param inputs required to set up a lathe
     * @returns Babylon mesh
     * @group create simple
     * @shortname create lathe
     * @disposableOutput true
     * @drawable true
     */
    createLathe(inputs: Inputs.BabylonMeshBuilder.CreateLatheDto): BABYLON.Mesh {
        const shape = inputs.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const mesh = BABYLON.MeshBuilder.CreateLathe("BabylonMesh" + Math.random(), {
            shape: shape,
            radius: inputs.radius,
            tessellation: inputs.tessellation,
            arc: inputs.arc,
            closed: inputs.closed,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Create the ground mesh
     * @param inputs required to set up a ground
     * @returns Babylon mesh
     * @group create simple
     * @shortname create ground
     * @disposableOutput true
     * @drawable true
     */
    createGround(inputs: Inputs.BabylonMeshBuilder.CreateGroundDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreateGround("BabylonMesh" + Math.random(), {
            width: inputs.width,
            height: inputs.height,
            subdivisionsX: inputs.subdivisionsX,
            subdivisionsY: inputs.subdivisionsY,
        }, this.context.scene);
        mesh.sideOrientation = this.mesh.getSideOrientation(inputs.sideOrientation);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    
    /**
     * Creates a rectangle plane mesh
     * @param inputs required to set up basic cube
     * @returns Babylon mesh
     * @group create simple
     * @shortname rectangle plane
     * @disposableOutput true
     * @drawable true
     */
    createRectanglePlane(inputs: Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto): BABYLON.Mesh {
        const mesh = BABYLON.MeshBuilder.CreatePlane("BabylonMesh" + Math.random(), {
            width: inputs.width,
            height: inputs.height,
            sideOrientation: this.mesh.getSideOrientation(inputs.sideOrientation),
        }, this.context.scene);
        if (inputs.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    private enableShadows(mesh: BABYLON.Mesh) {
        if (this.context.scene.metadata.shadowGenerators) {
            mesh.receiveShadows = true;
            const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];
            sgs.forEach(s => {
                s.addShadowCaster(mesh);
            });
        }
    }

}
