import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ArcRotateCamera, DirectionalLight, TransformNode, HemisphericLight, WindowsMotionController } from '@babylonjs/core';
import { Engine } from '@babylonjs/core/Engines/engine';
import '@babylonjs/core/Materials/standardMaterial';
import { Color3, Color4, Vector3 } from '@babylonjs/core/Maths/math';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import '@babylonjs/core/Meshes/meshBuilder';
import { Scene } from '@babylonjs/core/scene';
import { inject, svgResize, WorkspaceSvg, Xml } from 'blockly';
import * as Blockly from 'blockly';
import * as JavaScript from 'blockly/javascript';
import * as jsonpath from 'jsonpath';
import { PromptInterface } from '../../blocks/_shared/models/prompt.interface';
import { BitByBitBlockHandlerService } from '../../blocks/validations';
import { prepareBabylonForBlockly } from '../../babylon-to-blockly';
import { assembleBlocks } from '../../blocks/assemble-blocks';
import { ResourcesInterface, ResourcesService } from '../../resources';
import { AboutDialogComponent } from './components/about-dialog/about-dialog.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { ExamplesDialogComponent } from './components/examples-dialog/examples-dialog.component';
import { PrintSaveDialogComponent } from './components/print-save-dialog/print-save-dialog.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { SponsorsDialogComponent } from './components/sponsors-dialog/sponsors-dialog.component';
import { ExamplesService } from './examples/example-service';
import { constantsModel } from './models/constants.model';
import { toolboxDefinition } from './models/toolbox-definition';
import { SettingsService } from './shared/setting.service';
import { TagService } from './tags/tag.service';
import { MatDrawer } from '@angular/material/sidenav';
import { EditorComponent } from 'ngx-monaco-editor';
import { transpile } from 'typescript';
import { UiStatesEnum } from './models/ui-states.enum';
import { BitByBitBase, BitByBitBlocklyHelperService, Context, PrintSaveInterface } from 'projects/bitbybit-core/src/public-api';
import * as Inputs from 'projects/bitbybit-core/src/lib/api/inputs/inputs';
import { BaseTypes } from 'projects/bitbybit-core/src/lib/api/bitbybit/base-types';
import { core, geom } from 'verb-nurbs-web';
import { EnterMonacoDialogComponent } from './components/enter-monaco-dialog/enter-monaco-dialog.component';
import { monacoDialogResultEnum } from './models/monaco-dialog-result.enum';
import { EnterBlocklyDialogComponent } from './components/enter-blockly-dialog/enter-blockly-dialog.component';

@Component({
    selector: 'app-root',
    templateUrl: './bitbybit-app.component.html',
    styleUrls: ['./bitbybit-app.component.scss']
})
export class BitbybitAppComponent implements OnInit, OnDestroy, AfterViewInit {

    blocklyDiv: HTMLElement;
    blocklyArea: Element & HTMLElement;
    workspace: WorkspaceSvg;
    defaultPointsMesh: Mesh;
    scene: Scene;
    engine: Engine;
    windowBlockly;
    constants = constantsModel;
    resources: ResourcesInterface;
    firstTimeOpen = true;
    tagsNeedUpdate = false;

    previousUiState: UiStatesEnum = UiStatesEnum.blockly;
    currentUiState: UiStatesEnum = UiStatesEnum.blockly;
    UiStatesEnum = UiStatesEnum;

    toolboxVisible = true;

    timePassedFromPreviousIteration = 0;

    editorOptions = {
        theme: 'my-dark',
        language: 'typescript',
        contextmenu: false,
        formatOnPaste: true,
        autoIndent: true,
        formatOnType: true,
        insertSpaces: true,
        tabSize: 4,
        formatDocument: true,
    };

    code = '';

    @ViewChild('drawer', { static: true }) drawerElement: MatDrawer;
    @ViewChild('editor', { static: false }) editor: EditorComponent;

    constructor(
        public dialog: MatDialog,
        public readonly router: Router,
        public readonly route: ActivatedRoute,
        public readonly examplesService: ExamplesService,
        private readonly settingsService: SettingsService,
        private readonly changeDetectorService: ChangeDetectorRef,
        private readonly httpClient: HttpClient,
        private readonly tagService: TagService,
        private readonly context: Context,
        private readonly bitByBit: BitByBitBase,
    ) {
    }

    ngOnDestroy(): void {
        this.workspace.dispose();
        this.scene.dispose();
        window.onbeforeunload = () => { };
    }

    ngAfterViewInit(): void {
        import('csg-generated')
            .then(() => {
                this.blocklyArea = document.getElementById('blocklyArea');
                this.blocklyDiv = document.getElementById('blocklyDiv');
                const options = {
                    toolbox: document.getElementById('toolbox'),
                    zoom:
                    {
                        wheel: true,
                        startScale: 0.6,
                        maxScale: 3,
                        minScale: 0.3,
                        scaleSpeed: 1.2
                    },
                    trashcan: true,
                    sounds: false,
                    theme: this.settingsService.theme,
                    renderer: 'zelos',
                    rendererOverrides: {
                        FIELD_DROPDOWN_SVG_ARROW_DATAURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADVUlEQVR4Xu2YSeiOURTGf39TIlKUhWlD2LDAQmZCZiUyZSGFYqEUKRsRURbIGCVEUoYQMk8LIgtJEZFIIREhoqfuW7e378v3jmfx3rP69733nuc5zznn3nv+TVTcmioeP0GAUAEVVyC0QMULIByCoQVCC1RcgdACFS+AcAuEFggtUHEFQgtUvADCLZC2BXoD24FZwGfjKuoIHAOWAs+TckkjQHfgNtANuAuMA74lBc5pfTvgCjAIeAUMBd4k8Z1GAAU/xAO5BEwFfiYBzmFta+A8MMrzJW7DkvhOI8AA4Bog9SM7AcwG/iQBz7C2JSBMCR/ZVyfGgyR+0wgg/yOAC4CyENkBYBHwNwmBFGubAQeB+d7eH8B44GZSf2kFEM5k4CTQwgPdCqwsUATx3QYs8zB/A9OBc0mD1/osAmj/XOBwzM9aYH0aMg3sWQfIf2SqtnnA0Qb21lySVQA51fWzM+Z9ObAjLak6+1YAqjDfhL07C04eAgh/DbAhRmQBcCgLOW/vQmB/zJcwN2b1n5cA8rPZ9X/ESTfCDOB0RpLycRzQ4RfZFmBVHmdNXgJE58ledxNERH8BE4CrKUUYC5wFWnn79wGL8wg+Ip2SW81tzd2BNNP7qlfiaOBeQqDBwGWgjbdPlaCDN7f3Rp4VEPFUts64ezn67ZN7OzxuUIR+wA2gg7de745pgKoqNytCAJFrC1yMPZnfubf6i/+w7+lmjc7eujtu5vieW+TOUVECyL2ydx3o75F+6UR4WyeQLoCC7eF9f+SeuIVMnUUKoBiUxVtALy+gJ8Bw4GNMhE7uKdvX+/2ZG27e5535yF/RAghH2dSU1tUL4j4wBtAAI2vvxtqB3hqNtZo6XxcVvPyWIYBw+rhKUJYj00Q50XHQWDvS+/bBZf5pkcGXKYCwao3Rui2UhCleoF9czz8sOviyBRCeel+3gz9G+3GmHmvTilVWC/j8JgGnYmO0vmus1T2vdijNLARQcHOAI94ZpLFWLzz9c7NUsxJAQS4Bdrlo9feeUiN3YJYCiMJqx2OTRfAWh6BVnHVxrSvAXJAggHkKjAmECjBOgDl8qADzFBgTCBVgnABz+FAB5ikwJhAqwDgB5vChAsxTYEwgVIBxAszhQwWYp8CYwD/Za3NBeWp1tQAAAABJRU5ErkJggg==',
                        SELECTED_GLOW_COLOUR: '#e5b7a0',
                        REPLACEMENT_GLOW_COLOUR: '#e5b7a0',
                    },
                }
                this.workspace = inject(this.blocklyDiv,
                  options);

                window.addEventListener('resize', () => this.onResize(), false);
                const toolbox = this.workspace.getToolbox();
                const flyout = toolbox.getFlyout();
                flyout.MARGIN = 40;
                flyout.CORNER_RADIUS = 10;

                toolbox.clearSelection();

                (Blockly.prompt as any) = (message, defaultValue, callback) => {
                    this.openPromptDialog({ message, defaultValue, callback });
                };

                svgResize(this.workspace);
                const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
                this.engine = new Engine(canvas);
                this.scene = new Scene(this.engine);
                this.scene.clearColor = new Color4(1, 1, 1, 1);
                const tnode = new TransformNode('root', this.scene);
                const camera = new ArcRotateCamera('Camera', 0, 10, 10, new Vector3(0, 0, 0), this.scene);
                camera.setPosition(new Vector3(0, 10, 20));
                camera.attachControl(canvas, true);
                const light = new DirectionalLight('DirectionalLight', new Vector3(10, 10, 0), this.scene);
                light.diffuse = new Color3(1, 1, 1);
                light.specular = new Color3(1, 1, 1);
                light.intensity = 0.6;
                const light2 = new DirectionalLight('DirectionalLight', new Vector3(-10, 10, -10), this.scene);
                light2.diffuse = new Color3(1, 1, 1);
                light2.specular = new Color3(1, 1, 1);
                light2.intensity = 0.6;
                const light3 = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), this.scene);
                light3.intensity = 0.2;

                this.scene.ambientColor = new Color3(0.1, 0.1, 0.1);

                this.windowBlockly = {};
                this.context.scene = this.scene;
                const verb: any = {};
                verb.geom = geom;
                verb.core = core;
                this.context.verb = verb;
                this.context.jscad = (window as any).CSG;
                (window as any).Bit = { Inputs, BaseTypes };
                (window as any).BitByBitBase = this.bitByBit;
                this.windowBlockly.scene = this.scene;
                this.windowBlockly.workspace = this.workspace;
                (window as any).blockly = this.windowBlockly;

                this.engine.runRenderLoop(() => {
                    const now = Date.now();
                    const timeElapsedFromPreviousIteration = now - this.timePassedFromPreviousIteration;
                    this.timePassedFromPreviousIteration = now;
                    BitByBitBlocklyHelperService.renderLoopBag.forEach(f => f(timeElapsedFromPreviousIteration));
                    this.scene.render();
                });

                this.tagsNeedUpdate = false;

                camera.onProjectionMatrixChangedObservable.add(() => {
                    this.tagsNeedUpdate = true;
                });

                camera.onViewMatrixChangedObservable.add(() => {
                    this.tagsNeedUpdate = true;
                });

                this.scene.registerAfterRender(() => {
                    this.tagService.handleTags(camera, this.tagsNeedUpdate, this.engine, this.scene);
                    this.tagsNeedUpdate = false;
                });

                BitByBitBlocklyHelperService.promptPrintSave = (prompt: PrintSaveInterface) => this.openPrintSaveDialog(prompt);
                BitByBitBlocklyHelperService.angular = {
                    httpClient: this.httpClient,
                    HttpHeaders,
                    HttpParams
                };
                BitByBitBlocklyHelperService.jsonpath = jsonpath;
                BitByBitBlocklyHelperService.clearAllDrawn = () => this.clearMeshesAndMaterials();

                this.settingsService.initSettings(this.workspace, this.changeDetectorService).subscribe(s => {

                    this.route.queryParamMap.subscribe(param => {
                        const exampleParam = param.get('examples');
                        const editorParam = param.get('editor');
                        if (exampleParam && !editorParam) {
                            this.firstTimeOpen = false;
                            const xml = Xml.textToDom(this.examplesService.getExampleXml(exampleParam));
                            if (xml) {
                                this.currentUiState = UiStatesEnum.blockly;
                                this.previousUiState = UiStatesEnum.babylon;
                                this.workspace.clear();
                                Xml.domToWorkspace(xml, this.workspace);
                                setTimeout(() => {
                                    this.workspace.zoomToFit();
                                    this.workspace.zoomCenter(-3);
                                    this.collapseExpandedMenus();
                                    this.onResize();
                                    this.run();
                                }, 200);
                            }
                        } else if (exampleParam && editorParam === 'ts') {
                            this.code = this.examplesService.getExampleTypescript(exampleParam);
                            this.startMonaco();
                            this.run();
                        } else if (editorParam === 'ts') {
                            this.code = this.examplesService.getExampleTypescript(exampleParam);
                            this.startMonaco();
                            if (this.firstTimeOpen) {
                                this.examples();
                                this.firstTimeOpen = false;
                            }
                        } else {
                            if (this.firstTimeOpen) {
                                this.examples();
                                this.firstTimeOpen = false;
                            }
                        }
                    });
                });

                setTimeout(() => {
                    this.collapseExpandedMenus();
                    this.onResize();
                });
            });

    }

    private collapseExpandedMenus(): void {
        const treeRows = document.body.querySelectorAll(
            '.blocklyTreeRow');
        treeRows.forEach((element) => {
            const ariaExpanded = element.parentElement.attributes.getNamedItem('aria-expanded');
            if (ariaExpanded) {
                (element as HTMLElement).click();
            }
        });
    }

    ngOnInit(): void {

        this.resources = ResourcesService.getResources();
        prepareBabylonForBlockly();
        assembleBlocks();

        const el = document.getElementById('blocklyArea');
        el.insertAdjacentHTML('afterend', toolboxDefinition());

        window.onbeforeunload = (e) => {
            e = e || window.event;
            // For IE and Firefox prior to version 4
            if (e) {
                e.returnValue = 'Changes made to the script will be lost. Proceed?';
            }
            // For Safari
            return 'Changes made to the script will be lost. Proceed?';
        };
    }

    onResize(): void {
        let element = this.blocklyArea;
        if (this.engine) {
            this.engine.resize();
        }
        let x = 0;
        let y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent as HTMLElement;
        } while (element);
        this.blocklyDiv.style.width = this.blocklyArea.offsetWidth + 'px';
        this.blocklyDiv.style.height = this.blocklyArea.offsetHeight + 'px';

        svgResize(this.workspace);
    }

    import(): void {
        const inputFileElement = document.getElementById('exampleInput') as HTMLInputElement;
        inputFileElement.click();
        inputFileElement.onchange = (e) => {
            const file = inputFileElement.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onload = (evt) => {
                    const xml = Xml.textToDom(evt.target.result as string);
                    this.cleanCanvas();
                    Xml.domToWorkspace(xml, this.workspace);
                    this.workspace.zoomToFit();
                    this.workspace.zoomCenter(-3);
                    this.run();
                    this.onResize();
                };
                reader.onerror = (evt) => {
                    document.getElementById('fileContents').innerHTML = 'error reading file';
                };
            }
        };
    }

    export(): void {
        const xml = Xml.workspaceToDom(this.workspace);
        const xmlText = Xml.domToText(xml);
        this.createBlobAndDownload(xmlText, 'text/xml', 'workspace.bitbybit');
    }

    exportTypescript(): void {
        this.createBlobAndDownload(this.code, 'text', 'workspace.ts');
    }

    examples(): void {
        this.openExamplesDialog();
    }

    toggleToolbox(): void {
        const toolbox = this.workspace.getToolbox();
        const flyout = this.workspace.getFlyout();

        this.toolboxVisible = !this.toolboxVisible;
        toolbox.setVisible(this.toolboxVisible);
        flyout.setVisible(false);
        this.onResize();
    }

    toggleCodeEditor(): void {

        if (this.currentUiState === UiStatesEnum.blockly) {
            this.openEnterMonacoDialog();
        } else if (this.currentUiState === UiStatesEnum.monaco) {
            this.openEnterBlocklyDialog();
        }
    }

    private startBlocklyEditor(): void {
        this.currentUiState = UiStatesEnum.blockly;
        this.previousUiState = UiStatesEnum.babylon;

        setTimeout(() => {
            this.clearBabylonScene();
            this.router.navigate(['/app']);
            window.dispatchEvent(new Event('resize'));
            this.workspace.zoomToFit();
            this.workspace.zoomCenter(-3);
            this.onResize();
        });
    }

    private startMonaco(): void {
        this.clearBabylonScene();
        this.currentUiState = UiStatesEnum.monaco;
        this.previousUiState = UiStatesEnum.babylon;
        (document.getElementsByClassName('editor-container')[0] as HTMLElement).style.height = '100%';
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            if ((this.editor as any)._editor) {
                (this.editor as any)._editor.trigger('anyString', 'editor.action.formatDocument');
            }
        }, 200);
    }

    about(): void {
        this.openAboutDialog();
    }

    settings(): void {
        this.openSettingsDialog();
    }

    sponsors(): void {
        this.openSponsorsDialog();
    }

    swapCanvas(): void {
        switch (this.currentUiState) {
            case UiStatesEnum.babylon:
                this.currentUiState = this.previousUiState;
                break;
            case UiStatesEnum.blockly:
                this.currentUiState = UiStatesEnum.babylon;
                this.previousUiState = UiStatesEnum.blockly;
                Blockly.hideChaff();
                break;
            case UiStatesEnum.monaco:
                this.currentUiState = UiStatesEnum.babylon;
                this.previousUiState = UiStatesEnum.monaco;
                break;
            default:
                break;
        }
    }

    cleanCanvas(): void {
        this.workspace.clear();
        this.router.navigate(['/app']);
        this.run();
    }

    run(): void {
        let transpiledCode = false;
        try {
            this.clearBabylonScene();

            let code = (JavaScript as any).workspaceToCode(this.workspace);

            if (this.currentUiState === UiStatesEnum.monaco) {
                code = transpile(this.code);
                transpiledCode = true;
            }

            Function(`
            "use strict";
            const bitbybit = window.BitByBitBase;
            const Bit = window.Bit;
            const BitByBit = {
                blocklyWorkspace: window.blockly.workspace,
                BitByBitBlockHandlerService: window.BitByBitBlockHandlerService,
                BitByBitBlocklyHelperService: window.BitByBitBlocklyHelperService,
            };
            ${code}`)();

            if (this.tagService.tagsExist()) {
                this.tagsNeedUpdate = true;
            }

        } catch (e) {
            if (transpiledCode) {
                this.openAlertDialog({
                    title: 'Code execution failed',
                    details: `Something went wrong when running the code.`,
                    message: `${e}`,
                });
            } else {
                const blockThatWasActive = this.workspace.getBlockById(BitByBitBlockHandlerService.runningBlockId);
                BitByBitBlockHandlerService.handleBlockException(blockThatWasActive, e);
                this.openAlertDialog({
                    title: 'Code execution failed',
                    details: `Something went wrong when running the code. Check if there are no disconnected or misconfigured components on your canvas`,
                    message: `${e}`,
                });
            }

        }
    }

    private clearBabylonScene(): void {
        this.clearMeshesAndMaterials();
        this.tagService.removeTagsIfNeeded();
        BitByBitBlocklyHelperService.intervalBag.forEach(i => clearInterval(i));
        BitByBitBlocklyHelperService.timeoutBag.forEach(t => clearTimeout(t));
        BitByBitBlocklyHelperService.renderLoopBag = [];

        this.scene.clearColor = new Color4(1, 1, 1, 1);
    }

    clearMeshesAndMaterials(): void {
        this.scene.meshes.forEach(m => m.dispose());
        this.scene.meshes = [];
        this.scene.materials.forEach(m => m.dispose());
        this.scene.materials = [];
        this.scene.transformNodes.forEach(t => {
            if (t.name !== 'root') {
                t.dispose();
            }
        });
        this.scene.transformNodes = [this.scene.getTransformNodeByName('root')];
    }

    private createBlobAndDownload(text: string, type: string, fileName: string): void {
        const blob = new Blob([text], { type });
        const blobUrl = URL.createObjectURL(blob);

        const fileLink = document.createElement('a');
        fileLink.href = blobUrl;
        fileLink.target = '_self';
        fileLink.download = fileName;
        fileLink.click();
        fileLink.remove();
    }

    private openEnterMonacoDialog(): void {
        const dialogRef = this.dialog.open(EnterMonacoDialogComponent,
            {
                width: '600px',
                height: 'auto',
                autoFocus: false,
            });
        dialogRef.afterClosed().subscribe((result: monacoDialogResultEnum) => {
            switch (result) {
                case monacoDialogResultEnum.saveAndContinue:
                    this.export();
                    this.code = `${(JavaScript as any).workspaceToCode(this.workspace)}`;
                    this.startMonaco();
                    this.router.navigate(['/app']);

                    break;
                case monacoDialogResultEnum.continue:
                    this.code = `${(JavaScript as any).workspaceToCode(this.workspace)}`;
                    this.startMonaco();
                    this.router.navigate(['/app']);
                    break;
                case monacoDialogResultEnum.cancel:
                    break;
                default:
                    break;
            }
        });
    }

    private openEnterBlocklyDialog(): void {
        const dialogRef = this.dialog.open(EnterBlocklyDialogComponent,
            {
                width: '600px',
                height: 'auto',
                autoFocus: false,
            });
        dialogRef.afterClosed().subscribe((result: monacoDialogResultEnum) => {
            switch (result) {
                case monacoDialogResultEnum.saveAndContinue:
                    this.exportTypescript();
                    this.startBlocklyEditor();
                    break;
                case monacoDialogResultEnum.continue:
                    this.startBlocklyEditor();
                    break;
                case monacoDialogResultEnum.cancel:
                    break;
                default:
                    break;
            }
        });
    }

    private openAlertDialog(error: { title: string, details: string, message: string }): void {
        this.dialog.open(AlertDialogComponent, {
            width: '600px',
            height: 'auto',
            autoFocus: false,
            data: error,
        });
    }

    private openExamplesDialog(): void {
        this.dialog.open(ExamplesDialogComponent, {
            width: '600px',
            height: 'auto',
            autoFocus: false
        });
    }

    private openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent, {
            width: '600px',
            height: 'auto',
            autoFocus: false
        });
    }

    private openSponsorsDialog(): void {
        this.dialog.open(SponsorsDialogComponent, {
            width: '700px',
            height: 'auto',
            autoFocus: false
        });
    }

    private openSettingsDialog(): void {
        this.dialog.open(SettingsDialogComponent, {
            width: '500px',
            height: 'auto',
            autoFocus: false,
            data: {
                workspace: this.workspace
            }
        });
    }

    private openPrintSaveDialog(prompt: PrintSaveInterface): void {
        this.dialog.open(PrintSaveDialogComponent, {
            width: '500px',
            height: 'auto',
            autoFocus: false,
            data: prompt
        });
    }

    private openPromptDialog(prompt: PromptInterface): void {
        const dialogRef = this.dialog.open(PromptDialogComponent, {
            width: '500px',
            height: 'auto',
            autoFocus: false,
            data: prompt
        });

        dialogRef.afterClosed().subscribe(result => {
            prompt.callback(null);
        });
    }

}
