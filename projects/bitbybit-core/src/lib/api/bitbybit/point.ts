import { Injectable } from '@angular/core';
import { Color3, Mesh, StandardMaterial, VertexBuffer, VertexData } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * When creating 2D points, z coordinate is simply set to 0 - [x, y, 0].
 * <div>
 *  <img src="../assets/images/blockly-images/point/point.svg" alt="Blockly Image"/>
 * </div>
 */
@Injectable()
export class Point {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Draws a single point
     * <div>
     *  <img src="../assets/images/blockly-images/point/drawPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#drawpoint
     * @param inputs Contains a point to be drawn
     * @returns Mesh that is being drawn by Babylon
     */
    drawPoint(inputs: Inputs.Point.DrawPointDto): Mesh {
        const vectorPoints = [inputs.point];
        const colour = Color3.FromHexString(inputs.colour);
        const { positions, colors } = this.setUpPositionsAndColours(vectorPoints, colour);
        if (inputs.pointMesh && inputs.updatable) {
            this.updatePoints(inputs.pointMesh, inputs.opacity, inputs.size, positions, colors);
        } else {
            inputs.pointMesh = this.createNewMesh(
                `poinsMesh${Math.random()}`, positions, colors, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointMesh;
    }

    /**
     * Draws multiple points
     * <div>
     *  <img src="../assets/images/blockly-images/point/drawPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#drawpoints
     * @param inputs Contains a point array to be drawn
     * @returns Mesh that is being drawn by Babylon
     */
    drawPoints(inputs: Inputs.Point.DrawPointsDto): Mesh {
        const vectorPoints = inputs.points;
        const colour = Color3.FromHexString(inputs.colour);
        const { positions, colors } = this.setUpPositionsAndColours(vectorPoints, colour);
        if (inputs.pointsMesh && inputs.updatable) {
            if (inputs.pointsMesh.getTotalVertices() === vectorPoints.length) {
                this.updatePoints(inputs.pointsMesh, inputs.opacity, inputs.size, positions, colors);
            } else {
                inputs.pointsMesh.dispose();
                inputs.pointsMesh = this.createNewMesh(
                    `pointsMesh${Math.random()}`, positions, colors, inputs.opacity, inputs.size, inputs.updatable
                );
            }
        } else {
            inputs.pointsMesh = this.createNewMesh(
                `pointsMesh${Math.random()}`, positions, colors, inputs.opacity, inputs.size, inputs.updatable
            );
        }
        return inputs.pointsMesh;
    }

    /**
     * Transforms the single point
     * <div>
     *  <img src="../assets/images/blockly-images/point/transformPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#transformpoint
     * @param inputs Contains a point and the transformations to apply
     * @returns Transformed point
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): number[] {
        const transformation = inputs.matrix;
        let transformedControlPoints = [inputs.point];
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return transformedControlPoints[0];
    }

    /**
     * Transforms multiple points
     * <div>
     *  <img src="../assets/images/blockly-images/point/transformPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#transformpoints
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     */
    transformPoints(inputs: Inputs.Point.TransformPointsDto): number[][] {
        return this.geometryHelper.transformControlPoints(inputs.matrix, inputs.points);
    }

    /**
     * Measures the closest distance between a point and a collection of points
     * <div>
     *  <img src="../assets/images/blockly-images/point/closestPointFromPointsDistance.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#closestpointfrompointsdistance
     * @param inputs Point from which to measure and points to measure the distance against
     * @returns Distance to closest point
     */
    closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).distance;
    }

    /**
     * Finds the closest point index between a point and a collection of points. Caution, index is not 0 based, it starts with 1.
     * <div>
     *  <img src="../assets/images/blockly-images/point/closestPointFromPointsIndex.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#closestpointfrompointsindex
     * @param inputs Point from which to find the index in a collection of points
     * @returns Closest point index
     */
    closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number {
        return this.closestPointFromPointData(inputs).index;
    }

    /**
     * Finds the closest point in a collection
     * <div>
     *  <img src="../assets/images/blockly-images/point/closestPointFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#closestpointfrompoints
     * @param inputs Point and points collection to find the closest point in
     * @returns Closest point
     */
    closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): number[] {
        return this.closestPointFromPointData(inputs).point;
    }

    /**
     * Finds the distance between two points
     * <div>
     *  <img src="../assets/images/blockly-images/point/distance.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#distance
     * @param inputs Coordinates of start and end points
     * @returns Distance
     */
    distance(inputs: Inputs.Point.StartEndPointsDto): number {
        return this.context.verb.core.Vec.dist(inputs.startPoint, inputs.endPoint);
    }

    /**
     * Multiply point by a specified amount
     * <div>
     *  <img src="../assets/images/blockly-images/point/multiplyPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#multiplypoint
     * @param inputs The point to be multiplied and the amount of points to create
     * @returns Distance
     */
    multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): number[][] {
        const points = [];
        for (let i = 0; i < inputs.amountOfPoints; i++) {
            points.push([inputs.point[0], inputs.point[1], inputs.point[2]]);
        }
        return points;
    }

    /**
     * Get x coordinate of the point
     * <div>
     *  <img src="../assets/images/blockly-images/point/getX.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#getx
     * @param inputs The point
     * @returns X coordinate
     */
    getX(inputs: Inputs.Point.PointDto): number {
        return inputs.point[0];
    }

    /**
     * Get y coordinate of the point
     * <div>
     *  <img src="../assets/images/blockly-images/point/getY.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#gety
     * @param inputs The point
     * @returns Y coordinate
     */
    getY(inputs: Inputs.Point.PointDto): number {
        return inputs.point[1];
    }

    /**
     * Get z coordinate of the point
     * <div>
     *  <img src="../assets/images/blockly-images/point/getZ.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#getz
     * @param inputs The point
     * @returns Z coordinate
     */
    getZ(inputs: Inputs.Point.PointDto): number {
        return inputs.point[2];
    }

    /**
     * Creates the spiral out of multiple points
     * <div>
     *  <img src="../assets/images/blockly-images/point/spiral.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#spiral
     * @param inputs Spiral information
     * @returns Specified number of points in the array along the spiral
     */
    spiral(inputs: Inputs.Point.SpiralDto): number[][] {
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

    private closestPointFromPointData(inputs: Inputs.Point.ClosestPointFromPointsDto): {
        index: number, point: number[], distance: number
    } {
        let distance = Number.MAX_SAFE_INTEGER;
        let closestPointIndex: number;
        let point: number[];
        for (let i = 0; i < inputs.points.length; i++) {
            const pt = inputs.points[i];
            const currentDist = this.context.verb.core.Vec.dist(inputs.point, pt);
            if (currentDist < distance) {
                distance = currentDist;
                closestPointIndex = i;
                point = pt;
            }
        }
        return { index: closestPointIndex + 1, distance, point };
    }

    private createNewMesh(
        meshName: string, positions: number[], colors: number[], opacity: number, size: number, updatable: boolean): Mesh {

        const vertexData = new VertexData();

        vertexData.positions = positions;
        vertexData.colors = colors;

        const pointsMesh = new Mesh(meshName, this.context.scene);
        vertexData.applyToMesh(pointsMesh, updatable);

        const mat = new StandardMaterial(`mat${Math.random()}`, this.context.scene);

        mat.emissiveColor = new Color3(1, 1, 1);
        mat.disableLighting = true;
        mat.pointsCloud = true;
        mat.alpha = opacity;
        mat.pointSize = size;

        pointsMesh.material = mat;

        return pointsMesh;
    }

    private updatePoints(mesh: Mesh, opacity: number, size: number, positions: any[], colors: any[]): void {
        mesh.updateVerticesData(VertexBuffer.PositionKind, positions);
        mesh.updateVerticesData(VertexBuffer.ColorKind, colors);
        mesh.material.alpha = opacity;
        mesh.material.pointSize = size;
    }

    private setUpPositionsAndColours(vectorPoints: number[][], colour: Color3): {positions, colors} {
        const positions = [];
        const colors = [];

        vectorPoints.forEach(p => {
            positions.push(...p);
            colors.push(colour.r, colour.g, colour.b, 1);
        });
        return { positions, colors };
    }
}
