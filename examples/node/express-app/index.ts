import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { BitByBitBase } from "./bitbybit";

dotenv.config();

const bitbybit = new BitByBitBase();
let initialized = false;

async function run() {
    console.log("Initializing BitByBit with OCCT, JSCAD, and Manifold kernels...");
    await bitbybit.init();
    initialized = true;
    console.log("BitByBit initialized successfully!");
}

run();

const app: Express = express();
const port = process.env.PORT || 3000;

// Endpoint demonstrating OCCT capabilities
app.get("/", (req: Request, res: Response) => {
    if (!initialized) {
        res.send("BitByBit is still initializing...");
        return;
    }

    const cube = bitbybit.occt.shapes.solid.createCube({ size: 3, center: [0, 0, 0] });
    const stepTXT = bitbybit.occt.io.saveShapeSTEP({
        shape: cube,
        fileName: "cube.step",
        adjustYtoZ: true,
        tryDownload: false,
    });
    res.send(`OCCT STEP output:\n${stepTXT}`);
});

// Endpoint demonstrating math utilities
app.get("/math", (req: Request, res: Response) => {
    if (!initialized) {
        res.send("BitByBit is still initializing...");
        return;
    }

    const result = {
        remapValue: bitbybit.math.remap({ number: 0.5, fromLow: 0, fromHigh: 1, toLow: 0, toHigh: 100 }),
        randomNumber: bitbybit.math.random(),
    };
    res.json(result);
});

// Endpoint demonstrating vector operations
app.get("/vector", (req: Request, res: Response) => {
    if (!initialized) {
        res.send("BitByBit is still initializing...");
        return;
    }

    const vec1: [number, number, number] = [1, 2, 3];
    const vec2: [number, number, number] = [4, 5, 6];
    const result = {
        add: bitbybit.vector.add({ first: vec1, second: vec2 }),
        cross: bitbybit.vector.cross({ first: vec1, second: vec2 }),
        dot: bitbybit.vector.dot({ first: vec1, second: vec2 }),
        length: bitbybit.vector.length({ vector: vec1 }),
    };
    res.json(result);
});

// Endpoint demonstrating VERB NURBS
app.get("/verb", (req: Request, res: Response) => {
    if (!initialized) {
        res.send("BitByBit is still initializing...");
        return;
    }

    const curve = bitbybit.verb.curve.createBezierCurve({
        points: [[0, 0, 0], [1, 2, 0], [3, 1, 0], [4, 0, 0]],
        weights: [1, 1, 1, 1],
    });
    const point = bitbybit.verb.curve.pointAtParam({ curve, parameter: 0.5 });
    res.json({ curveType: "Bezier", pointAtHalf: point });
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});