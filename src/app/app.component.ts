import { Component, OnInit, AfterViewInit } from '@angular/core';
import { svgResize, inject, Theme, Xml, WorkspaceSvg } from 'blockly';
import * as JavaScript from 'blockly/javascript';

import { constantsModel } from './models/constants.model';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Materials/standardMaterial';
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3, Color4, Color3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { themeStyle } from './models/theme-styles.model';
import { toolboxDefinition } from './models/toolbox-definition';
import { ArcRotateCamera, DirectionalLight } from '@babylonjs/core';
import { MatDialog } from '@angular/material/dialog';
import { ExamplesDialogComponent } from './components/examples-dialog/examples-dialog.component';
import { AboutDialogComponent } from './components/about-dialog/about-dialog.component';
import { SponsorsDialogComponent } from './components/sponsors-dialog/sponsors-dialog.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ExamplesService } from './examples/example-service';

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
    constants = constantsModel;

    constructor(
        public dialog: MatDialog,
        public readonly router: Router,
        public readonly route: ActivatedRoute,
        public readonly examplesService: ExamplesService
    ) {
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const theme = Theme.defineTheme('themeName', themeStyle());

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

            const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
            this.engine = new Engine(canvas);
            this.scene = new Scene(this.engine);
            this.scene.clearColor = new Color4(1, 1, 1, 1);

            const camera = new ArcRotateCamera('Camera', 0, 10, 10, new Vector3(0, 0, 0), this.scene);
            camera.setPosition(new Vector3(0, 10, 20));
            camera.attachControl(canvas, true);
            const light = new DirectionalLight('DirectionalLight', new Vector3(1, 1, 0), this.scene);
            light.diffuse = new Color3(1, 1, 1);
            light.specular = new Color3(1, 1, 1);
            light.intensity = 1;
            this.windowBlockly = {};
            this.windowBlockly.scene = this.scene;
            (window as any).blockly = this.windowBlockly;

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            this.route.queryParamMap.subscribe(param => {
                const exampleParam = param.get('examples');
                if (exampleParam) {
                    const xml = Xml.textToDom(this.examplesService.getExampleXml(exampleParam));
                    if (xml) {
                        this.workspace.clear();
                        Xml.domToWorkspace(xml, this.workspace);
                        this.workspace.zoomToFit();
                        this.workspace.zoomCenter(-3);
                        this.run();
                    }
                }
            });
        }, 500);

    }

    ngOnInit(): void {
        const el = document.getElementById('blocklyArea');
        el.insertAdjacentHTML('afterend', toolboxDefinition());
    }

    onResize() {
        let element = this.blocklyArea;
        if (this.engine) {
            this.engine.resize();
        }
        let x = 0;
        let y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        this.blocklyDiv.style.width = this.blocklyArea.offsetWidth + 'px';
        this.blocklyDiv.style.height = this.blocklyArea.offsetHeight + 'px';
        svgResize(this.workspace);
    }

    onCode(code: string) { }

    import() {
        const inputFileElement = document.getElementById('exampleInput') as HTMLInputElement;
        inputFileElement.click();
        inputFileElement.onchange = (e) => {
            const file = inputFileElement.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (evt) => {
                    const xml = Xml.textToDom(evt.target.result as string);
                    this.workspace.clear();
                    Xml.domToWorkspace(xml, this.workspace);
                    this.workspace.zoomToFit();
                    this.workspace.zoomCenter(-3);
                    this.run();
                };
                reader.onerror = (evt) => {
                    document.getElementById('fileContents').innerHTML = 'error reading file';
                };
            }
        };
    }

    export() {
        const xml = Xml.workspaceToDom(this.workspace);
        let xml_text = Xml.domToText(xml);
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

    cleanCanvas() {
        this.workspace.clear();
        this.router.navigate(['/']);
        this.run();
    }

    run() {
        try {
            this.scene.meshes.forEach(m => m.dispose());
            this.scene.meshes = [];
            this.scene.clearColor = new Color4(1, 1, 1, 1);

            const javascript = JavaScript;
            (window as any).LoopTrap = 10000;
            javascript.INFINITE_LOOP_TRAP = 'if(--window.LoopTrap == 0) throw "Infinite loop cancelled after 10000 iterations.";\n';
            const code = javascript.workspaceToCode(this.workspace);
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
            });
        }
    }

    runCodeWithDateFunction() {
        const code = JavaScript.workspaceToCode(this.workspace);
        return Function(code)()();
    }

    evaluate = () => {
        try {
            const code = JavaScript.workspaceToCode(this.workspace);
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
            height: '700px',
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
