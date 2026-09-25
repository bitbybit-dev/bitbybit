
import { uniqueName } from "../../../unique-name";
import { Context } from "../../../context";
import * as BABYLON from "@babylonjs/core";
import * as Inputs from "../../../inputs";
import { BabylonMesh } from "../mesh";
import earcut from "earcut";
import { resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../../../resolved-inputs";
/**
 * BabylonJS's own mesh primitives, built straight into the scene as ready-to-render meshes rather
 * than through a CAD kernel: boxes, spheres, discs, tori, polygons, tubes, polyhedra, capsules,
 * cylinders, extrusions, ribbons, lathes and grounds. They are quick to make and cheap to draw but
 * carry no exact geometry, so use the kernels when the shape must be measured, cut or exported.
 * Every builder centers its mesh on the origin, sets `sideOrientation` and registers it for shadows
 * unless `enableShadows` is false.
 */
export class BabylonMeshBuilder {

    constructor(private readonly context: Context, private readonly mesh: BabylonMesh) {
    }

    /**
     * Builds a box centered on the origin with `width` along X, `height` along Y and `depth` along
     * Z.
     * @param inputs - The three sizes, the side orientation and the shadow flag
     * @returns The box mesh
     * @group create simple
     * @shortname create box
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const box = bitbybit.babylon.meshBuilder.createBox({ width: 10, height: 5, depth: 20, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createBox(inputs: Inputs.BabylonMeshBuilder.CreateBoxDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateBoxDto, inputs) as Resolved.BabylonMeshBuilder.CreateBoxDto;
        const mesh = BABYLON.MeshBuilder.CreateBox(uniqueName("BabylonMesh"), {
            width: resolved.width,
            height: resolved.height,
            depth: resolved.depth,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);

        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a cube centered on the origin with every edge `size` long.
     * @param inputs - The edge length, the side orientation and the shadow flag
     * @returns The cube mesh
     * @group create simple
     * @shortname create cube
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const cube = bitbybit.babylon.meshBuilder.createCube({ size: 10, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createCube(inputs: Inputs.BabylonMeshBuilder.CreateCubeDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateCubeDto, inputs) as Resolved.BabylonMeshBuilder.CreateCubeDto;
        const mesh = BABYLON.MeshBuilder.CreateBox(uniqueName("BabylonMesh"), {
            size: resolved.size,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a flat square of side `size` centered on the origin in the XY plane, facing the Z
     * axis; a single-sided plane is invisible from behind unless `sideOrientation` is double-sided.
     * @param inputs - The side length, the side orientation and the shadow flag
     * @returns The plane mesh
     * @group create simple
     * @shortname square plane
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const plane = bitbybit.babylon.meshBuilder.createSquarePlane({ size: 10, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createSquarePlane(inputs: Inputs.BabylonMeshBuilder.CreateSquarePlaneDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateSquarePlaneDto, inputs) as Resolved.BabylonMeshBuilder.CreateSquarePlaneDto;
        const mesh = BABYLON.MeshBuilder.CreatePlane(uniqueName("BabylonMesh"), {
            size: resolved.size,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a sphere of the given `diameter` centered on the origin; `segments` sets how finely it
     * is divided, more being rounder and heavier.
     * @param inputs - The diameter, the segment count, the side orientation and the shadow flag
     * @returns The sphere mesh
     * @group create simple
     * @shortname create sphere
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const ball = bitbybit.babylon.meshBuilder.createSphere({ diameter: 10, segments: 32, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createSphere(inputs: Inputs.BabylonMeshBuilder.CreateSphereDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateSphereDto, inputs) as Resolved.BabylonMeshBuilder.CreateSphereDto;
        const mesh = BABYLON.MeshBuilder.CreateSphere(uniqueName("BabylonMesh"), {
            diameter: resolved.diameter,
            segments: resolved.segments,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a sphere from evenly sized triangles, subdivided from an icosahedron, which shades
     * more evenly than `createSphere`.
     *
     * `radiusX`, `radiusY` and `radiusZ` stretch it per axis and fall back to `radius` when 0;
     * `flat` gives faceted shading.
     * @param inputs - The radii, the flat flag, the subdivisions, the side orientation and the shadow flag
     * @returns The ico sphere mesh
     * @group create simple
     * @shortname create ico sphere
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const ball = bitbybit.babylon.meshBuilder.createIcoSphere({ radius: 5, radiusX: 0, radiusY: 0, radiusZ: 0, flat: false, subdivisions: 4, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createIcoSphere(inputs: Inputs.BabylonMeshBuilder.CreateIcoSphereDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateIcoSphereDto, inputs) as Resolved.BabylonMeshBuilder.CreateIcoSphereDto;
        const mesh = BABYLON.MeshBuilder.CreateIcoSphere(uniqueName("BabylonMesh"), {
            radius: resolved.radius,
            radiusX: resolved.radiusX,
            radiusY: resolved.radiusY,
            radiusZ: resolved.radiusZ,
            flat: resolved.flat,
            subdivisions: resolved.subdivisions,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a flat disc of the given `radius` centered on the origin in the XY plane; `arc` below
     * 1 leaves a pie slice, so 0.5 is a half disc.
     * @param inputs - The radius, the tessellation, the arc fraction, the side orientation and the shadow flag
     * @returns The disc mesh
     * @group create simple
     * @shortname create disc
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const disc = bitbybit.babylon.meshBuilder.createDisc({ radius: 5, tessellation: 32, arc: 1, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createDisc(inputs: Inputs.BabylonMeshBuilder.CreateDiscDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateDiscDto, inputs) as Resolved.BabylonMeshBuilder.CreateDiscDto;
        const mesh = BABYLON.MeshBuilder.CreateDisc(uniqueName("BabylonMesh"), {
            radius: resolved.radius,
            tessellation: resolved.tessellation,
            arc: resolved.arc,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a ring lying in the XZ plane around the origin: `diameter` is the ring's overall
     * diameter and `thickness` the diameter of its tube.
     * @param inputs - The diameter, the tube thickness, the tessellation, the side orientation and the shadow flag
     * @returns The torus mesh
     * @group create simple
     * @shortname create torus
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const ring = bitbybit.babylon.meshBuilder.createTorus({ diameter: 10, thickness: 2, tessellation: 32, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createTorus(inputs: Inputs.BabylonMeshBuilder.CreateTorusDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateTorusDto, inputs) as Resolved.BabylonMeshBuilder.CreateTorusDto;
        const mesh = BABYLON.MeshBuilder.CreateTorus(uniqueName("BabylonMesh"), {
            diameter: resolved.diameter,
            thickness: resolved.thickness,
            tessellation: resolved.tessellation,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a tube wound into a knot around the origin: `p` and `q` are how many times it winds
     * around the ring and through its hole, so 2 and 3 give the classic trefoil.
     * @param inputs - The radius, the tube radius, the segment counts, the winding numbers, the side orientation and the shadow flag
     * @returns The torus knot mesh
     * @group create simple
     * @shortname create torus knot
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const knot = bitbybit.babylon.meshBuilder.createTorusKnot({ radius: 5, tube: 1, radialSegments: 128, tubularSegments: 32, p: 2, q: 3, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createTorusKnot(inputs: Inputs.BabylonMeshBuilder.CreateTorusKnotDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateTorusKnotDto, inputs) as Resolved.BabylonMeshBuilder.CreateTorusKnotDto;
        const mesh = BABYLON.MeshBuilder.CreateTorusKnot(uniqueName("BabylonMesh"), {
            radius: resolved.radius,
            tube: resolved.tube,
            radialSegments: resolved.radialSegments,
            tubularSegments: resolved.tubularSegments,
            p: resolved.p,
            q: resolved.q,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a flat filled polygon from its outline points, with optional holes, lying in the XZ
     * plane; a `depth` above 0 gives it thickness downward.
     *
     * The points are 3D but only X and Z are used, and the outline must not cross itself.
     * @param inputs - The outline, the holes, the depth, the smoothing, the side orientation, the wrap flag and the shadow flag
     * @returns The polygon mesh
     * @group create simple
     * @shortname create polygon
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const slab = bitbybit.babylon.meshBuilder.createPolygon({ shape: [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]], holes: [], depth: 0, smoothingThreshold: 0.01, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, wrap: false, enableShadows: true });
     * ```
     */
    createPolygon(inputs: Inputs.BabylonMeshBuilder.CreatePolygonDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreatePolygonDto, inputs) as Resolved.BabylonMeshBuilder.CreatePolygonDto;
        const mesh = BABYLON.MeshBuilder.CreatePolygon(uniqueName("BabylonMesh"), {
            shape: resolved.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2])),
            holes: resolved.holes?.map(h => h.map(p => new BABYLON.Vector3(p[0], p[1], p[2]))) ?? [],
            depth: resolved.depth,
            smoothingThreshold: resolved.smoothingThreshold,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
            wrap: resolved.wrap,
        }, this.context.scene, earcut);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Builds a solid by extruding a flat polygon, given by its outline points in the XZ plane with
     * optional holes, downward by `depth`.
     * @param inputs - The outline, the holes, the depth, the side orientation, the wrap flag and the shadow flag
     * @returns The extruded mesh
     * @group create simple
     * @shortname create extrude polygon
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const block = bitbybit.babylon.meshBuilder.extrudePolygon({ shape: [[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]], holes: [[[3, 0, 3], [7, 0, 3], [7, 0, 7], [3, 0, 7]]], depth: 5, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, wrap: false, enableShadows: true });
     * ```
     */
    extrudePolygon(inputs: Inputs.BabylonMeshBuilder.ExtrudePolygonDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.ExtrudePolygonDto, inputs) as Resolved.BabylonMeshBuilder.ExtrudePolygonDto;
        const mesh = BABYLON.MeshBuilder.ExtrudePolygon(uniqueName("BabylonMesh"), {
            shape: resolved.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2])),
            holes: resolved.holes?.map(h => h.map(p => new BABYLON.Vector3(p[0], p[1], p[2]))) ?? [],
            depth: resolved.depth,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
            wrap: resolved.wrap,
        }, this.context.scene, earcut);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Builds a tube of the given `radius` along a path of points; `cap` closes neither, one or both
     * ends, and `arc` below 1 leaves the tube open along its length.
     * @param inputs - The path, the radius, the tessellation, the cap mode, the arc fraction, the side orientation and the shadow flag
     * @returns The tube mesh
     * @group create simple
     * @shortname create tube
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const pipe = bitbybit.babylon.meshBuilder.createTube({ path: [[0, 0, 0], [10, 0, 0], [10, 10, 0]], radius: 1, tessellation: 32, cap: 3, arc: 1, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createTube(inputs: Inputs.BabylonMeshBuilder.CreateTubeDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateTubeDto, inputs) as Resolved.BabylonMeshBuilder.CreateTubeDto;
        const path = resolved.path.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const mesh = BABYLON.MeshBuilder.CreateTube(uniqueName("BabylonMesh"), {
            path,
            radius: resolved.radius,
            tessellation: resolved.tessellation,
            cap: resolved.cap,
            arc: resolved.arc,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds one of the fifteen built-in polyhedra by `type`, from tetrahedron (0) to elongated
     * pentagonal cupola (14), or your own from `custom` data.
     *
     * `sizeX`, `sizeY` and `sizeZ` stretch it per axis and fall back to `size` when 0; `flat` gives
     * faceted shading.
     * @param inputs - The size and type, the custom data, the flat flag, the side orientation and the shadow flag
     * @returns The polyhedron mesh
     * @group create simple
     * @shortname create polyhedron
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const dodecahedron = bitbybit.babylon.meshBuilder.createPolyhedron({ size: 5, type: 2, sizeX: 0, sizeY: 0, sizeZ: 0, flat: true, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createPolyhedron(inputs: Inputs.BabylonMeshBuilder.CreatePolyhedronDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreatePolyhedronDto, inputs) as Resolved.BabylonMeshBuilder.CreatePolyhedronDto;
        const mesh = BABYLON.MeshBuilder.CreatePolyhedron(uniqueName("BabylonMesh"), {
            type: resolved.type,
            size: resolved.size,
            sizeX: resolved.sizeX,
            sizeY: resolved.sizeY,
            sizeZ: resolved.sizeZ,
            custom: resolved.custom,
            flat: resolved.flat,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Builds a geodesic sphere, an icosahedron whose faces are subdivided into triangles as `m` and
     * `n` say, so the surface is made of near-equal triangles.
     *
     * `sizeX`, `sizeY` and `sizeZ` stretch it per axis and fall back to `size` when 0.
     * @param inputs - The subdivision numbers, the sizes, the flat flag, the side orientation and the shadow flag
     * @returns The geodesic mesh
     * @group create simple
     * @shortname create geodesic
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const dome = bitbybit.babylon.meshBuilder.createGeodesic({ m: 4, n: 4, size: 5, sizeX: 0, sizeY: 0, sizeZ: 0, flat: false, subdivisions: 4, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.frontside, enableShadows: true });
     * ```
     */
    createGeodesic(inputs: Inputs.BabylonMeshBuilder.CreateGeodesicDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateGeodesicDto, inputs) as Resolved.BabylonMeshBuilder.CreateGeodesicDto;
        const mesh = BABYLON.MeshBuilder.CreateGeodesic(uniqueName("BabylonMesh"), {
            m: resolved.m,
            n: resolved.n,
            size: resolved.size,
            sizeX: resolved.sizeX,
            sizeY: resolved.sizeY,
            sizeZ: resolved.sizeZ,
            flat: resolved.flat,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Builds a Goldberg polyhedron, a ball made of hexagons and twelve pentagons like a football,
     * with `m` and `n` setting how many hexagons there are.
     *
     * `sizeX`, `sizeY` and `sizeZ` stretch it per axis and fall back to `size` when 0.
     * @param inputs - The subdivision numbers, the sizes, the side orientation and the shadow flag
     * @returns The Goldberg mesh
     * @group create simple
     * @shortname create goldberg
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const ball = bitbybit.babylon.meshBuilder.createGoldberg({ m: 4, n: 4, size: 5, sizeX: 0, sizeY: 0, sizeZ: 0, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createGoldberg(inputs: Inputs.BabylonMeshBuilder.CreateGoldbergDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateGoldbergDto, inputs) as Resolved.BabylonMeshBuilder.CreateGoldbergDto;
        const mesh = BABYLON.MeshBuilder.CreateGoldberg(uniqueName("BabylonMesh"), {
            n: resolved.n,
            m: resolved.m,
            size: resolved.size,
            sizeX: resolved.sizeX,
            sizeY: resolved.sizeY,
            sizeZ: resolved.sizeZ,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Builds a capsule, a cylinder with rounded ends, of the given `height` and `radius` along
     * `orientation`; `radiusTop` and `radiusBottom` size the two ends separately.
     * @param inputs - The orientation, the sizes, the subdivision counts, the side orientation and the shadow flag
     * @returns The capsule mesh
     * @group create simple
     * @shortname create capsule
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const pill = bitbybit.babylon.meshBuilder.createCapsule({ orientation: [0, 1, 0], subdivisions: 2, tessellation: 16, height: 10, radius: 2, capSubdivisions: 6, radiusTop: 2, radiusBottom: 2, topCapSubdivisions: 6, bottomCapSubdivisions: 6, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createCapsule(inputs: Inputs.BabylonMeshBuilder.CreateCapsuleDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateCapsuleDto, inputs) as Resolved.BabylonMeshBuilder.CreateCapsuleDto;
        const mesh = BABYLON.MeshBuilder.CreateCapsule(uniqueName("BabylonMesh"), {
            orientation: new BABYLON.Vector3(...resolved.orientation),
            subdivisions: resolved.subdivisions,
            tessellation: resolved.tessellation,
            height: resolved.height,
            radius: resolved.radius,
            capSubdivisions: resolved.capSubdivisions,
            radiusTop: resolved.radiusTop,
            radiusBottom: resolved.radiusBottom,
            topCapSubdivisions: resolved.topCapSubdivisions,
            bottomCapSubdivisions: resolved.bottomCapSubdivisions
        }, this.context.scene);
        mesh.sideOrientation = this.mesh.getSideOrientation(resolved.sideOrientation);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }

        return mesh;
    }

    /**
     * Builds a cylinder standing along Y, centered on the origin; different top and bottom
     * diameters make a cone or a taper, and 0 closes an end to a point.
     * @param inputs - The height, the two diameters, the tessellation, the subdivisions, the side orientation and the shadow flag
     * @returns The cylinder mesh
     * @group create simple
     * @shortname create cylinder
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const cone = bitbybit.babylon.meshBuilder.createCylinder({ height: 10, diameterTop: 0, diameterBottom: 6, tessellation: 64, subdivisions: 1, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createCylinder(inputs: Inputs.BabylonMeshBuilder.CreateCylinderDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateCylinderDto, inputs) as Resolved.BabylonMeshBuilder.CreateCylinderDto;
        const mesh = BABYLON.MeshBuilder.CreateCylinder(uniqueName("BabylonMesh"), {
            height: resolved.height,
            diameterTop: resolved.diameterTop,
            diameterBottom: resolved.diameterBottom,
            tessellation: resolved.tessellation,
            subdivisions: resolved.subdivisions,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Sweeps a profile along a path: `shape` is the profile as points in the XY plane and `path`
     * the points it travels through, with `scale` and `rotation` in radians applied step by step
     * along the way.
     *
     * `closeShape` joins the profile's ends, `closePath` joins the path's, and `cap` closes
     * neither, one or both ends.
     * @param inputs - The profile, the path, the scale, the rotation per step, the closing flags, the cap mode, the side orientation and the shadow flag
     * @returns The swept mesh
     * @group create simple
     * @shortname create extruded shape
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const rail = bitbybit.babylon.meshBuilder.createExtrudedSahpe({ shape: [[-1, 0, 0], [1, 0, 0], [1, 1, 0], [-1, 1, 0]], path: [[0, 0, 0], [10, 0, 0], [10, 0, 10]], scale: 1, rotation: 0, closeShape: true, closePath: false, cap: 3, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createExtrudedSahpe(inputs: Inputs.BabylonMeshBuilder.CreateExtrudedShapeDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateExtrudedShapeDto, inputs) as Resolved.BabylonMeshBuilder.CreateExtrudedShapeDto;
        const shape = resolved.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const path = resolved.path.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const mesh = BABYLON.MeshBuilder.ExtrudeShape(uniqueName("BabylonMesh"), {
            shape: shape,
            path: path,
            scale: resolved.scale,
            rotation: resolved.rotation,
            closeShape: resolved.closeShape,
            closePath: resolved.closePath,
            cap: resolved.cap,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a surface through several paths of points, joining neighboring paths with triangles,
     * like cloth stretched over a set of lines.
     *
     * `closePath` joins each path's ends, `closeArray` joins the last path back to the first, and
     * `offset` shifts how points pair up when only one path is given.
     * @param inputs - The paths, the closing flags, the offset, the updatable flag, the side orientation and the shadow flag
     * @returns The ribbon mesh
     * @group create simple
     * @shortname create ribbon
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const sheet = bitbybit.babylon.meshBuilder.createRibbon({ pathArray: [[[0, 0, 0], [10, 0, 0], [20, 0, 0]], [[0, 5, 5], [10, 5, 5], [20, 5, 5]]], closeArray: false, closePath: false, offset: 0, updatable: false, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createRibbon(inputs: Inputs.BabylonMeshBuilder.CreateRibbonDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateRibbonDto, inputs) as Resolved.BabylonMeshBuilder.CreateRibbonDto;
        const pathArray = resolved.pathArray.map(p => {
            return p.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        });
        const mesh = BABYLON.MeshBuilder.CreateRibbon(uniqueName("BabylonMesh"), {
            pathArray: pathArray,
            closeArray: resolved.closeArray,
            closePath: resolved.closePath,
            offset: resolved.offset,
            updatable: resolved.updatable,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Revolves a profile around the Y axis, the way a lathe turns wood: `shape` is the profile as
     * points in the XY plane with X as the distance from the axis, `radius` pushes it outward, and
     * `arc` below 1 leaves the revolution open.
     * @param inputs - The profile, the radius, the tessellation, the arc fraction, the closed flag, the side orientation and the shadow flag
     * @returns The lathe mesh
     * @group create simple
     * @shortname create lathe
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const vase = bitbybit.babylon.meshBuilder.createLathe({ shape: [[2, 0, 0], [3, 3, 0], [2, 6, 0], [2.5, 8, 0]], radius: 0, tessellation: 64, arc: 1, closed: true, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createLathe(inputs: Inputs.BabylonMeshBuilder.CreateLatheDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateLatheDto, inputs) as Resolved.BabylonMeshBuilder.CreateLatheDto;
        const shape = resolved.shape.map(p => new BABYLON.Vector3(p[0], p[1], p[2]));
        const mesh = BABYLON.MeshBuilder.CreateLathe(uniqueName("BabylonMesh"), {
            shape: shape,
            radius: resolved.radius,
            tessellation: resolved.tessellation,
            arc: resolved.arc,
            closed: resolved.closed,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }

    /**
     * Builds a flat ground plane centered on the origin in the XZ plane, `width` along X and
     * `height` along Z, divided into a grid of `subdivisionsX` by `subdivisionsY` cells.
     * @param inputs - The width, the height, the subdivisions, the side orientation and the shadow flag
     * @returns The ground mesh
     * @group create simple
     * @shortname create ground
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const ground = bitbybit.babylon.meshBuilder.createGround({ width: 100, height: 100, subdivisionsX: 1, subdivisionsY: 1, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createGround(inputs: Inputs.BabylonMeshBuilder.CreateGroundDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateGroundDto, inputs) as Resolved.BabylonMeshBuilder.CreateGroundDto;
        const mesh = BABYLON.MeshBuilder.CreateGround(uniqueName("BabylonMesh"), {
            width: resolved.width,
            height: resolved.height,
            subdivisionsX: resolved.subdivisionsX,
            subdivisionsY: resolved.subdivisionsY,
        }, this.context.scene);
        mesh.sideOrientation = this.mesh.getSideOrientation(resolved.sideOrientation);
        if (resolved.enableShadows) {
            this.enableShadows(mesh);
        } else {
            mesh.metadata = { shadows: false };
        }
        return mesh;
    }


    /**
     * Builds a flat rectangle centered on the origin in the XY plane, `width` along X and `height`
     * along Y, facing the Z axis.
     * @param inputs - The width, the height, the side orientation and the shadow flag
     * @returns The plane mesh
     * @group create simple
     * @shortname rectangle plane
     * @disposableOutput true
     * @drawable true
     * @example
     * ```typescript
     * const plane = bitbybit.babylon.meshBuilder.createRectanglePlane({ width: 20, height: 10, sideOrientation: Bit.Inputs.BabylonMesh.sideOrientationEnum.doubleside, enableShadows: true });
     * ```
     */
    createRectanglePlane(inputs: Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto): BABYLON.Mesh {
        const resolved = resolveDto(Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto, inputs) as Resolved.BabylonMeshBuilder.CreateRectanglePlaneDto;
        const mesh = BABYLON.MeshBuilder.CreatePlane(uniqueName("BabylonMesh"), {
            width: resolved.width,
            height: resolved.height,
            sideOrientation: this.mesh.getSideOrientation(resolved.sideOrientation),
        }, this.context.scene);
        if (resolved.enableShadows) {
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
