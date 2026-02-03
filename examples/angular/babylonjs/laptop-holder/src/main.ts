import { Component, ViewEncapsulation, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { BitByBitBase, Inputs, initBitByBit, type InitBitByBitOptions } from "@bitbybit-dev/babylonjs";
import { OccStateEnum } from "@bitbybit-dev/occt-worker";
import { Scene, Engine, Color4, Color3, HemisphericLight, Vector3, ArcRotateCamera, Light, PointLight } from "@babylonjs/core";
import { LaptopLogic } from "./laptop";

// Angular Material imports
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";

interface Laptop {
    id: string;
    width: number;
    height: number;
    length: number;
}

@Component({
    selector: "app-root",
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule],
    template: `
        <div class="main">
            <div [ngClass]="{'hidden': !showSpinner()}" class="lds-ripple">
                <div></div>
                <div></div>
            </div>
            <canvas [ngClass]="{'opaque': !bitbybitInitialised()}" id="renderCanvas" class="example-sidenav-content">
            </canvas>
        </div>
        <div class="content">
            <div class="explanation">
                <h1>LAPTOP HOLDER</h1>
                <h2>Configurator</h2>
                <div class="scrolling">
                    <p>
                        <img width="100%" src="assets/lapholders1.jpeg" />
                    </p>
                    <p>
                        The application allows you to configure custom multi slot laptop holder. Choose how many laptops you
                        want and adjust the basic dimensions. Save your file and use it for 3D printing.
                    </p>
                    <p>
                        This application also serves as an example which demonstrates possibilities to integrate Bit by bit
                        developers platform in your own websites, configurators or webshops. We have recently released our core algorithms as an 
                        <a href="https://www.npmjs.com/package/@bitbybit-dev/core" target="_blank">npm package</a>.
                        If you are the beginner you can use our <a href="https://bitbybit.dev" target="_blank">bitbybit.dev</a>
                        platform to learn to use the API and construct parametric geometries.
                        If you are professional, consider exploring our <a href="https://docs.bitbybit.dev" target="_blank">bitbybit.dev API</a>.
                    </p>
                    <p>
                        By downloading STEP file you can easily 3D print it. To understand how to do that and learn how the
                        script works you can enroll in this free course on our school at 
                        <a href="https://school.bitbybit.dev/p/programming-vertical-laptop-holder-in-typescript" target="_blank">school.bitbybit.dev</a>
                    </p>
                </div>
            </div>
            <div class="space"></div>
            <div class="interaction" [ngClass]="{'opaque': !bitbybitInitialised()}">
                <div>
                    <ng-container *ngFor="let laptop of laptops; let i = index">
                        <div>
                            Laptop Nr. {{i + 1}}
                            <button class="delete" color="primary" mat-flat-button (click)="remove(laptop)" aria-label="Delete">
                                <mat-icon>delete</mat-icon>
                            </button>
                        </div>
                        <div class="input">
                            <mat-form-field class="example-full-width" appearance="fill">
                                <mat-label>Width</mat-label>
                                <input (blur)="render()" type="number" matInput maxlength="10" [(ngModel)]="laptop.width">
                            </mat-form-field>
                        </div>
                        <div class="input">
                            <mat-form-field appearance="fill">
                                <mat-label>Length</mat-label>
                                <input (blur)="render()" type="number" matInput maxlength="10" [(ngModel)]="laptop.length">
                            </mat-form-field>
                        </div>
                        <div class="input">
                            <mat-form-field class="example-full-width" appearance="fill">
                                <mat-label>Height</mat-label>
                                <input (blur)="render()" type="number" matInput maxlength="10" [(ngModel)]="laptop.height">
                            </mat-form-field>
                        </div>
                    </ng-container>
                </div>
                <br>
                <div>
                    <button mat-raised-button color="primary" (click)="add()" aria-label="Add laptop">
                        Add Laptop
                    </button>
                    <button class="download" mat-raised-button color="primary" (click)="downloadStep()" aria-label="Download STEP">
                        Download STEP
                    </button>
                    <button class="download" mat-raised-button color="primary" (click)="downloadStl()" aria-label="Download STL">
                        Download STL
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        @import 'https://fonts.googleapis.com/icon?family=Material+Icons';
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@200;300&display=swap');

        .explanation .scrolling::-webkit-scrollbar {
            background-color: rgba(0,0,0,0);
            width: 4px;
        }
        .explanation .scrolling::-webkit-scrollbar-track {
            background-color: rgba(0,0,0,0);
        }
        .explanation .scrolling::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0);
            border-radius: 16px;
            border: 1px solid #000;
        }
        .explanation .scrolling::-webkit-scrollbar-button { display: none; }

        .main {
            width: 100%;
            height: 100%;
            background-color: #bbb;
        }

        .content {
            font-family: Roboto, Helvetica, Sans-Serif;
            font-weight: 300;
            position: absolute;
            top: 0px;
            left: 0px;
            display: flex;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
        }

        h1 {
            margin-top: 0px;
            font-weight: 200;
            font-size: 40px;
            background: -webkit-linear-gradient(45deg, #3f51b5, #9fadff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        h2 {
            font-weight: 300;
            color: white;
        }

        .space {
            flex: 0.5;
            pointer-events: none;
        }

        canvas {
            position: absolute;
            outline: none;
            border: none;
            width: 100%;
            height: 100%;
        }

        canvas:focus {
            outline: none;
        }

        .explanation {
            flex: 0.2;
            margin: 40px;
            pointer-events: all;
        }

        .explanation .scrolling {
            width: 100%;
            max-height: 60vh;
            overflow-y: scroll;
            pointer-events: all;
            background-color: rgba(0,0,0,0.3);
            border-radius: 3px;
            color: white;
        }

        .explanation p {
            padding-right: 20px;
            padding-left: 20px;
        }

        .interaction {
            flex: 0.3;
            margin: 40px;
        }

        .input {
            width: 32%;
            display: inline-block;
            margin: 1px;
            pointer-events: all;
        }

        mat-form-field {
            width: 100%;
        }

        .delete {
            margin: 20px;
            margin-left: 30px;
        }

        .download {
            margin-left: 10px;
        }

        button {
            pointer-events: all;
        }

        img {
            opacity: 0.6;
        }

        a, a:visited, a:focus, a:link {
            color: rgb(192, 210, 255);
        }

        .lds-ripple {
            z-index: 2;
            top: calc(50% - 75px);
            left: calc(50% - 75px);
            display: inline-block;
            position: absolute;
            width: 150px;
            height: 150px;
        }

        .lds-ripple div {
            position: absolute;
            border: 4px solid #fff;
            opacity: 1;
            border-radius: 50%;
            animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }

        .lds-ripple div:nth-child(2) {
            animation-delay: -0.5s;
        }

        @keyframes lds-ripple {
            0% {
                top: 72px;
                left: 72px;
                width: 0;
                height: 0;
                opacity: 1;
            }
            100% {
                top: 0px;
                left: 0px;
                width: 144px;
                height: 144px;
                opacity: 0;
            }
        }

        .hidden {
            display: none;
        }

        .opaque {
            opacity: 0;
        }
    `]
})
export class App {
    bitbybit = new BitByBitBase();
    showSpinner = signal(true);
    bitbybitInitialised = signal(false);

    laptops: Laptop[] = [
        {
            id: Math.random().toString(),
            width: 30.41,
            length: 1.5,
            height: 21.24,
        }
    ];

    scene!: Scene;
    engine!: Engine;
    private laptopService!: LaptopLogic;

    async ngOnInit() {
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        this.engine = new Engine(canvas, true);
        this.engine.setHardwareScalingLevel(0.5);
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0.73, 0.73, 0.73, 1);

        const camera = new ArcRotateCamera("Camera", 1.2, 1.0, 50, new Vector3(0, 11, 5), this.scene);
        camera.attachControl(canvas, true);
        camera.wheelPrecision = 30;
        camera.panningSensibility = 1000;

        const light = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), this.scene);
        light.intensityMode = Light.INTENSITYMODE_ILLUMINANCE;
        light.intensity = 1;

        const pointLight = new PointLight("PointLight", new Vector3(-15, 20, -5), this.scene);
        pointLight.intensity = 8000;
        pointLight.diffuse = new Color3(0.2, 0.2, 1);

        this.scene.metadata = { shadowGenerators: [] };

        const options: InitBitByBitOptions = {
            enableOCCT: true,
            enableJSCAD: false,
            enableManifold: false,
        };

        await initBitByBit(this.scene, this.bitbybit, options);

        // Subscribe to worker state changes for showing/hiding spinner during computations
        this.bitbybit.occtWorkerManager.occWorkerState$.subscribe(s => {
            if (s.state === OccStateEnum.computing) {
                this.showSpinner.set(true);
            } else if (s.state === OccStateEnum.loaded || s.state === OccStateEnum.initialised) {
                this.showSpinner.set(false);
            }
        });

        // OCCT is now initialized, hide spinner and show UI
        this.showSpinner.set(false);
        this.bitbybitInitialised.set(true);
        this.engine.resize();

        this.laptopService = new LaptopLogic(this.bitbybit);
        await this.laptopService.do();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.onresize = () => {
            this.engine?.resize();
        };
    }

    render() {
        if (this.laptopService && this.laptops.length > 0) {
            this.laptopService.render([...this.laptops]);
        }
    }

    downloadStep() {
        this.laptopService?.downloadStep();
    }

    downloadStl() {
        this.laptopService?.downloadStl();
    }

    add() {
        this.laptops.push({
            id: Math.random().toString(),
            width: 30.41,
            length: 1.5,
            height: 21.24,
        });
        this.render();
    }

    remove(laptop: Laptop) {
        this.laptops = this.laptops.filter(l => l.id !== laptop.id);
        this.render();
    }
}

bootstrapApplication(App, {
    providers: [provideAnimations()]
});
