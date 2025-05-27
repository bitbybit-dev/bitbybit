<script lang="ts" setup>
import { ref } from 'vue'
import { BitByBitBase } from '@bitbybit-dev/babylonjs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Scene, Engine, Color4, HemisphericLight, Vector3, ArcRotateCamera, Light } from '@babylonjs/core';

onMounted(async () => {
    const bitbybit = new BitByBitBase();
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

    const engine = new Engine(canvas);
    engine.setHardwareScalingLevel(0.5);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(26 / 255, 28 / 255, 31 / 255, 1);
    const camera = new ArcRotateCamera('Camera', 1.3, 1.3, 20, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    const light = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), scene);
    light.intensityMode = Light.INTENSITYMODE_ILLUMINANCE;
    light.intensity = 1;
    scene.metadata = { shadowGenerators: [] };

    const occt = new Worker(new URL('./occ.worker', import.meta.url), { name: 'OCC', type: 'module' })

    bitbybit.init(scene, occt);

    engine.runRenderLoop(() => {
        scene.render();
    });

    bitbybit.occtWorkerManager.occWorkerState$.subscribe(s => {
    
        if (s.state === OccStateEnum.initialised) {
                engine.resize();
                
                const start = async()=>{
                    const sphere = await bitbybit.occt.shapes.solid.createSphere({
                        radius: 5,
                        center: [0,0,0]
                    });

                    const circle = await bitbybit.occt.shapes.wire.createCircleWire({
                        radius: 10,
                        center: [0,0,0],
                        direction: [0,1,0],
                    });

                    const points = await bitbybit.occt.shapes.wire.pointsOnWireAtPatternOfLengths({
                        shape: circle,
                        lengths: [0.1,0.3,0.4],
                        includeFirst: true,
                        includeLast: false,
                        tryNext: false
                    })

                    bitbybit.draw.drawAnyAsync({
                        entity: sphere
                    });

                    bitbybit.draw.drawAnyAsync({
                        entity: circle
                    });

                    bitbybit.draw.drawAnyAsync({
                        entity: points
                    });
                }

                start();
                engine.runRenderLoop(() => {
                    scene.render();
                });
            } else if (s.state === OccStateEnum.computing) {
                // Show Spinner
            } else if (s.state === OccStateEnum.loaded) {
                // Show Spinner
            }
    });
})

</script>

<template>
    <canvas id="renderCanvas"></canvas>
</template>

<style>
    #renderCanvas {
        width: 100%;
        height: 100%;
        border: none;
    }
</style>