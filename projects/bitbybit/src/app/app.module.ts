import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { SimplebarAngularModule } from 'simplebar-angular';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { Scene } from '../blocks-code/code/scene';
import { BitByBitBase } from '../blocks-code/code/bitbybit';
import { Context } from '../blocks-code/code/context';
import { Transforms } from '../blocks-code/code/transforms';
import { Vector } from '../blocks-code/code/vector';


const monacoConfig: NgxMonacoEditorConfig = {
    onMonacoLoad: () => {
        window.monaco.editor.defineTheme('my-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
            ],
            colors: {
                "editor.background": '#1a1c1f'
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
                 * Measures an angle between two vectors in degrees
                 * @param inputs Contains two vectors represented as number arrays
                 */
                angle(inputs: TwoVectorsDto): number;
                /**
                 * Measures an normalized 2d angle between two vectors in degrees
                 * @param inputs Contains two vectors represented as number arrays
                 */
                angleBetweenNormalized2d(inputs: TwoVectorsDto): number;
                /**
                 * Measures a positive angle between two vectors given the reference vector in degrees
                 * @param inputs Contains information between two vectors represented as number arrays
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
            }
            interface VectorsDto {
                vectors: number[][];
            }
            interface VectorBoolDto {
                vector: boolean[];
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


        // // extra libraries
        // var libSource = [
        //     'declare class Facts {',
        //     '    /**',
        //     '     * Returns the next fact',
        //     '     */',
        //     '    static next():string',
        //     '}',
        // ].join('\n');
        // var libUri = 'ts:filename/facts.d.ts';
        // monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);

        // // When resolving definitions and references, the editor will try to use created models.
        // // Creating a model for the library allows "peek definition/references" commands to work with the library.
        // monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));


        // var libSource = [
        //     'const d = {ga: "gaga"};'
        // ].join('\n');
        // var libUri = 'ts:filename/dafa.ts';
        // monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);

        // // When resolving definitions and references, the editor will try to use created models.
        // // Creating a model for the library allows "peek definition/references" commands to work with the library.
        // monaco.editor.createModel(libSource, 'typescript', monaco.Uri.parse(libUri));

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
