import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { SimplebarAngularModule } from 'simplebar-angular';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { BitByBitBase } from '../api/bitbybit';
import { Scene } from '../api/categories/scene';
import { Context } from '../api/context';
import { Transforms } from '../api/categories/transforms';
import { Vector } from '../api/categories/vector';

const monacoConfig: NgxMonacoEditorConfig = {
    onMonacoLoad: () => {
        window.monaco.editor.defineTheme('my-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
            ],
            colors: {
                'editor.background': '#1a1c1f'
            }
        });

        const uri = new window.monaco.Uri();

        let libSource = `
        declare namespace Bit {
            declare class Context {
                scene: Scene;
                blocklyWorkspace: Workspace;
                constructor();
            }

            declare class Scene {
                private readonly context;
                constructor(context: Context);
                /**
                 * Changes the scene background colour for 3D space
                 * @param inputs Describes the colour of the scene background
                 */
                backgroundColour(inputs: SceneBackgroundColourDto): void;
                /**
                 * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
                 * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
                 */
                drawGridMesh(inputs: SceneDrawGridMeshDto): Mesh;
                /**
                 * Clears all of the drawn objects in the 3D scene
                 */
                clearAllDrawn(): void;
            }
            interface SceneBackgroundColourDto {
                colour: string;
            }
            interface SceneDrawGridMeshDto {
                width: number;
                height: number;
                subdivisions: number;
                majorUnitFrequency: number;
                minorUnitVisibility: number;
                gridRatio: number;
                opacity: number;
                backFaceCulling: boolean;
                mainColor: string;
                secondaryColor: string;
            }
            interface IntervalDto {
                min: number;
                max: number;
            }
            interface UVDto {
                u: number;
                v: number;
            }
            declare class Transforms {
                /**
                 * Creates a rotation transformations around the center and an axis
                 * @param inputs Rotation around center with an axis information
                 */
                rotationCenterAxis(inputs: RotationCenterAxisDto): number[][];
                /**
                 * Creates a rotation transformations around the center and an X axis
                 * @param inputs Rotation around center with an X axis information
                 */
                rotationCenterX(inputs: RotationCenterDto): number[][];
                /**
                 * Creates a rotation transformations around the center and an Y axis
                 * @param inputs Rotation around center with an Y axis information
                 */
                rotationCenterY(inputs: RotationCenterDto): number[][];
                /**
                 * Creates a rotation transformations around the center and an Z axis
                 * @param inputs Rotation around center with an Z axis information
                 */
                rotationCenterZ(inputs: RotationCenterDto): number[][];
                /**
                 * Creates a rotation transformations with yaw pitch and roll
                 * @param inputs Yaw pitch roll rotation information
                 */
                rotationCenterYawPitchRoll(inputs: RotationCenterYawPitchRollDto): number[][];
                /**
                 * Scale transformation around center and xyz directions
                 * @param inputs Scale center xyz trnansformation
                 */
                scaleCenterXYZ(inputs: ScaleCenterXYZDto): number[][];
                /**
                 * Creates the scale transformation in x, y and z directions
                 * @param inputs Scale XYZ number array information
                 */
                scaleXYZ(inputs: ScaleXYZDto): number[];
                /**
                 * Creates uniform scale transformation
                 * @param inputs Scale Dto
                 */
                uniformScale(inputs: UniformScaleDto): number[];
                /**
                 * Creates uniform scale transformation from the center
                 * @param inputs Scale Dto with center point information
                 */
                uniformScaleFromCenter(inputs: UniformScaleFromCenterDto): number[][];
                /**
                 * Creates the translation transformation
                 * @param inputs Translation information
                 */
                translationXYZ(inputs: TranslationXYZDto): number[];
            }
            interface RotationCenterAxisDto {
                angle: number;
                axis: number[];
                center: number[];
            }
            interface RotationCenterDto {
                angle: number;
                center: number[];
            }
            interface RotationCenterYawPitchRollDto {
                yaw: number;
                pitch: number;
                roll: number;
                center: number[];
            }
            interface ScaleXYZDto {
                scaleXyz: number[];
            }
            interface ScaleCenterXYZDto {
                center: number[];
                scaleXyz: number[];
            }
            interface UniformScaleDto {
                scale: number;
            }
            interface UniformScaleFromCenterDto {
                scale: number;
                center: number[];
            }
            interface TranslationXYZDto {
                translation: number[];
            }
            declare class Vector {
                private readonly context;
                constructor(context: Context);
                /**
                 * Measures the angle between two vectors in degrees
                 * @param inputs Contains two vectors represented as number arrays
                 */
                angle(inputs: TwoVectorsDto): number;
                /**
                 * Measures the normalized 2d angle between two vectors in degrees
                 * @param inputs Contains two vectors represented as number arrays
                 */
                angleBetweenNormalized2d(inputs: TwoVectorsDto): number;
                /**
                 * Measures a positive angle between two vectors given the reference vector in degrees
                 * @param inputs Contains information of two vectors and a reference vector
                 */
                positiveAngleBetween(inputs: TwoVectorsReferenceDto): number;
                /**
                 * Adds all vectors together
                 * @param inputs Vectors to be added
                 */
                addAll(inputs: VectorsDto): number[];
                /**
                 * Adds two vectors together
                 * @param inputs Two vectors to be added
                 */
                add(inputs: TwoVectorsDto): number[];
                /**
                 * Checks if the boolean array is true or false
                 * @param inputs Vectors to be checked
                 */
                all(inputs: VectorBoolDto): boolean;
                /**
                 * Cross two vectors
                 * @param inputs Two vectors to be crossed
                 */
                cross(inputs: TwoVectorsDto): number[];
                /**
                 * Squared distance between two vectors
                 * @param inputs Two vectors
                 */
                distSquared(inputs: TwoVectorsDto): number;
                /**
                 * Distance between two vectors
                 * @param inputs Two vectors
                 */
                dist(inputs: TwoVectorsDto): number;
                /**
                 * Divide the vector by a scalar value
                 * @param inputs Contains vector and a scalar
                 */
                div(inputs: VectorScalarDto): number[];
                /**
                 * Computes the domain between minimum and maximum values of the vector
                 * @param inputs Vector information
                 */
                domain(inputs: VectorDto): number;
                /**
                 * Dot product between two vectors
                 * @param inputs Two vectors
                 */
                dot(inputs: TwoVectorsDto): number;
                /**
                 * Checks if vector is finite for each number and returns a boolean array
                 * @param inputs Vector with possibly infinite values
                 */
                finite(inputs: VectorDto): boolean[];
                /**
                 * Checks if the vector is zero length
                 * @param inputs Vector to be checked
                 */
                isZero(inputs: VectorDto): boolean;
                /**
                 * Finds in between vector between two vectors by providing a fracture
                 * @param inputs Information for finding vector between two vectors using a fraction
                 */
                lerp(inputs: FractionTwoVectorsDto): number[];
                /**
                 * Finds the maximum value in the vector
                 * @param inputs Vector to be checked
                 */
                max(inputs: VectorDto): number;
                /**
                 * Finds the minimum value in the vector
                 * @param inputs Vector to be checked
                 */
                min(inputs: VectorDto): number;
                /**
                 * Multiple vector with the scalar
                 * @param inputs Vector with a scalar
                 */
                mul(inputs: VectorScalarDto): number[];
                /**
                 * Negates the vector
                 * @param inputs Vector to negate
                 */
                neg(inputs: VectorDto): number[];
                /**
                 * Compute squared norm
                 * @param inputs Vector for squared norm
                 */
                normSquared(inputs: VectorDto): number;
                /**
                 * Norm of the vector
                 * @param inputs Vector to compute the norm
                 */
                norm(inputs: VectorDto): number;
                /**
                 * Normalize the vector
                 * @param inputs Vector to normalize
                 */
                normalized(inputs: VectorDto): number;
                /**
                 * Finds a point coordinates on the given distance ray that spans between the point along the direction vector
                 * @param inputs Provide a point, vector and a distance for finding a point
                 */
                onRay(inputs: RayPointDto): number[];
                /**
                 * Creates a vector of integers between 0 and maximum ceiling integer
                 * @param inputs Max value for the range
                 */
                range(inputs: RangeMaxDto): number[];
                /**
                 * Computes signed angle between two vectors and a reference. This will always return a smaller angle between two possible angles.
                 * @param inputs Contains information of two vectors and a reference vector
                 */
                signedAngleBetween(inputs: TwoVectorsReferenceDto): number;
                /**
                 * Creates a vector that contains numbers spanning between minimum and maximum values at a given step
                 * @param inputs Span information containing min, max and step values
                 */
                span(inputs: SpanDto): number[];
                /**
                 * Subtract two vectors
                 * @param inputs Two vectors
                 */
                sub(inputs: TwoVectorsDto): number[];
                /**
                 * Sums the values of the vector
                 * @param inputs Vector to sum
                 */
                sum(inputs: VectorDto): number;
            }
            interface RangeMaxDto {
                max: number;
            }
            interface SpanDto {
                min: number;
                max: number;
                step: number;
            }
            interface RayPointDto {
                vector: number[];
                point: number[];
                distance: number;
            }
            interface VectorDto {
                vector: number[];
            }
            interface VectorsDto {
                vectors: number[][];
            }
            interface VectorBoolDto {
                vector: boolean[];
            }
            interface FractionTwoVectorsDto {
                first: number[];
                second: number[];
                fraction: number;
            }
            interface VectorScalarDto {
                vector: number[];
                scalar: number;
            }
            interface TwoVectorsDto {
                first: number[];
                second: number[];
            }
            interface TwoVectorsReferenceDto {
                first: number[];
                second: number[];
                reference: number[];
            }
            declare class BitByBitBase {
                readonly scene: Scene;
                readonly transforms: Transforms;
                readonly vector: Vector;
            }
        }
        `;
        let libUri = 'ts:filename/base.d.ts';
        monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri);

        window.monaco.editor.createModel(libSource,
            'typescript',
            window.monaco.Uri.parse(libUri)
        );

        libSource = `
            const bitbybit: Bit.BitByBitBase = (window as any).BitByBitBase;
            const BitByBit = {
                scene: window.blockly.scene,
                blocklyWorkspace: window.blockly.workspace,
                BABYLON: window.BABYLON,
                verb: window.verb,
                BitByBitBlockHandlerService: window.BitByBitBlockHandlerService,
                BitByBitBlocklyHelperService: window.BitByBitBlocklyHelperService,
                CSG: window.CSG
            };
        `;
        libUri = 'ts:filename/bitbybit.ts';
        monaco.languages.typescript.typescriptDefaults.addExtraLib(libSource, libUri);

        window.monaco.editor.createModel(libSource,
            'typescript',
            window.monaco.Uri.parse(libUri)
        );

    } // here monaco object will be available as window.monaco use this function to extend monaco editor functionalities.
};
@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        RouterModule,
        BrowserAnimationsModule,
        SimplebarAngularModule,
        AppRoutingModule,
        MonacoEditorModule.forRoot(monacoConfig),
    ],
    providers: [BitByBitBase, Scene, Context, Transforms, Vector],
    bootstrap: [AppComponent]
})
export class AppModule { }
