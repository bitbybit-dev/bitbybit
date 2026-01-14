import './style.css';
import { BitByBitBase, Inputs, initBitByBit, type InitBitByBitOptions } from '@bitbybit-dev/babylonjs';
import { model, current } from './models';
import {
    initBabylonJS,
    createGui,
    createShapeLod1,
    createShapeLod2,
    createDirLightsAndGround,
    disableGUI,
    enableGUI,
    hideSpinner,
    showSpinner,
    downloadGLB,
    downloadSTL,
    downloadStep,
} from './helpers';

const options: InitBitByBitOptions = {
    enableOCCT: true,
    enableJSCAD: false,
    enableManifold: false,
};

start();

async function start() {
    const { scene, engine } = initBabylonJS();

    const bitbybit = new BitByBitBase();

    await initBitByBit(scene, bitbybit, options);
    
    createDirLightsAndGround(bitbybit, current);

    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    const shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];

    model.downloadStep = () => downloadStep(bitbybit, finalShape);
    model.downloadGLB = () => downloadGLB(bitbybit);
    model.downloadSTL = () => downloadSTL(bitbybit, finalShape);

    createGui(current, model, updateShape);

    const rotationSpeed = 0.0005;
    const rotateGroup = () => {
        if (
            model.rotationEnabled &&
            current.group1 &&
            current.group2 &&
            current.dimensions
        ) {
            current.group1.rotation.y -= rotationSpeed;
            current.group2.rotation.y -= rotationSpeed;
            current.dimensions.rotation.y -= rotationSpeed;
        }
    };

    scene.onBeforeRenderObservable.add(() => rotateGroup());

    engine.runRenderLoop(() => {
        scene.render(true, false);
    });

    finalShape = await createShapeLod1(
        bitbybit,
        scene,
        model,
        shapesToClean,
        current
    );

    async function updateShape(finish: boolean) {
        disableGUI();
        showSpinner();
        current.group1?.dispose(false, true);
        current.group2?.dispose(false, true);
        current.dimensions?.dispose(false, true);

        if (finish) {
            finalShape = await createShapeLod2(
                bitbybit,
                scene,
                model,
                shapesToClean,
                current
            );
        } else {
            finalShape = await createShapeLod1(
                bitbybit,
                scene,
                model,
                shapesToClean,
                current
            );
        }
        hideSpinner();
        enableGUI();
    }
}
