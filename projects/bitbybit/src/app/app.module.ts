import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { SimplebarAngularModule } from 'simplebar-angular';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { BitbybitCoreModule } from 'projects/bitbybit-core/src/public-api';
import * as DeclarationStrings from 'projects/bitbybit-core/src/lib/string-declarations';

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
            namespace Inputs {
                ${DeclarationStrings.nodeInputsString}
                ${DeclarationStrings.sceneInputsString}
                ${DeclarationStrings.vectorInputsString}
                ${DeclarationStrings.transformsInputsString}
                ${DeclarationStrings.pointInputsString}
                ${DeclarationStrings.lineInputsString}
                ${DeclarationStrings.polylineInputsString}
                ${DeclarationStrings.curveInputsString}
                ${DeclarationStrings.surfaceInputsString}
                ${DeclarationStrings.solidInputsString}
                ${DeclarationStrings.intersectInputsString}
                ${DeclarationStrings.tagInputsString}
                ${DeclarationStrings.occInputsString}
            }
            ${DeclarationStrings.baseTypesString}
            ${DeclarationStrings.vectorString}
            ${DeclarationStrings.transformsString}
            ${DeclarationStrings.sceneString}
            ${DeclarationStrings.nodeString}
            ${DeclarationStrings.pointString}
            ${DeclarationStrings.lineString}
            ${DeclarationStrings.polylineString}
            ${DeclarationStrings.curveEllipseString}
            ${DeclarationStrings.curveCircleString}
            ${DeclarationStrings.curveString}
            ${DeclarationStrings.surfaceString}
            ${DeclarationStrings.surfaceConicalString}
            ${DeclarationStrings.surfaceCylindricalString}
            ${DeclarationStrings.surfaceExtrusionString}
            ${DeclarationStrings.surfaceRevolvedString}
            ${DeclarationStrings.surfaceSphericalString}
            ${DeclarationStrings.surfaceSweepString}
            ${DeclarationStrings.solidString}
            ${DeclarationStrings.solidBooleansString}
            ${DeclarationStrings.solidExpansionsString}
            ${DeclarationStrings.solidExtrusionsString}
            ${DeclarationStrings.solidHullsString}
            ${DeclarationStrings.solidPathString}
            ${DeclarationStrings.solidPolygonString}
            ${DeclarationStrings.solidShapesString}
            ${DeclarationStrings.solidTextString}
            ${DeclarationStrings.intersectString}
            ${DeclarationStrings.tagString}
            ${DeclarationStrings.timeString}
            ${DeclarationStrings.occString}

            class BitByBitBase {
                readonly vector: Vector;
                readonly scene: Scene;
                readonly transforms: Transforms;
                readonly node: Node;
                readonly point: Point;
                readonly line: Line;
                readonly polyline: Polyline;
                readonly curve: Curve;
                readonly surface: Surface;
                readonly solid: Solid;
                readonly intersect: Intersect;
                readonly tag: Tag;
                readonly time: Time;
                readonly occ: OCC;
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
            const Bit: Bit = (window as any).Bit;
            const bitbybit: Bit.BitByBitBase = (window as any).BitByBitBase;
            const BitByBit = {
                blocklyWorkspace: window.blockly.workspace,
                BitByBitBlockHandlerService: window.BitByBitBlockHandlerService,
                BitByBitBlocklyHelperService: window.BitByBitBlocklyHelperService,
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
        BitbybitCoreModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
