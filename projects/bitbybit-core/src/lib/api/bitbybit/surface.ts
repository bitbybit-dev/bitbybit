import { Injectable } from '@angular/core';
import { Color3, Mesh, StandardMaterial, VertexData } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
import { BaseTypes } from './base-types';
import { SurfaceConical } from './surface-conical';
import { SurfaceCylindrical } from './surface-cylindrical';
import { SurfaceExtrusion } from './surface-extrusion';
import { SurfaceRevolved } from './surface-revolved';
import { SurfaceSpherical } from './surface-spherical';
import { SurfaceSweep } from './surface-sweep';

/**
 * Contains various functions for Nurbs surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class Surface {

    constructor(
        public readonly cone: SurfaceConical,
        public readonly cylinder: SurfaceCylindrical,
        public readonly extrusion: SurfaceExtrusion,
        public readonly sphere: SurfaceSpherical,
        public readonly revolved: SurfaceRevolved,
        public readonly sweep: SurfaceSweep,
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper
    ) { }

    /**
     * Draws a single surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#drawsurface
     * @param inputs Contains a surface and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurface(inputs: Inputs.Surface.DrawSurfaceDto): Mesh {
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

        return this.createOrUpdateSurfaceMesh(
            meshDataConverted,
            inputs.surfaceMesh,
            inputs.updatable,
            inputs.opacity,
            inputs.colour
        );
    }

    /**
     * Draws multiple surfaces
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurfaces.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#drawsurfaces
     * @param inputs Contains the Nurbs surfaces and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfaces(inputs: Inputs.Surface.DrawSurfacesDto): Mesh {
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

        return this.createOrUpdateSurfaceMesh(
            meshDataConverted,
            inputs.surfacesMesh,
            inputs.updatable,
            inputs.opacity,
            inputs.colour
        );
    }

    /**
     * Draws multiple surfaces with multiple colours. Number of colours has to be equal to number of surfaces
     * <div>
     *  <img src="../assets/images/blockly-images/surface/drawSurfacesMultiColour.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#drawsurfacesmulticolour
     * @param inputs Contains the Nurbs surfaces, colours and other information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfacesMultiColour(inputs: Inputs.Surface.DrawSurfacesColoursDto): Mesh {
        if (inputs.surfacesMesh && inputs.updatable) {
            inputs.surfacesMesh.getChildren().forEach(srf => srf.dispose());
        }

        inputs.surfacesMesh = new Mesh(`ColouredSurfaces${Math.random()}`, this.context.scene);
        inputs.surfaces.forEach((surface, index) => {
            const srf = this.drawSurface({
                surface,
                colour: inputs.colours[index],
                updatable: inputs.updatable,
                opacity: inputs.opacity,
            });
            inputs.surfacesMesh.addChild(srf);
        });

        return inputs.surfacesMesh;
    }

    /**
     * Gets the boundary edge Nurbs curves of the surface in a list
     * <div>
     *  <img src="../assets/images/blockly-images/surface/boundaries.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#boundaries
     * @param inputs Nurbs surface
     * @returns Array of curves
     */
    boundaries(inputs: Inputs.Surface.SurfaceDto): any[] {
        return inputs.surface.boundaries();
    }

    /**
     * Creates the surface by providing 4 points as corners
     * <div>
     *  <img src="../assets/images/blockly-images/surface/createSurfaceByCorners.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#createsurfacebycorners
     * @param inputs 4 points
     * @returns Nurbs surface
     */
    createSurfaceByCorners(inputs: Inputs.Surface.CornersDto): any {
        return this.context.verb.geom.NurbsSurface.byCorners(inputs.point1, inputs.point2, inputs.point3, inputs.point4);
    }

    /**
     * Creates the Nurbs surface by providing uv knots, uv degrees, points and weights
     * <div>
     *  <img src="../assets/images/blockly-images/surface/createSurfaceByKnotsControlPointsWeights.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#createsurfacebyknotscontrolpointsweights
     * @param inputs Surface creation information
     * @returns Nurbs surface
     */
    createSurfaceByKnotsControlPointsWeights(inputs: Inputs.Surface.KnotsControlPointsWeightsDto): any {
        return this.context.verb.geom.NurbsSurface.byKnotsControlPointsWeights(
            inputs.degreeU,
            inputs.degreeV,
            inputs.knotsU,
            inputs.knotsV,
            inputs.points,
            inputs.weights
        );
    }

    /**
     * Creates the Nurbs surface by lofting curves
     * <div>
     *  <img src="../assets/images/blockly-images/surface/createSurfaceByLoftingCurves.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#createsurfacebyloftingcurves
     * @param inputs Curves to loft through
     * @returns Nurbs surface
     */
    createSurfaceByLoftingCurves(inputs: Inputs.Surface.LoftCurvesDto): any {
        return this.context.verb.geom.NurbsSurface.byLoftingCurves(inputs.curves, inputs.degreeV);
    }

    /**
     * Clone the Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/clone.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#clone
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    clone(inputs: Inputs.Surface.SurfaceDto): any {
        return inputs.surface.clone();
    }

    /**
     * Finds the closest parameter on the surface from the point
     * <div>
     *  <img src="../assets/images/blockly-images/surface/closestParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#closestparam
     * @param inputs Nurbs surface with a point
     * @returns UV parameters
     */
    closestParam(inputs: Inputs.Surface.SurfaceParamDto): BaseTypes.UVDto {
        return inputs.surface.closestParam(inputs.point);
    }

    /**
     * Finds the closest point on the surface from the point
     * <div>
     *  <img src="../assets/images/blockly-images/surface/closestPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#closestpoint
     * @param inputs Nurbs surface with a point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Surface.SurfaceParamDto): number[] {
        return inputs.surface.closestPoint(inputs.point);
    }

    /**
     * Gets the control points on the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/controlPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#controlpoints
     * @param inputs Nurbs surface
     * @returns Two dimensional array of points
     */
    controlPoints(inputs: Inputs.Surface.SurfaceDto): number[][][] {
        return inputs.surface.controlPoints();
    }

    /**
     * Gets the U degree of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/degreeU.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#degreeu
     * @param inputs Nurbs surface
     * @returns U degree
     */
    degreeU(inputs: Inputs.Surface.SurfaceDto): number {
        return inputs.surface.degreeU();
    }

    /**
     * Gets the V degree of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/degreeV.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#degreev
     * @param inputs Nurbs surface
     * @returns V degree
     */
    degreeV(inputs: Inputs.Surface.SurfaceDto): number {
        return inputs.surface.degreeV();
    }

    /**
     * Gets the derivatives of the surface at specified uv coordinate
     * <div>
     *  <img src="../assets/images/blockly-images/surface/derivatives.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#derivatives
     * @param inputs Nurbs surface
     * @returns Two dimensional array of vectors
     */
    derivatives(inputs: Inputs.Surface.DerivativesDto): number[][][] {
        return inputs.surface.derivatives(inputs.u, inputs.v, inputs.numDerivatives);
    }

    /**
     * Gets the U domain of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/domainU.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#domainu
     * @param inputs Nurbs surface
     * @returns U domain as interval
     */
    domainU(inputs: Inputs.Surface.SurfaceDto): BaseTypes.IntervalDto {
        return inputs.surface.domainU();
    }

    /**
     * Gets the V domain of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/domainV.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#domainv
     * @param inputs Nurbs surface
     * @returns V domain as interval
     */
    domainV(inputs: Inputs.Surface.SurfaceDto): BaseTypes.IntervalDto {
        return inputs.surface.domainV();
    }

    /**
     * Gets the Nurbs isocurve on the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/isocurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#isocurve
     * @param inputs Nurbs surface
     * @returns Nurbs curve
     */
    isocurve(inputs: Inputs.Surface.SurfaceParameterDto): any {
        return inputs.surface.isocurve(inputs.parameter, inputs.useV);
    }

    /**
     * Subdivides surface into preferred number of isocurves
     * <div>
     *  <img src="../assets/images/blockly-images/surface/isocurvesSubdivision.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#isocurvesubdivision
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesSubdivision(inputs: Inputs.Surface.IsocurveSubdivisionDto): any[] {
        const step = (0.999999 / inputs.isocurveSegments);
        const params = this.context.verb.core.Vec.span(0.0000001, 0.9999999, step);
        if (!inputs.includeLast) {
            params.pop();
        }
        if (!inputs.includeFirst) {
            params.shift();
        }
        return params.map(parameter => {
            return inputs.surface.isocurve(parameter, inputs.useV);
        });
    }

    /**
     * Subdivides surface into isocurves on specified array of parameters
     * <div>
     *  <img src="../assets/images/blockly-images/surface/isocurvesAtParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#isocurvesatparams
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesAtParams(inputs: Inputs.Surface.IsocurvesParametersDto): any[] {
        return inputs.parameters.map(parameter => {
            return inputs.surface.isocurve(parameter, inputs.useV);
        });
    }

    /**
     * Gets the U knots of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/knotsU.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#knotsu
     * @param inputs Nurbs surface
     * @returns Knots on u direction
     */
    knotsU(inputs: Inputs.Surface.SurfaceDto): number[] {
        return inputs.surface.knotsU();
    }

    /**
     * Gets the V knots of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/knotsV.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#knotsv
     * @param inputs Nurbs surface
     * @returns Knots on v direction
     */
    knotsV(inputs: Inputs.Surface.SurfaceDto): number[] {
        return inputs.surface.knotsV();
    }

    /**
     * Gets the normal on the surface at uv coordinate
     * <div>
     *  <img src="../assets/images/blockly-images/surface/normal.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#normal
     * @param inputs Nurbs surface
     * @returns Normal vector
     */
    normal(inputs: Inputs.Surface.SurfaceLocationDto): number[] {
        return inputs.surface.normal(inputs.u, inputs.v);
    }

    /**
     * Gets the point on the surface at uv coordinate
     * <div>
     *  <img src="../assets/images/blockly-images/surface/point.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#point
     * @param inputs Nurbs surface
     * @returns Point
     */
    point(inputs: Inputs.Surface.SurfaceLocationDto): number[] {
        return inputs.surface.point(inputs.u, inputs.v);
    }

    /**
     * Reverse the Nurbs surface. This will reverse the UV origin and isocurve directions
     * <div>
     *  <img src="../assets/images/blockly-images/surface/reverse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#reverse
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    reverse(inputs: Inputs.Surface.SurfaceDto): any {
        return inputs.surface.reverse();
    }

    /**
     * Splits the Nurbs surface in two halfs.
     * <div>
     *  <img src="../assets/images/blockly-images/surface/split.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#split
     * @param inputs Nurbs surface
     * @returns Two Nurbs surfaces
     */
    split(inputs: Inputs.Surface.SurfaceParameterDto): any[] {
        return inputs.surface.split(inputs.parameter, inputs.useV);
    }

    /**
     * Transforms the Nurbs surface with a given list of transformations.
     * <div>
     *  <img src="../assets/images/blockly-images/surface/transformSurface.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#transformsurface
     * @param inputs Nurbs surface with transforms
     * @returns Nurbs surface
     */
    transformSurface(inputs: Inputs.Surface.SurfaceTransformDto): any {
        const points = inputs.surface.controlPoints();
        const transformation = inputs.matrix;
        const twoDimensionalPoints = [];
        points.forEach(ptCollection => {
            let transformedControlPoints = ptCollection;
            transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
            twoDimensionalPoints.push(transformedControlPoints);
        });
        return this.context.verb.geom.NurbsSurface.byKnotsControlPointsWeights(
            inputs.surface.degreeU(),
            inputs.surface.degreeV(),
            inputs.surface.knotsU(),
            inputs.surface.knotsV(),
            twoDimensionalPoints,
            inputs.surface.weights());
    }

    /**
     * Gets the weights of the surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/weights.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_.surface.html#weights
     * @param inputs Nurbs surface
     * @returns Two dimensional array of weights
     */
    weights(inputs: Inputs.Surface.SurfaceDto): number[][] {
        return inputs.surface.weights();
    }

    private createOrUpdateSurfaceMesh(
        meshDataConverted: { positions: any[]; indices: any[]; normals: any[]; },
        mesh: Mesh, updatable: boolean, opacity: number, colour: string
    ): Mesh {
        const createMesh = () => {
            const vertexData = new VertexData();
            vertexData.positions = meshDataConverted.positions;
            vertexData.indices = meshDataConverted.indices;
            vertexData.normals = meshDataConverted.normals;
            vertexData.applyToMesh(mesh, updatable);
        };

        if (mesh && updatable) {
            mesh.dispose();
            createMesh();
        } else {
            mesh = new Mesh(`surface${Math.random()}`, this.context.scene);
            createMesh();
            mesh.material = new StandardMaterial(`surfaceMaterial${Math.random()}`, this.context.scene);
        }

        const material = mesh.material as StandardMaterial;
        material.alpha = opacity;
        material.diffuseColor = Color3.FromHexString(colour);
        material.specularColor = new Color3(1, 1, 1);
        material.ambientColor = new Color3(1, 1, 1);
        material.backFaceCulling = false;
        mesh.isPickable = false;
        return mesh;
    }

    private parseFaces(
        faceIndices: any,
        meshData: any,
        meshDataConverted: { positions: number[]; indices: number[]; normals: number[]; },
        countIndices: number): number {
        faceIndices.forEach((x) => {
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
