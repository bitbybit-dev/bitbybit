import { Component, OnInit, AfterViewInit } from '@angular/core';
import { svgResize, inject, Theme, Xml, WorkspaceSvg } from 'blockly';
import * as JavaScript from 'blockly/javascript';

import "@babylonjs/core/Meshes/meshBuilder";
// Side-effects only imports allowing the standard material to be used as default.
import "@babylonjs/core/Materials/standardMaterial";
// Side-effects only imports allowing Mesh to create default shapes (to enhance tree shaking, the construction methods on mesh are not available if the meshbuilder has not been imported).
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color4, Color3 } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { themeStyle } from './models/theme-styles.model';
import { toolboxDefinition } from './models/toolbox-definition';
import { ArcRotateCamera, DirectionalLight } from '@babylonjs/core';
import { MatDialog } from '@angular/material/dialog';
import { ExamplesDialogComponent } from './components/examples-dialog/examples-dialog.component';
import { AboutDialogComponent } from './components/about-dialog/about-dialog.component';
import { SponsorsDialogComponent } from './components/sponsors-dialog/sponsors-dialog.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

    blocklyDiv;
    blocklyArea;
    workspace: WorkspaceSvg;
    defaultPointsMesh: Mesh;
    scene: Scene;
    engine: Engine;
    windowBlockly;

    constructor(public dialog: MatDialog) {
    }

    ngAfterViewInit(): void {
        var theme = Theme.defineTheme('themeName', themeStyle());

        this.blocklyArea = document.getElementById('blocklyArea');
        this.blocklyDiv = document.getElementById('blocklyDiv');
        this.workspace = inject(this.blocklyDiv,
            {
                toolbox: document.getElementById('toolbox'),
                zoom:
                {
                    controls: true,
                    wheel: true,
                    startScale: 0.7,
                    maxScale: 3,
                    minScale: 0.3,
                    scaleSpeed: 1.2
                },
                trashcan: false,
                theme
            });

        window.addEventListener('resize', () => this.onResize(), false);

        this.onResize();

        svgResize(this.workspace);

        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(canvas);
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(1, 1, 1, 1);

        var camera = new ArcRotateCamera("Camera", 0, 10, 10, new Vector3(0, 0, 0), this.scene);
        camera.setPosition(new Vector3(0, 10, 20));
        camera.attachControl(canvas, true);
        var light = new DirectionalLight("DirectionalLight", new Vector3(-1, -1, 0), this.scene);
        light.diffuse = new Color3(1, 1, 1);
        light.specular = new Color3(1, 1, 1);
        light.intensity = 1;
        this.windowBlockly = {};
        this.windowBlockly.scene = this.scene;
        (window as any).blockly = this.windowBlockly;

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

    }

    ngOnInit(): void {
        var el = document.getElementById('blocklyArea');
        el.insertAdjacentHTML('afterend', toolboxDefinition())
    }

    onResize() {
        var element = this.blocklyArea;
        if (this.engine) {
            this.engine.resize();
        }
        var x = 0;
        var y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        this.blocklyDiv.style.width = this.blocklyArea.offsetWidth + 'px';
        this.blocklyDiv.style.height = this.blocklyArea.offsetHeight + 'px';
        svgResize(this.workspace);
    };

    onCode(code: string) { }

    import() {
        var inputFileElement = document.getElementById("exampleInput") as HTMLInputElement;
        inputFileElement.click();
        inputFileElement.onchange = (e) => {
            var file = inputFileElement.files[0];
            if (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onload = (evt) => {
                    var xml = Xml.textToDom(evt.target.result as string);
                    this.workspace.clear();
                    Xml.domToWorkspace(xml, this.workspace);
                    this.workspace.zoomToFit();
                    this.workspace.zoomCenter(-3);
                    this.run();
                }
                reader.onerror = (evt) => {
                    document.getElementById("fileContents").innerHTML = "error reading file";
                }
            }
        };
    }

    export() {
        var xml = Xml.workspaceToDom(this.workspace);
        var xml_text = Xml.domToText(xml);
        const blob = new Blob([xml_text], { type: 'text/xml' });
        const blobUrl = URL.createObjectURL(blob);

        const fileLink = document.createElement('a');
        fileLink.href = blobUrl;
        fileLink.target = '_self';
        fileLink.download = 'workspace.bitbybit';
        fileLink.click();
        fileLink.remove();
    }

    examples() {
        this.openExamplesDialog();
    }

    about() {
        this.openAboutDialog();
    }

    sponsors() {
        this.openSponsorsDialog();
    }

    run() {
        try {
            this.scene.meshes.forEach(m => m.dispose());
            this.scene.meshes = [];
            const javascript = JavaScript;
            let code = javascript.workspaceToCode(this.workspace);
            eval(`
'use reserved'
let scene = window.blockly.scene;
let BABYLON = window.BABYLON;
let verb = window.verb;
${code}
            `);
        } catch (e) {
            this.openAlertDialog({
                title: 'Code execution failed',
                details: `Something went wrong when running the code. Check if there are no disconnected or misconfigured components on your canvas`,
                message: `Error Message: "${e}"`,
            })
        }
    }

    runCodeWithDateFunction() {
        let code = JavaScript.workspaceToCode(this.workspace);
        return Function(code)()();
    }

    evaluate = () => {
        try {
            let code = JavaScript.workspaceToCode(this.workspace);
            eval(code);
        } catch (e) {
            alert(e);
        }
    }

    private openAlertDialog(error: { title: string, details: string, message: string }): void {
        const dialogRef = this.dialog.open(AlertDialogComponent, {
            width: '600px',
            height: '300px',
            autoFocus: false,
            data: error,
        });

        dialogRef.afterClosed().subscribe(result => {
            const d = result;
        });
    }

    private openExamplesDialog(): void {
        const dialogRef = this.dialog.open(ExamplesDialogComponent, {
            width: '600px',
            height: '500px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            const d = result;
        });
    }

    private openAboutDialog(): void {
        const dialogRef = this.dialog.open(AboutDialogComponent, {
            width: '600px',
            height: '500px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            const d = result;
        });
    }

    private openSponsorsDialog(): void {
        const dialogRef = this.dialog.open(SponsorsDialogComponent, {
            width: '700px',
            height: '700px',
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            const d = result;
        });
    }
}
