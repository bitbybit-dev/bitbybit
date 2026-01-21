import { BitByBitBase, Inputs } from "@bitbybit-dev/babylonjs";
import { OCCTW } from "@bitbybit-dev/core";

interface Laptop {
    width: number;
    length: number;
    height: number;
    center?: Inputs.Base.Point3;
}

export class LaptopLogic {
    private bitbybit: BitByBitBase;
    private occt: OCCTW;

    private laptops: Laptop[] = [
        {
            width: 30.41,
            length: 1.5,
            height: 21.24,
        }
    ];

    private laptopStand: Inputs.OCCT.TopoDSShapePointer | undefined;
    private laptopStandMesh: any;
    private laptopsFilletsMesh: any[] = [];

    private controlPoints: Inputs.Base.Point3[] = [
        [-12.5, 0, 0],
        [-8, 13, 0],
        [-4, 11, 0],
        [-2, 6, 0],
        [2, 6, 0],
        [4, 14, 0],
        [8, 17, 0],
        [12.5, 0, 0]
    ];

    private whiteColor = "#ffffff";
    private holderColor = "#333333";
    private laptopLiftedHeight = 3;
    private distanceBetweenLaptops = 1.7;

    constructor(bitbybit: BitByBitBase) {
        this.bitbybit = bitbybit;
        this.occt = bitbybit.occt;
    }

    async renderLaptops(laptops: Laptop[]) {
        laptops.forEach(laptop => {
            laptop.center = [0, laptop.height / 2 + this.laptopLiftedHeight, 0];
        });

        const laptopFillets: Inputs.OCCT.TopoDSShapePointer[] = [];
        let totalDistance = 0;
        let previousLaptopLength = 0;

        for (const laptop of laptops) {
            totalDistance += this.distanceBetweenLaptops + laptop.length / 2 + previousLaptopLength / 2;
            previousLaptopLength = laptop.length;
            laptop.center![2] = totalDistance;
            
            const laptopBaseModel = await this.occt.shapes.solid.createBox({
                width: laptop.width,
                length: laptop.length,
                height: laptop.height,
                center: laptop.center!
            });
            const laptopFillet = await this.occt.fillets.filletEdges({ shape: laptopBaseModel, radius: 0.2 });
            laptopFillets.push(laptopFillet);

            const laptopVisModel = await this.occt.shapes.solid.createBox({
                width: laptop.width,
                length: laptop.length - 0.01,
                height: laptop.height,
                center: laptop.center!
            });
            const laptopVisFillet = await this.occt.fillets.filletEdges({ shape: laptopVisModel, radius: 0.2 });

            const di = new Inputs.OCCT.DrawShapeDto();
            di.faceOpacity = 0.2;
            di.edgeWidth = 5;
            di.edgeOpacity = 0.6;
            di.edgeColour = this.whiteColor;
            di.faceColour = this.whiteColor;
            di.drawTwoSided = false;
            const laptopFilletMesh = await this.bitbybit.draw.drawAnyAsync({ entity: laptopVisFillet, options: di });
            this.laptopsFilletsMesh.push(laptopFilletMesh);
        }

        const polygonWire = await this.occt.shapes.wire.createPolygonWire({
            points: this.controlPoints
        });
        
        totalDistance += this.distanceBetweenLaptops + previousLaptopLength / 2;
        const extrusion = await this.occt.operations.extrude({
            shape: polygonWire, 
            direction: [0, 0, totalDistance]
        });
        const laptopStandFillet = await this.occt.fillets.filletEdges({ shape: extrusion, radius: 1 });
        const laptopStandThick = await this.occt.operations.makeThickSolidSimple({ shape: laptopStandFillet, offset: -0.5 });

        this.laptopStand = await this.occt.booleans.difference({ shape: laptopStandThick, shapes: laptopFillets, keepEdges: false });
        
        const li = new Inputs.OCCT.DrawShapeDto(this.laptopStand);
        li.faceOpacity = 1;
        li.faceColour = this.holderColor;
        li.edgeColour = this.whiteColor;
        li.edgeWidth = 5;
        li.drawTwoSided = false;
        this.laptopStandMesh = await this.bitbybit.draw.drawAnyAsync({ entity: this.laptopStand, options: li });
    }

    async do() {
        this.laptopsFilletsMesh = [];
        await this.renderLaptops(this.laptops);

        // Draw ground
        const ground = await this.bitbybit.occt.shapes.face.createCircleFace({ 
            center: [0, 0, 0], 
            direction: [0, 1, 0], 
            radius: 75 
        });
        const groundOptions = new Inputs.Draw.DrawOcctShapeOptions();
        groundOptions.faceColour = this.whiteColor;
        groundOptions.drawEdges = false;
        await this.bitbybit.draw.drawAnyAsync({ entity: ground, options: groundOptions });
    }

    downloadStep() {
        if (this.laptopStand) {
            this.occt.io.saveShapeSTEP({ shape: this.laptopStand, fileName: "laptop-stand.step", adjustYtoZ: false });
        }
    }

    downloadStl() {
        if (this.laptopStand) {
            this.occt.io.saveShapeStl({ shape: this.laptopStand, fileName: "laptop-stand", precision: 0.001, adjustYtoZ: false });
        }
    }

    async render(laptops: Laptop[]) {
        // Dispose previous meshes
        if (this.laptopStandMesh) {
            const lap = await this.laptopStandMesh;
            this.bitbybit.babylon.mesh.dispose({ babylonMesh: lap });
        }
        if (this.laptopsFilletsMesh && this.laptopsFilletsMesh.length > 0) {
            const res = await Promise.all(this.laptopsFilletsMesh);
            res.forEach(r => {
                this.bitbybit.babylon.mesh.dispose({ babylonMesh: r });
            });
        }
        this.laptopsFilletsMesh = [];
        this.laptops = laptops;
        await this.renderLaptops(laptops);
    }
}
