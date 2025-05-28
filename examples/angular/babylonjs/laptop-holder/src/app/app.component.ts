import { Component } from '@angular/core';
import { BitByBitBase } from '@bitbybit-dev/babylonjs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Scene, Engine, Color4, Color3, HemisphericLight, Vector3, ArcRotateCamera, Light } from '@babylonjs/core';
import { LaptopLogic } from './laptop';
class Laptop {
    id: string;
    width: number;
    height: number;
    length: number;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {

    bitbybit = new BitByBitBase()

    title = 'trialwebsite';
    showSpinner = true;
    bitbybitInitialised = false;

    prevLaptops: Laptop[];
    laptops: Laptop[] = [
        {
            id: Math.random().toString(),
            width: 30.41,
            length: 1.5,
            height: 21.24,
        }
    ]

    scene: Scene;
    engine: Engine;
    timePassedFromPreviousIteration = 0;

    private laptopService: LaptopLogic;

    renderLoopFunction = () => {
        this.scene.render();
    }

    ngOnInit() {
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

        this.engine = new Engine(canvas);
        this.scene = new Scene(this.engine);
        this.engine.setHardwareScalingLevel(0.5);
        this.scene.clearColor = new Color4(26 / 255, 28 / 255, 31 / 255, 1);
        const camera = new ArcRotateCamera('Camera', 0, 10, 10, new Vector3(0, 0, 0), this.scene);
        camera.attachControl(canvas, true);

        const light = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), this.scene);
        light.intensityMode = Light.INTENSITYMODE_ILLUMINANCE;
        light.intensity = 1;
        this.scene.metadata = { shadowGenerators: [] };

        const occt = new Worker(new URL('./occ.worker', import.meta.url), { name: 'OCC', type: 'module' })
        const jscad = new Worker(new URL('./jscad.worker', import.meta.url), { name: 'JSCAD', type: 'module' })

        this.bitbybit.init(this.scene, occt, jscad);

        this.bitbybit.occtWorkerManager.occWorkerState$.subscribe(s => {
            if (s.state === OccStateEnum.initialised) {
                this.showSpinner = false;
                this.bitbybitInitialised = true;
                this.engine.resize();
                this.laptopService = new LaptopLogic(this.bitbybit);
                this.laptopService.do();
            } else if (s.state === OccStateEnum.computing) {
                this.showSpinner = true;
            } else if (s.state === OccStateEnum.loaded) {
                this.showSpinner = false;
            }
        });

        this.engine.runRenderLoop(this.renderLoopFunction);

        window.onresize = () => {
            if (this.engine) {
                this.engine.resize();
            }
        }
    }

    async jscadDrawBox() {
        const cube = await this.bitbybit.occt.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });
        await this.bitbybit.draw.drawAnyAsync({ entity: cube, options: undefined });
    }

    render() {
        if (!this.prevLaptops || this.laptopsNotTheSame(this.prevLaptops, this.laptops)) {
            this.laptopService.render(this.laptops);
            this.prevLaptops = [...this.laptops.map(l => ({ ...l }))];
        }
    }

    downloadStep() {
        this.laptopService.downloadStep();
    }

    downloadStl() {
        this.laptopService.downloadStl();
    }

    laptopWidthChanged(val, laptop: Laptop) {
        laptop.width = val;
    }

    laptopLengthChanged(val, laptop: Laptop) {
        laptop.length = val;
    }

    laptopHeightChanged(val, laptop: Laptop) {
        laptop.height = val;
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

    remove(laptop) {
        this.laptops = this.laptops.filter(s => s.id !== laptop.id);
        this.render();
    }


    private laptopsNotTheSame(prev: Laptop[], current: Laptop[]) {
        let result = false;
        if (prev.length !== current.length) {
            result = true;
        } else {
            this.prevLaptops.forEach((c) => {
                const laptop = this.laptops.find(s => s.id === c.id);
                if (!laptop) {
                    result = true;
                } else if (laptop.width !== c.width || laptop.height !== c.height || laptop.length !== c.length) {
                    result = true;
                }
            })
        }
        return result;
    }


}
