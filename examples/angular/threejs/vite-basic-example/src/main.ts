import { Component } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { BitByBitBase, Inputs } from "@bitbybit-dev/threejs";
import { initThreeJS } from "./init-threejs";
import { KernelOptions } from "./models/kernel-options";
import { initWithKernels } from "./init-kernels";

@Component({
    selector: "app-root",
    template: `
     <a
      class="logo"
      href="https://bitbybit.dev"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        alt="Logo of Bit by bit developers company"
        src="https://bitbybit.dev/assets/logo-gold-small.png"
      />
      <div>bitbybit.dev</div>
      <br />
      <div>support the mission - subscribe</div>
    </a>
    <canvas id="three-canvas"> </canvas>
  `,
})
export class App {
    name = "Angular";

    ngOnInit() {
        const start = async () => {
            // Initialize basic Three.js scene
            const { scene } = initThreeJS();

            // Create an instance of BitByBitBase for Three.js
            const bitbybit = new BitByBitBase();

            // --- 2. Configure and Initialize Kernels ---
            // Users can control which kernels are loaded
            const kernelOptions: KernelOptions = {
                enableOCCT: true,
                enableJSCAD: true,
                enableManifold: true,
            };
            // Initialize Bitbybit with the selected kernels
            await initWithKernels(scene, bitbybit, kernelOptions);

            // --- 3. Create Geometry with Active Kernels ---
            if (kernelOptions.enableOCCT) {
                await this.createOCCTGeometry(bitbybit, "#ff0000"); // Red
            }
            if (kernelOptions.enableManifold) {
                await this.createManifoldGeometry(bitbybit, "#00ff00"); // Green
            }
            if (kernelOptions.enableJSCAD) {
                await this.createJSCADGeometry(bitbybit, "#0000ff"); // Blue
            }
        };

        start();
    }


    async createOCCTGeometry(bitbybit: BitByBitBase, color: string) {
        console.log("Creating OCCT geometry...");
        const cubeOptions = new Inputs.OCCT.CubeDto();
        cubeOptions.size = 25;
        cubeOptions.center = [0, 0, 0];

        const cube = await bitbybit.occt.shapes.solid.createCube(cubeOptions);

        const filletOptions =
            new Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>();
        filletOptions.shape = cube;
        filletOptions.radius = 4;
        const roundedCube = await bitbybit.occt.fillets.filletEdges(filletOptions);

        const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
        drawOptions.faceColour = color;
        await bitbybit.draw.drawAnyAsync({
            entity: roundedCube,
            options: drawOptions,
        });
        console.log("OCCT geometry created and drawn.");
    }

    async createManifoldGeometry(bitbybit: BitByBitBase, color: string) {
        console.log("Creating Manifold geometry...");
        const sphereOptions = new Inputs.Manifold.SphereDto();
        sphereOptions.radius = 15;
        const sphere = await bitbybit.manifold.manifold.shapes.sphere(
            sphereOptions
        );

        const cubeOptions = new Inputs.Manifold.CubeDto();
        cubeOptions.size = 25;
        const cube = await bitbybit.manifold.manifold.shapes.cube(cubeOptions);

        const diffedShape = await bitbybit.manifold.manifold.booleans.differenceTwo(
            {
                manifold1: cube,
                manifold2: sphere,
            }
        );

        const translationOptions =
            new Inputs.Manifold.TranslateDto<Inputs.Manifold.ManifoldPointer>();
        translationOptions.manifold = diffedShape;
        translationOptions.vector = [0, -40, 0]; // Position below OCCT
        const movedShape = await bitbybit.manifold.manifold.transforms.translate(
            translationOptions
        );

        const drawOptions = new Inputs.Draw.DrawManifoldOrCrossSectionOptions();
        drawOptions.faceColour = color;
        await bitbybit.draw.drawAnyAsync({
            entity: movedShape,
            options: drawOptions,
        });
        console.log("Manifold geometry created and drawn.");
    }

    async createJSCADGeometry(bitbybit: BitByBitBase, color: string) {
        console.log("Creating JSCAD geometry...");
        const geodesicSphereOptions = new Inputs.JSCAD.GeodesicSphereDto();
        geodesicSphereOptions.radius = 15;
        geodesicSphereOptions.center = [0, 40, 0]; // Position above OCCT
        const geodesicSphere = await bitbybit.jscad.shapes.geodesicSphere(
            geodesicSphereOptions
        );

        // Example: Create another simple sphere for a boolean operation
        const sphereOptions = new Inputs.JSCAD.SphereDto();
        sphereOptions.radius = 10; // Smaller sphere
        sphereOptions.center = [5, 45, 0]; // Slightly offset
        const simpleSphere = await bitbybit.jscad.shapes.sphere(sphereOptions);

        const unionOptions = new Inputs.JSCAD.BooleanTwoObjectsDto();
        unionOptions.first = geodesicSphere;
        unionOptions.second = simpleSphere;
        const unionShape = await bitbybit.jscad.booleans.unionTwo(unionOptions);

        const drawOptions = new Inputs.Draw.DrawBasicGeometryOptions();
        drawOptions.colours = color; // Note: 'colours' for JSCAD draw options
        await bitbybit.draw.drawAnyAsync({
            entity: unionShape,
            options: drawOptions,
        });
        console.log("JSCAD geometry created and drawn.");
    }
}

bootstrapApplication(App);
