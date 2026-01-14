import "./style.css";
import { BitByBitBase, Inputs, initBitByBit, type InitBitByBitOptions } from "@bitbybit-dev/playcanvas";
import { model, current } from "./models";
import {
    initPlayCanvas,
    setupOrbitCamera,
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
} from "./helpers";

const options: InitBitByBitOptions = {
    enableOCCT: true,
    enableJSCAD: false,
    enableManifold: false,
};

start();

async function start() {
    const { app, scene, camera } = initPlayCanvas();
    createDirLightsAndGround(scene, current);

    const bitbybit = new BitByBitBase();
    await initBitByBit(app, scene, bitbybit, options);

    // Setup orbit camera controls
    setupOrbitCamera(bitbybit, camera);

    let finalShape: Inputs.OCCT.TopoDSShapePointer | undefined;
    const shapesToClean: Inputs.OCCT.TopoDSShapePointer[] = [];

    model.downloadStep = () => downloadStep(bitbybit, finalShape);
    model.downloadGLB = () => downloadGLB(scene);
    model.downloadSTL = () => downloadSTL(scene);

    createGui(current, model, updateShape);

    const rotationSpeed = 0.0005;
    const rotateGroup = () => {
        if (
            model.rotationEnabled &&
            current.group1 &&
            current.group2 &&
            current.dimensions
        ) {
            const euler1 = current.group1.getEulerAngles();
            current.group1.setEulerAngles(euler1.x, euler1.y - rotationSpeed * 180 / Math.PI, euler1.z);
            
            const euler2 = current.group2.getEulerAngles();
            current.group2.setEulerAngles(euler2.x, euler2.y - rotationSpeed * 180 / Math.PI, euler2.z);
            
            const euler3 = current.dimensions.getEulerAngles();
            current.dimensions.setEulerAngles(euler3.x, euler3.y - rotationSpeed * 180 / Math.PI, euler3.z);
        }
    };

    app.on("update", () => {
        rotateGroup();
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
        
        // Destroy previous entities
        if (current.group1) {
            current.group1.destroy();
        }
        if (current.group2) {
            current.group2.destroy();
        }
        if (current.dimensions) {
            current.dimensions.destroy();
        }
        
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
