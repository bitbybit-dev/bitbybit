/* eslint-disable @typescript-eslint/no-namespace */
import { BabylonMesh } from "./babylon-mesh-inputs";
import { Base } from "./base-inputs";

// tslint:disable-next-line: no-namespace
export namespace BabylonMeshBuilder {

    export class CreateBoxDto {
        constructor(width?: number, depth?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (width !== undefined) { this.width = width; }
            if (depth !== undefined) { this.depth = depth; }
            if (height !== undefined) { this.height = height; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Width of the box
         * @default 1
         */
        width = 1;
        /**
        * Depth of the box
        * @default 1
        */
        depth = 1;
        /**
       * Height of the box
       * @default 1
       */
        height = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

    export class CreateCubeDto {
        constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (size !== undefined) { this.size = size; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Size of the cube
         * @default 1
         */
        size = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
    export class CreateSquarePlaneDto {
        constructor(size?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (size !== undefined) { this.size = size; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Size of the square plane
         * @default 1
         */
        size = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
    export class CreateSphereDto {
        constructor(diameter?: number, segments?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (diameter !== undefined) { this.diameter = diameter; }
            if (segments !== undefined) { this.segments = segments; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Diameter of the sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameter = 1;
        /**
         * Segments of the sphere
         * @default 32
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        segments = 32;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Radius of the ico sphere
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Radius X of the ico sphere
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusX = 0;
        /**
         * Radius Y of the ico sphere
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusY = 0;
        /**
         * Radius Z of the ico sphere
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusZ = 0;
        /**
         * Flat of the ico sphere
         * @default false
         */
        flat = false;
        /**
         * Subdivisions of the ico sphere
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 4;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

    export class CreateDiscDto {
        constructor(radius?: number, tessellation?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (radius !== undefined) { this.radius = radius; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Radius of the disc
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Tessellation of the disc
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 32;
        /**
         * Arc between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        arc: number;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Path array of the ribbon
         */
        pathArray: Base.Vector3[][];
        /**
         * Close array of the ribbon
         * @default false
         */
        closeArray = false;
        /**
         * Close path of the ribbon
         * @default false
         */
        closePath = false;
        /**
         * Offset of the ribbon
         * @default 0
         */
        offset = 0;
        /**
         * Updateable
         * @default false
         */
        updatable = false;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
    export class CreateTorusDto {
        constructor(diameter?: number, thickness?: number, tessellation?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (diameter !== undefined) { this.diameter = diameter; }
            if (thickness !== undefined) { this.thickness = thickness; }
            if (tessellation !== undefined) { this.tessellation = tessellation; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Diameter of the torus
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameter = 1;
        /**
         * Thickness of the torus
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        thickness = 0.5;
        /**
         * Tessellation of the torus
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 32;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

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
         * Radius of the torus knot
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 2;
        /**
         * Tube of the torus knot
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        tube = 0.5;
        /**
         * Radial segments of the torus knot
         * @default 128
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        radialSegments = 128;
        /**
         * Tubular segments of the torus knot
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tubularSegments = 32;
        /**
         * P of the torus knot
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        p = 2;
        /**
         * Q of the torus knot
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        q = 3;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

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
         * Shape of the polygon
         */
        shape: Base.Vector3[];
        /**
         * Holes of the polygon
         * @optional true
         */
        holes?: Base.Vector3[][];
        /**
         * Depth of the polygon
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        depth = 0;
        /**
         * Smoothing threshold of the polygon
         * @default 0.01
         * @minimum 0
         * @maximum 1
         * @step 0.01
         */
        smoothingThreshold = 0.01;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Wrap of the polygon
         * @default false
         */
        wrap = false;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Shape of the extrude
         */
        shape: Base.Vector3[];
        /**
         * Holes of the extrude
         * @optional true
         */
        holes?: Base.Vector3[][];
        /**
         * Depth of the extrude
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        depth = 1;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Wrap of the extrude
         * @default false
         */
        wrap = false;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Size of the polyhedron
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Type of the polyhedron
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        type = 0;
        /**
         * Size X of the polyhedron
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeX = 0;
        /**
         * Size Y of the polyhedron
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeY = 0;
        /**
         * Size Z of the polyhedron
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeZ = 0;
        /**
         * Custom polyhedron
         * @optional true
         */
        custom?: number[];
        /**
         * Flat polyhedron
         * @default false
         */
        flat = false;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * M of the geodesic
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        m = 4;
        /**
         * N of the geodesic
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        n = 4;
        /**
         * Size of the geodesic
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Size X of the geodesic
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeX = 0;
        /**
         * Size Y of the geodesic
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeY = 0;
        /**
         * Size Z of the geodesic
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeZ = 0;
        /**
         * Flat
         * @default false
         */
        flat = false;
        /**
         * Subdivisions of the geodesic
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 4;
        /**
         * Side orientation of the mesh
         * @default frontside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.frontside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

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
         * Orientation of the capsule
         */
        orientation: Base.Vector3;
        /**
         * Subdivisions of the capsule
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 2;
        /**
         * Tessellation of the capsule
         * @default 16
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 16;
        /**
         * Height of the capsule
         * @default 2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 2;
        /**
         * Radius of the capsule
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Cap subdivisions of the capsule
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        capSubdivisions = 6;
        /**
         * Radius top of the capsule
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusTop = 0.5;
        /**
         * Radius bottom of the capsule
         * @default 0.5
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusBottom = 0.5;
        /**
         * Top cap subdivisions of the capsule
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        topCapSubdivisions = 6;
        /**
         * Bottom cap subdivisions of the capsule
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        bottomCapSubdivisions = 6;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * M of the goldberg
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        m = 4;
        /**
         * N of the goldberg
         * @default 4
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        n = 4;
        /**
         * Size of the goldberg
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 1;
        /**
         * Size X of the goldberg
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeX = 0;
        /**
         * Size Y of the goldberg
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeY = 0;
        /**
         * Size Z of the goldberg
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        sizeZ = 0;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Path of the tube
         * @default undefined
         */
        path: Base.Vector3[];
        /**
         * Radius of the tube
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Tessellation of the tube
         * @default 32
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 32;
        /**
         * Cap of the tube
         * @default 0
         * @minimum 0
         * @maximum 3
         * @step 1
         */
        cap = 0;
        /**
         * Arc of the tube
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        arc = 1;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Shape of the extrude
         */
        shape: Base.Vector3[];
        /**
         * Path of the extrude
         */
        path: Base.Vector3[];
        /**
         * Scale of the extrude
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        scale = 1;
        /**
         * Rotation of the extrude
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        rotation = 0;
        /**
         * Close shape of the extrude
         * @default false
         */
        closeShape = false;
        /**
         * Close path of the extrude
         * @default false
         */
        closePath = false;
        /**
         * Cap of the extrude
         * @default 0
         * @minimum 0
         * @maximum 3
         * @step 1
         */
        cap = 0;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Height of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        height = 1;
        /**
         * Diameter top of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameterTop = 1;
        /**
         * Diameter bottom of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        diameterBottom = 1;
        /**
         * Tessellation of the cylinder
         * @default 64
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 64;
        /**
         * Subdivisions of the cylinder
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisions = 1;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Shape of the lathe
         */
        shape: Base.Vector3[];
        /**
         * Radius of the lathe
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 1;
        /**
         * Tessellation of the lathe
         * @default 64
         * @minimum 3
         * @maximum Infinity
         * @step 1
         */
        tessellation = 64;
        /**
         * Arc of the lathe
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        arc = 1;
        /**
         * Should lathe be closed
         * @default true
         */
        closed = true;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
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
         * Width of the ground
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        width = 10;
        /**
         * Height of the ground
         * @default 10
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        height = 10;
        /**
         * Subdivisions X of the ground
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisionsX = 1;
        /**
         * Subdivisions Y of the ground
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        subdivisionsY = 1;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }

    export class CreateRectanglePlaneDto {
        constructor(width?: number, height?: number, sideOrientation?: BabylonMesh.sideOrientationEnum, enableShadows?: boolean) {
            if (width !== undefined) { this.width = width; }
            if (height !== undefined) { this.height = height; }
            if (sideOrientation !== undefined) { this.sideOrientation = sideOrientation; }
            if (enableShadows !== undefined) { this.enableShadows = enableShadows; }
        }
        /**
         * Width of the rectangle plane
         * @default 1
         */
        width = 1;
        /**
         * Height of the rectangle plane
         * @default 1
         */
        height = 1;
        /**
         * Side orientation of the mesh
         * @default doubleside
         */
        sideOrientation = BabylonMesh.sideOrientationEnum.doubleside;
        /**
         * Enables shadows for the mesh
         * @default true
         */
        enableShadows = true;
    }
}
