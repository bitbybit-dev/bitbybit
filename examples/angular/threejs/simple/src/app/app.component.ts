import { Component } from "@angular/core";
import { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";
import { OccStateEnum } from "@bitbybit-dev/occt-worker";

import {
    Color,
    Fog,
    HemisphereLight,
    PerspectiveCamera,
    Scene,
    Vector3,
    VSMShadowMap,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.css"],
})
export class AppComponent {

    bitbybit = new BitByBitBase();

    showSpinner = true;
    bitbybitInitialised = false;

    scene: Scene;

    ngOnInit() {
        const start = async () => {
            const domNode = document.getElementById(
                "three-canvas"
            ) as HTMLCanvasElement;

            const occt = new Worker(new URL("./occ.worker", import.meta.url), { name: "OCC", type: "module" });
            const jscad = new Worker(new URL("./jscad.worker", import.meta.url), { name: "JSCAD", type: "module" });

            const camera = new PerspectiveCamera(
                70,
                window.innerWidth / window.innerHeight,
                0.01,
                1000
            );
            this.scene = new Scene();
            this.scene.fog = new Fog(0x1a1c1f, 15, 60);
            const light = new HemisphereLight(0xffffff, 0x000000, 10);
            this.scene.add(light);
            await this.bitbybit.init(this.scene, occt, undefined);

            const renderer = new WebGLRenderer({ antialias: true, canvas: domNode });
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio / 1.5);
            const animation = () => {
                if (this.scene) {
                    renderer.render(this.scene, camera);
                }
                controls.update();
            };

            const controls = new OrbitControls(camera, renderer.domElement);
            camera.position.set(15, 20, 15);

            controls.update();
            controls.target = new Vector3(0, 5, 0);
            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            controls.zoomSpeed = 0.1;

            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = VSMShadowMap;

            const onWindowResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener("resize", onWindowResize, false);

            renderer.setClearColor(new Color(0x1a1c1f), 1);

            this.bitbybit.init(this.scene, occt, jscad);

            this.bitbybit.occtWorkerManager.occWorkerState$.subscribe(async s => {
                if (s.state === OccStateEnum.initialised) {
                    this.showSpinner = false;
                    this.bitbybitInitialised = true;

                    renderer.setAnimationLoop(animation);

                    const cube = await this.bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
                    const filletCube = await this.bitbybit.occt.fillets.filletEdges({ shape: cube, radius: 3  });

                    const options = new Inputs.Draw.DrawOcctShapeOptions();
                    options.faceColour = "#0000ff";
                    this.bitbybit.draw.drawAnyAsync({ entity: filletCube, options });

                    const jscadCube = await this.bitbybit.jscad.shapes.cube({ size: 5, center: [0, 15, 0] });
                    this.bitbybit.draw.drawAnyAsync({ entity: jscadCube, options: undefined });

                } else if (s.state === OccStateEnum.computing) {
                    this.showSpinner = true;
                } else if (s.state === OccStateEnum.loaded) {
                    this.showSpinner = false;
                }
            });

        };
        start();
    }

}
