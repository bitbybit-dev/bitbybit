
import * as BABYLON from "@babylonjs/core";
import { Context } from "../context";
import { GeometryHelper } from "../geometry-helper";
import * as Inputs from "../inputs/inputs";
import { Base } from "../inputs/inputs";
import { Line } from "./line";

/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * When creating 2D points, z coordinate is simply set to 0 - [x, y, 0].
 */

export class Point {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper, private readonly line: Line) { }

    /**
     * Draws a single point
     * @param inputs Contains a point to be drawn
     * @returns Mesh that is being drawn by Babylon
     * @group draw
     * @shortname point
     * @drawable false
     * @ignore true
     */
    drawPoint(inputs: Inputs.Point.DrawPointDto): BABYLON.Mesh {
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

    /**
     * Draws multiple points
     * @param inputs Contains a point array to be drawn
     * @returns Mesh that is being drawn by Babylon
     * @group draw
     * @shortname points sync
     * @drawable false
     * @ignore true
     */
    drawPoints(inputs: Inputs.Point.DrawPointsDto): BABYLON.Mesh {
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

    /**
     * Draws multiple points async
     * @param inputs Contains a point array to be drawn
     * @returns Promise of a Mesh that will being drawn by Babylon
     * @group draw
     * @shortname points
     * @drawable false
     * @ignore true
     */
    drawPointsAsync(inputs: Inputs.Point.DrawPointsDto): Promise<BABYLON.Mesh> {
        return Promise.resolve(this.drawPoints(inputs));
    }

    /**
     * Transforms the single point
     * @param inputs Contains a point and the transformations to apply
     * @returns Transformed point
     * @group transforms
     * @shortname transform point
     * @drawable true
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): Inputs.Base.Point3 {
        const transformation = inputs.transformation;
        let transformedControlPoints = [inputs.point];
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return transformedControlPoints[0];
    }

    /**
     * Transforms multiple points
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     * @group transforms
     * @shortname transform points
     * @drawable true
     */
    transformPoints(inputs: Inputs.Point.TransformPointsDto): Inputs.Base.Point3[] {
        return this.geometryHelper.transformControlPoints(inputs.transformation, inputs.points);
    }

    /**
     * Transforms multiple points by multiple transformations
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     * @group transforms
     * @shortname transforms for points
     * @drawable true
     */
    transformsForPoints(inputs: Inputs.Point.TransformsForPointsDto): Inputs.Base.Point3[] {
        if (inputs.points.length !== inputs.transformation.length) {
            throw new Error("You must provide equal nr of points and transformations");
        }
        return inputs.points.map((pt, index) => {
            return this.geometryHelper.transformControlPoints(inputs.transformation[index], [pt])[0];
        });
    }

    /**
     * Measures the closest distance between a point and a collection of points
     * @param inputs Point from which to measure and points to measure the distance against
     * @returns Distance to closest point
     * @group extract
     * @shortname distance to closest pt
     * @drawable false
     */
    closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).distance;
    }

    /**
     * Finds the closest point index between a point and a collection of points. Caution, index is not 0 based, it starts with 1.
     * @param inputs Point from which to find the index in a collection of points
     * @returns Closest point index
     * @group extract
     * @shortname index of closest pt
     * @drawable false
     */
    closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).index;
    }

    /**
     * Finds the closest point in a collection
     * @param inputs Point and points collection to find the closest point in
     * @returns Closest point
     * @group extract
     * @shortname closest pt
     * @drawable true
     */
    closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): Inputs.Base.Point3 {
        return this.closestPointFromPointData(inputs).point as Inputs.Base.Point3;
    }

    /**
     * Finds the distance between two points
     * @param inputs Coordinates of start and end points
     * @returns Distance
     * @group measure
     * @shortname distance
     * @drawable false
     */
    distance(inputs: Inputs.Point.StartEndPointsDto): number {
        return this.context.verb.core.Vec.dist(inputs.startPoint, inputs.endPoint);
    }

    /**
     * Multiply point by a specified amount
     * @param inputs The point to be multiplied and the amount of points to create
     * @returns Distance
     * @group transforms
     * @shortname multiply point
     * @drawable true
     */
    multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): Inputs.Base.Point3[] {
        const points = [];
        for (let i = 0; i < inputs.amountOfPoints; i++) {
            points.push([inputs.point[0], inputs.point[1], inputs.point[2]]);
        }
        return points;
    }

    /**
     * Get x coordinate of the point
     * @param inputs The point
     * @returns X coordinate
     * @group get
     * @shortname x coord
     * @drawable false
     */
    getX(inputs: Inputs.Point.PointDto): number {
        return inputs.point[0];
    }

    /**
     * Get y coordinate of the point
     * @param inputs The point
     * @returns Y coordinate
     * @group get
     * @shortname y coord
     * @drawable false
     */
    getY(inputs: Inputs.Point.PointDto): number {
        return inputs.point[1];
    }

    /**
     * Get z coordinate of the point
     * @param inputs The point
     * @returns Z coordinate
     * @group get
     * @shortname z coord
     * @drawable false
     */
    getZ(inputs: Inputs.Point.PointDto): number {
        return inputs.point[2];
    }

    /**
     * Get average point of points
     * @param inputs The points
     * @returns point
     * @group extract
     * @shortname average point
     * @drawable true
     */
    averagePoint(inputs: Inputs.Point.PointsDto): Base.Point3 {
        const xVals = [];
        const yVals = [];
        const zVals = [];

        inputs.points.forEach(pt => {
            xVals.push(pt[0]);
            yVals.push(pt[1]);
            zVals.push(pt[2]);
        });

        return [
            xVals.reduce((p, c) => p + c, 0) / inputs.points.length,
            yVals.reduce((p, c) => p + c, 0) / inputs.points.length,
            zVals.reduce((p, c) => p + c, 0) / inputs.points.length,
        ];
    }

    /**
     * Creates the xyz point
     * @param inputs xyz information
     * @returns point 3d
     * @group create
     * @shortname point xyz
     * @drawable true
     */
    pointXYZ(inputs: Inputs.Point.PointXYZDto): Inputs.Base.Point3 {
        return [inputs.x, inputs.y, inputs.z];
    }

    /**
     * Creates the xy point
     * @param inputs xy information
     * @returns point 3d
     * @group create
     * @shortname point xy
     * @drawable false
     */
    pointXY(inputs: Inputs.Point.PointXYDto): Inputs.Base.Point2 {
        return [inputs.x, inputs.y];
    }

    /**
     * Creates the spiral out of multiple points
     * @param inputs Spiral information
     * @returns Specified number of points in the array along the spiral
     * @group create
     * @shortname spiral
     * @drawable true
     */
    spiral(inputs: Inputs.Point.SpiralDto): Inputs.Base.Point3[] {
        const phi = inputs.phi;
        const b = Math.log(phi) / (Math.PI / inputs.widening);
        const spiral = [];
        const step = inputs.radius / inputs.numberPoints;
        for (let i = 0; i < inputs.radius; i += step) {
            const th = Math.log(i / inputs.factor) / b;
            const x = i * Math.cos(th);
            const y = i * Math.sin(th);
            spiral.push([x ? x : 0, y ? y : 0, 0]);
        }
        return spiral;
    }

    /**
     * Creates a flat point grid on XY plane. This grid contains center points for hexagons of the given radius.
     * Be aware that we control only the nr of hexagons to be made and not the length and width of the grid.
     * @param inputs Information about hexagon and the grid
     * @returns Points in the array on the grid
     * @group create
     * @shortname hex grid
     * @drawable true
     */
    hexGrid(inputs: Inputs.Point.HexGridCentersDto): Inputs.Base.Point3[] {
        const xLength = Math.sqrt(Math.pow(inputs.radiusHexagon, 2) - Math.pow(inputs.radiusHexagon / 2, 2));
        const points = [];
        for (let ix = 0; ix < inputs.nrHexagonsX; ix++) {
            const coordX = ix * xLength * 2;
            for (let iy = 0; iy < inputs.nrHexagonsY; iy++) {
                const coordY = (inputs.radiusHexagon + inputs.radiusHexagon / 2) * iy;
                const adjustX = coordX + (iy % 2 === 0 ? 0 : xLength);
                points.push([adjustX, coordY, 0]);
            }
        }

        if (inputs.orientOnCenter) {
            const compensateX = points[points.length - 1][0] / 2;
            const compensateY = points[points.length - 1][1] / 2;
            points.forEach((p, index) => {
                points[index] = [p[0] - compensateX, p[1] - compensateY, 0];
            });
        }

        if (inputs.pointsOnGround) {
            points.forEach((p, index) => {
                points[index] = [p[0], 0, p[1]];
            });
        }

        return points;
    }

    private closestPointFromPointData(inputs: Inputs.Point.ClosestPointFromPointsDto): {
        index: number, point: Inputs.Base.Point3, distance: number
    } {
        let distance = Number.MAX_SAFE_INTEGER;
        let closestPointIndex: number;
        let point: Inputs.Base.Point3;
        for (let i = 0; i < inputs.points.length; i++) {
            const pt = inputs.points[i];
            const currentDist = this.context.verb.core.Vec.dist(inputs.point, pt);
            if (currentDist < distance) {
                distance = currentDist;
                closestPointIndex = i;
                point = pt as Inputs.Base.Point3;
            }
        }
        return { index: closestPointIndex + 1, distance, point };
    }

    private createPointSpheresMesh(
        meshName: string, positions: Base.Point3[], colors: string[], opacity: number, size: number, updatable: boolean): BABYLON.Mesh {

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
            const sphereOriginal = BABYLON.MeshBuilder.CreateSphere(`sphere${Math.random()}`, { diameter: size, segments: 6, updatable }, this.context.scene);
            sphereOriginal.material = ms.material;
            sphereOriginal.isVisible = false;
            ms.positions.forEach((pos, index) => {
                const instance = sphereOriginal.createInstance(`sphere-${index}-${Math.random()}`);
                instance.position = new BABYLON.Vector3(pos.position[0], pos.position[1], pos.position[2]);
                instance.metadata = { index: pos.index };
                instance.parent = pointsMesh;
                instance.isVisible = true;
            });
        });

        return pointsMesh;
    }

    private updatePointsInstances(mesh: BABYLON.Mesh, positions: any[]): void {

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
}
