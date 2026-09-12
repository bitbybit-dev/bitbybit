/* eslint-disable @typescript-eslint/no-namespace */
import { BabylonMesh } from "./babylon-mesh-inputs";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
/**
 * Parameters for the engine's own mesh primitives - boxes, spheres, cylinders, planes, tubes, ribbons
 * and the rest. These build display geometry directly, without going through a CAD kernel, which is
 * the right choice for scene furniture that never has to be manufactured.
 */
export namespace BabylonMeshBuilder {

    /**
     * Feeds `babylon.meshBuilder.createBox`: the three sizes of a box centered on the origin, plus
     * the side orientation and shadow flag every builder takes.
     */
    export class CreateBoxDto {
        constructor(width?: number, depth?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (width !== undefined) { this.width = width; }
            if (depth !== undefined) { this.depth = depth; }
            if (height !== undefined) { this.height = height; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Full size along X, in scene units
         * @default 1
         */
        width = 1;
        /**
         * Full size along Z, in scene units
         * @default 1
         */
        depth = 1;
        /**
         * Full size along Y, in scene units
         * @default 1
         */
        height = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }

    /**
     * Feeds `babylon.meshBuilder.createCube` with the edge length of a cube centered on the origin.
     */
    export class CreateCubeDto {
        constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (size !== undefined) { this.size = size; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Length of every edge, in scene units
         * @default 1
         */
        size = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createSquarePlane` with the side of a flat square in the XY plane.
     */
    export class CreateSquarePlaneDto {
        constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (size !== undefined) { this.size = size; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Length of each side, in scene units
         * @default 1
         */
        size = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createSphere` with the diameter of a sphere centered on the origin
     * and how finely it is divided.
     */
    export class CreateSphereDto {
        constructor(diameter?: number, segments?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (diameter !== undefined) { this.diameter = diameter; }
            if (segments !== undefined) { this.segments = segments; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Full width of the sphere, in scene units
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameter = 1;
        /**
         * Number of divisions around and over the sphere; more is rounder and heavier
         * @default 32
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 32;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createIcoSphere`: the radius of a triangle-based sphere, optional
     * per-axis radii, flat shading and how often it is subdivided.
     */
    export class CreateIcoSphereDto {
        constructor(radius?: number, radiusX?: number, radiusY?: number, radiusZ?: number, flat?: boolean, subdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (radius !== undefined) { this.radius = radius; }
            if (radiusX !== undefined) { this.radiusX = radiusX; }
            if (radiusY !== undefined) { this.radiusY = radiusY; }
            if (radiusZ !== undefined) { this.radiusZ = radiusZ; }
            if (flat !== undefined) { this.flat = flat; }
            if (subdivisions !== undefined) { this.subdivisions = subdivisions; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Radius on every axis, in scene units, unless a per-axis radius overrides it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Radius along X, in scene units; 0 falls back to `radius`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusX = 0;
        /**
         * Radius along Y, in scene units; 0 falls back to `radius`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusY = 0;
        /**
         * Radius along Z, in scene units; 0 falls back to `radius`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusZ = 0;
        /**
         * When true, each triangle is shaded flat, showing facets instead of a smooth surface
         * @default false
         */
        flat = false;
        /**
         * How many times the starting icosahedron is subdivided; more is rounder and heavier
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 4;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }

    /**
     * Feeds `babylon.meshBuilder.createDisc`: the radius of a flat disc in the XY plane, how many
     * sides approximate it and how much of the full circle it covers.
     */
    export class CreateDiscDto {
        constructor(radius?: number, tessellation?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (radius !== undefined) { this.radius = radius; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Distance from the center to the rim, in scene units
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Number of straight sides around the rim; more is rounder
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 32;
        /**
         * How much of the full circle is drawn, from 0 to 1; 0.5 gives a half disc
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        arc: number = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createRibbon`: the paths a surface is stretched over, how they
     * close and pair up, and whether the mesh can be updated later.
     */
    export class CreateRibbonDto {
        constructor(pathArray?: Base.Vector3[][], closeArray?: boolean, closePath?: boolean, offset?: number, updatable?: boolean, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (pathArray !== undefined) { this.pathArray = pathArray; }
            if (closeArray !== undefined) { this.closeArray = closeArray; }
            if (closePath !== undefined) { this.closePath = closePath; }
            if (offset !== undefined) { this.offset = offset; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The paths, each a list of points; neighboring paths are joined with triangles
         */
        pathArray!: Base.Vector3[][];
        /**
         * When true, the last path is joined back to the first, closing the surface around
         * @default false
         */
        closeArray = false;
        /**
         * When true, each path is joined end to start, closing the surface along
         * @default false
         */
        closePath = false;
        /**
         * When only one path is given, how many points apart the pairs that form triangles are
         * taken
         * @default 0
         */
        offset = 0;
        /**
         * When true, the vertices of the mesh can be changed later without rebuilding it
         * @default false
         */
        updatable = false;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createTorus`: the overall diameter of a ring in the XZ plane, the
     * diameter of its tube and how finely it is divided.
     */
    export class CreateTorusDto {
        constructor(diameter?: number, thickness?: number, tessellation?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (diameter !== undefined) { this.diameter = diameter; }
            if (thickness !== undefined) { this.thickness = thickness; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Full width of the ring, in scene units
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameter = 1;
        /**
         * Diameter of the tube, in scene units
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        thickness = 0.5;
        /**
         * Number of divisions around the ring and the tube; more is rounder
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 32;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }

    /**
     * Feeds `babylon.meshBuilder.createTorusKnot`: the size of a knotted tube, its segment counts
     * and the two winding numbers that shape the knot.
     */
    export class CreateTorusKnotDto {
        constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, p?: number, q?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (radius !== undefined) { this.radius = radius; }
            if (tube !== undefined) { this.tube = tube; }
            if (radialSegments !== undefined) { this.radialSegments = radialSegments; }
            if (tubularSegments !== undefined) { this.tubularSegments = tubularSegments; }
            if (p !== undefined) { this.p = p; }
            if (q !== undefined) { this.q = q; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Overall radius of the knot, in scene units
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 2;
        /**
         * Radius of the tube, in scene units
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        tube = 0.5;
        /**
         * Number of segments along the length of the tube; more is smoother
         * @default 128
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        radialSegments = 128;
        /**
         * Number of segments around the tube; more is rounder
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tubularSegments = 32;
        /**
         * How many times the tube winds around the axis of the ring; 2 with `q` 3 gives a trefoil
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        p = 2;
        /**
         * How many times the tube winds through the hole of the ring; 3 with `p` 2 gives a trefoil
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        q = 3;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }

    /**
     * Feeds `babylon.meshBuilder.createPolygon`: the outline of a flat polygon in the XZ plane, its
     * holes, an optional thickness and how it is shaded and wrapped.
     */
    export class CreatePolygonDto {
        constructor(shape?: Base.Vector3[], holes?: Base.Vector3[][], depth?: number, smoothingThreshold?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, wrap?: boolean, enableShadows?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (holes !== undefined) { this.holes = holes; }
            if (depth !== undefined) { this.depth = depth; }
            if (smoothingThreshold !== undefined) { this.smoothingThreshold = smoothingThreshold; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (wrap !== undefined) { this.wrap = wrap; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The outline points in order, only X and Z used; the outline must not cross itself
         */
        shape!: Base.Vector3[];
        /**
         * Lists of points, one outline per hole cut out of the polygon
         * @optional true
         */
        holes?: Base.Vector3[][] | undefined;
        /**
         * Thickness the polygon is given downward along Y, in scene units; 0 keeps it flat
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        depth = 0;
        /**
         * How close two face normals must be for the edge between them to be shaded smooth
         * @default 0.01
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        smoothingThreshold = 0.01;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the sides of an extruded polygon get texture coordinates that wrap around it
         * @default false
         */
        wrap = false;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.extrudePolygon`: the outline of a flat polygon in the XZ plane,
     * its holes, and how far it is extruded downward.
     */
    export class ExtrudePolygonDto {
        constructor(shape?: Base.Vector3[], holes?: Base.Vector3[][], depth?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, wrap?: boolean, enableShadows?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (holes !== undefined) { this.holes = holes; }
            if (depth !== undefined) { this.depth = depth; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (wrap !== undefined) { this.wrap = wrap; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The outline points in order, only X and Z used; the outline must not cross itself
         */
        shape!: Base.Vector3[];
        /**
         * Lists of points, one outline per hole through the extrusion
         * @optional true
         */
        holes?: Base.Vector3[][] | undefined;
        /**
         * How far the polygon is extruded downward along Y, in scene units
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        depth = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the sides get texture coordinates that wrap around the extrusion
         * @default false
         */
        wrap = false;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createPolyhedron`: which of the built-in polyhedra to build or
     * custom data for your own, its size per axis and its shading.
     */
    export class CreatePolyhedronDto {
        constructor(size?: number, type?: number, sizeX?: number, sizeY?: number, sizeZ?: number, custom?: number[], flat?: boolean, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (size !== undefined) { this.size = size; }
            if (type !== undefined) { this.type = type; }
            if (sizeX !== undefined) { this.sizeX = sizeX; }
            if (sizeY !== undefined) { this.sizeY = sizeY; }
            if (sizeZ !== undefined) { this.sizeZ = sizeZ; }
            if (custom !== undefined) { this.custom = custom; }
            if (flat !== undefined) { this.flat = flat; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Size on every axis, in scene units, unless a per-axis size overrides it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Which built-in shape, 0 to 14: 0 tetrahedron, 1 octahedron, 2 dodecahedron, 3
         * icosahedron, 4 rhombicuboctahedron, then prisms, pyramids, dipyramids and a cupola
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        type = 0;
        /**
         * Size along X, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeX = 0;
        /**
         * Size along Y, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeY = 0;
        /**
         * Size along Z, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeZ = 0;
        /**
         * Your own polyhedron as the data the engine expects, used instead of `type` when given
         * @optional true
         */
        custom?: number[] | undefined;
        /**
         * When true, each face is shaded flat, showing facets instead of a smooth surface
         * @default false
         */
        flat = false;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createGeodesic`: how finely the twenty faces of the sphere are
     * subdivided, its size per axis and its shading.
     */
    export class CreateGeodesicDto {
        constructor(m?: number, n?: number, size?: number, sizeX?: number, sizeY?: number, sizeZ?: number, flat?: boolean, subdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (m !== undefined) { this.m = m; }
            if (n !== undefined) { this.n = n; }
            if (size !== undefined) { this.size = size; }
            if (sizeX !== undefined) { this.sizeX = sizeX; }
            if (sizeY !== undefined) { this.sizeY = sizeY; }
            if (sizeZ !== undefined) { this.sizeZ = sizeZ; }
            if (flat !== undefined) { this.flat = flat; }
            if (subdivisions !== undefined) { this.subdivisions = subdivisions; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The first subdivision number; with `n` it sets how many triangles each face is split into
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        m = 4;
        /**
         * The second subdivision number; with `m` it sets how many triangles each face is split
         * into
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        n = 4;
        /**
         * Size on every axis, in scene units, unless a per-axis size overrides it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Size along X, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeX = 0;
        /**
         * Size along Y, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeY = 0;
        /**
         * Size along Z, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeZ = 0;
        /**
         * When true, each triangle is shaded flat, showing facets instead of a smooth surface
         * @default false
         */
        flat = false;
        /**
         * Kept for compatibility; the geodesic is built from `m` and `n`
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 4;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }

    /**
     * Feeds `babylon.meshBuilder.createCapsule`: the axis, length and radii of a cylinder with
     * rounded ends, and how finely each part is divided.
     */
    export class CreateCapsuleDto {
        constructor(orientation?: Base.Vector3, subdivisions?: number, tessellation?: number, height?: number, radius?: number, capSubdivisions?: number, radiusTop?: number, radiusBottom?: number, topCapSubdivisions?: number, bottomCapSubdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (orientation !== undefined) { this.orientation = orientation; }
            if (subdivisions !== undefined) { this.subdivisions = subdivisions; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (height !== undefined) { this.height = height; }
            if (radius !== undefined) { this.radius = radius; }
            if (capSubdivisions !== undefined) { this.capSubdivisions = capSubdivisions; }
            if (radiusTop !== undefined) { this.radiusTop = radiusTop; }
            if (radiusBottom !== undefined) { this.radiusBottom = radiusBottom; }
            if (topCapSubdivisions !== undefined) { this.topCapSubdivisions = topCapSubdivisions; }
            if (bottomCapSubdivisions !== undefined) { this.bottomCapSubdivisions = bottomCapSubdivisions; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The direction the length of the capsule runs along, as `[x, y, z]`; `[0, 1, 0]` stands it
         * upright
         */
        orientation!: Base.Vector3;
        /**
         * Number of divisions along the straight middle part
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 2;
        /**
         * Number of divisions around the capsule; more is rounder
         * @default 16
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 16;
        /**
         * Full length from end to end, rounded caps included, in scene units
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 2;
        /**
         * Radius of the middle part, in scene units, unless the cap radii override it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Number of divisions over each rounded end; more is smoother
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        capSubdivisions = 6;
        /**
         * Radius of the top end, in scene units
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusTop = 0.5;
        /**
         * Radius of the bottom end, in scene units
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusBottom = 0.5;
        /**
         * Number of divisions over the top end, overriding `capSubdivisions`
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        topCapSubdivisions = 6;
        /**
         * Number of divisions over the bottom end, overriding `capSubdivisions`
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        bottomCapSubdivisions = 6;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createGoldberg`: how many hexagons the ball is made of and its
     * size per axis.
     */
    export class CreateGoldbergDto {
        constructor(m?: number, n?: number, size?: number, sizeX?: number, sizeY?: number, sizeZ?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (m !== undefined) { this.m = m; }
            if (n !== undefined) { this.n = n; }
            if (size !== undefined) { this.size = size; }
            if (sizeX !== undefined) { this.sizeX = sizeX; }
            if (sizeY !== undefined) { this.sizeY = sizeY; }
            if (sizeZ !== undefined) { this.sizeZ = sizeZ; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The first subdivision number; with `n` it sets how many hexagons surround the twelve
         * pentagons
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        m = 4;
        /**
         * The second subdivision number; with `m` it sets how many hexagons surround the twelve
         * pentagons
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        n = 4;
        /**
         * Size on every axis, in scene units, unless a per-axis size overrides it
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Size along X, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeX = 0;
        /**
         * Size along Y, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeY = 0;
        /**
         * Size along Z, in scene units; 0 falls back to `size`
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeZ = 0;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createTube`: the path a tube follows, its radius, how round it is,
     * which ends are capped and how much of its circumference is drawn.
     */
    export class CreateTubeDto {
        constructor(path?: Base.Vector3[], radius?: number, tessellation?: number, cap?: number, arc?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (path !== undefined) { this.path = path; }
            if (radius !== undefined) { this.radius = radius; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (cap !== undefined) { this.cap = cap; }
            if (arc !== undefined) { this.arc = arc; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The points the center line of the tube passes through, in order
         * @default undefined
         */
        path!: Base.Vector3[];
        /**
         * Radius of the tube, in scene units
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Number of sides around the tube; more is rounder
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 32;
        /**
         * Which ends are closed: 0 none, 1 the start, 2 the end, 3 both
         * @default 0
         * @minimum 0
         * @maximum 3
         * @step 1
         */
        cap = 0;
        /**
         * How much of the circumference is drawn, from 0 to 1; below 1 the tube is open along its
         * length
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        arc = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createExtrudedSahpe`: the profile to sweep, the path to sweep it
     * along, and how it scales, turns and closes on the way.
     */
    export class CreateExtrudedShapeDto {
        constructor(shape?: Base.Vector3[], path?: Base.Vector3[], scale?: number, rotation?: number, cap?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (path !== undefined) { this.path = path; }
            if (scale !== undefined) { this.scale = scale; }
            if (rotation !== undefined) { this.rotation = rotation; }
            if (cap !== undefined) { this.cap = cap; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The profile as points in the XY plane, swept along the path
         */
        shape!: Base.Vector3[];
        /**
         * The points the profile travels through, in order
         */
        path!: Base.Vector3[];
        /**
         * Factor the profile is scaled by along the path; 1 keeps its size
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
        /**
         * How far the profile turns around the path at each step, in radians; 0 keeps it straight
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        rotation = 0;
        /**
         * When true, the last point of the profile is joined back to its first
         * @default false
         */
        closeShape = false;
        /**
         * When true, the last point of the path is joined back to its first
         * @default false
         */
        closePath = false;
        /**
         * Which ends are closed: 0 none, 1 the start, 2 the end, 3 both
         * @default 0
         * @minimum 0
         * @maximum 3
         * @step 1
         */
        cap = 0;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createCylinder`: the height of a cylinder standing along Y, its
     * top and bottom diameters and how finely it is divided.
     */
    export class CreateCylinderDto {
        constructor(height?: number, diameterTop?: number, diameterBottom?: number, tessellation?: number, subdivisions?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (height !== undefined) { this.height = height; }
            if (diameterTop !== undefined) { this.diameterTop = diameterTop; }
            if (diameterBottom !== undefined) { this.diameterBottom = diameterBottom; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (subdivisions !== undefined) { this.subdivisions = subdivisions; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Full length along Y, in scene units
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Diameter of the top end, in scene units; 0 closes it to a point
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameterTop = 1;
        /**
         * Diameter of the bottom end, in scene units; 0 closes it to a point
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameterBottom = 1;
        /**
         * Number of sides around the cylinder; more is rounder
         * @default 64
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 64;
        /**
         * Number of rings along the height; more than 1 only matters for deforming or shading
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createLathe`: the profile to revolve around the Y axis, an outward
     * offset, how finely and how far it is revolved and whether the ends close.
     */
    export class CreateLatheDto {
        constructor(shape?: Base.Vector3[], radius?: number, tessellation?: number, arc?: number, closed?: boolean, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (shape !== undefined) { this.shape = shape; }
            if (radius !== undefined) { this.radius = radius; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (arc !== undefined) { this.arc = arc; }
            if (closed !== undefined) { this.closed = closed; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * The profile as points in the XY plane, X being the distance from the axis, revolved
         * around Y
         */
        shape!: Base.Vector3[];
        /**
         * Extra distance the profile is pushed away from the axis, in scene units
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Number of steps in a full turn; more is rounder
         * @default 64
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 64;
        /**
         * How much of a full turn is revolved, from 0 to 1; below 1 the shape is open
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        arc = 1;
        /**
         * When true and the arc is full, the seam is closed so the surface has no gap
         * @default true
         */
        closed = true;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
    /**
     * Feeds `babylon.meshBuilder.createGround`: the size of a flat ground in the XZ plane and how
     * many cells it is divided into.
     */
    export class CreateGroundDto {
        constructor(width?: number, height?: number, subdivisionsX?: number, subdivisionsY?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (subdivisionsX !== undefined) { this.subdivisionsX = subdivisionsX; }
            if (subdivisionsY !== undefined) { this.subdivisionsY = subdivisionsY; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Full size along X, in scene units
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width = 10;
        /**
         * Full size along Z, in scene units
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        height = 10;
        /**
         * Number of cells along X; more matters only for deforming or lighting
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisionsX = 1;
        /**
         * Number of cells along Z; more matters only for deforming or lighting
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisionsY = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }

    /**
     * Feeds `babylon.meshBuilder.createRectanglePlane` with the sizes of a flat rectangle in the XY
     * plane.
     */
    export class CreateRectanglePlaneDto {
        constructor(width?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Full size along X, in scene units
         * @default 1
         */
        width = 1;
        /**
         * Full size along Y, in scene units
         * @default 1
         */
        height = 1;
        /**
         * Which side of each face is drawn: the front, the back or both; single-sided meshes are
         * invisible from behind
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * When true, the mesh casts and receives shadows from the lights that have them enabled
         * @default true
         */
        enableShadows = true;
    }
}
