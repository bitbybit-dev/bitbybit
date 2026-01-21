import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { BitByBitBase } from "./bitbybit.js";

const bitbybit = new BitByBitBase();

async function run() {
    await bitbybit.init();
}

run();

dotenv.config();

const app: Express = express();
const port = process.env.PORT;


app.get("/", (req: Request, res: Response) => {
    if (bitbybit) {
        const cube = bitbybit.occt?.shapes.solid.createCube({ size: 3, center: [0, 0, 0] });
        const stepTXT = bitbybit.occt?.io.saveShapeSTEP({
            shape: cube,
            fileName: "cube.step",
            adjustYtoZ: true,
            tryDownload: false,
        });
        res.send(`${stepTXT}`);
    } else {
        res.send("OCC not initialised");
    }
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});