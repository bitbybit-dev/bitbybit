import React, { useEffect, useState } from 'react';
import './App.css';
import { BitByBitBase } from '@bitbybit-dev/babylonjs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Scene, Engine, Color4, HemisphericLight, Vector3, ArcRotateCamera, Light } from '@babylonjs/core';
import { CupLogic } from './cup';
import { Button, Slider } from '@mui/material';

function App() {

    const [showSpinner, setShowSpinner] = useState<boolean>(true);
    const [bitByBitInitialised, setBitByBitInitialised] = useState<boolean>(false);

    const [cupLogic, setCupLogic] = useState<CupLogic>(undefined);

    const [cupHeight, setCupHeight] = useState<number>(13);
    const [cupRadius, setCupRadius] = useState<number>(4.5);
    const [cupThickness, setCupThickness] = useState<number>(1);
    const [cupHandleDistance, setHandleDistance] = useState<number>(2);
    const [cupHandleHeight, setHandleHeight] = useState<number>(0.5);

    useEffect(() => {

        const bitbybit = new BitByBitBase();
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

        const engine = new Engine(canvas);
        const scene = new Scene(engine);
        engine.setHardwareScalingLevel(0.5);
        scene.clearColor = new Color4(26 / 255, 28 / 255, 31 / 255, 1);
        const camera = new ArcRotateCamera('Camera', 0, 10, 10, new Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        const light = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), scene);
        light.intensityMode = Light.INTENSITYMODE_ILLUMINANCE;
        light.intensity = 1;
        scene.metadata = { shadowGenerators: [] };

        const occt = new Worker(new URL('./occ.worker', import.meta.url), { name: 'OCC', type: 'module' })

        bitbybit.init(scene, occt, undefined);

        engine.runRenderLoop(() => {
            scene.render();
        });

        window.onresize = () => {
            if (engine) {
                engine.resize();
            }
        }

        bitbybit.occtWorkerManager.occWorkerState$.subscribe(s => {
            if (s.state === OccStateEnum.initialised) {
                setShowSpinner(false);
                setBitByBitInitialised(true);
                engine.resize();
                const cl = new CupLogic(bitbybit);

                engine.runRenderLoop(() => {
                    scene.render();
                });
                cl.initScene(engine);
                setCupLogic(cl)
                cl.compute(cupHeight, cupRadius, cupThickness, cupHandleDistance, cupHandleHeight);
            } else if (s.state === OccStateEnum.computing) {
                setShowSpinner(true);
            } else if (s.state === OccStateEnum.loaded) {
                setShowSpinner(false);
            }
        });
    }, [])

    const downloadStep = () => {
        cupLogic.downloadStep();
    }

    const downloadStl = () => {
        cupLogic.downloadStl();
    }

    const recompute = () => {
        if (!showSpinner) {
            cupLogic.compute(cupHeight, cupRadius, cupThickness, cupHandleDistance, cupHandleHeight)
        }
    }

    return (
        <div className="App">
            <div className="main">
                {showSpinner &&
                    <div className="lds-ripple">
                        <div></div>
                        <div></div>
                    </div>
                }
                <canvas id="renderCanvas" className={bitByBitInitialised ? '' : 'opaque'}>
                </canvas>
            </div>
            <div className="content">
                <div className="explanation">
                    <h1>CUP</h1>
                    <h2>Configurator</h2>
                    <div className="scrolling">
                        <p>
                            The application allows you to configure a custom cup for your coffee or tea. Choose any combination of parameters to get proprtions that you want. Save your file and use it for 3D printing.
                        </p>
                        <p>
                            This application also serves as an example which demonstrates possibilities to integrate Bit by bit developers
                            platform in
                            your own websites, configurators or webshops. We have recently released our core algorithms as an <a rel="noreferrer" href="https://www.npmjs.com/package/@bitbybit-dev/core" target="_blank">npm package</a>.
                            If you are the beginner you can use our <a rel="noreferrer" href="https://bitbybit.dev" target="_blank">bitbybit.dev</a> platform to learn to use the API and construct parametric geometries.
                            If you are professional, consider exploring our <a href="docs.bitbybit.dev" rel="noreferrer" target="_blank">bitbybit.dev API</a>.
                        </p>
                        <p>
                            By downloading STEP file you can easily 3D print it.
                        </p>
                    </div>
                </div>
                <div className="space"></div>
                <div className="interaction" >
                    <div>
                        <h2>
                            Cup Parameters
                        </h2>
                        <div className="input">
                            <h3>Cup Height ({cupHeight} cm )</h3>
                            <Slider disabled={showSpinner} aria-label="Height"
                                valueLabelDisplay="auto"
                                step={0.01} min={6} max={16} value={cupHeight}
                                onChange={(e) => setCupHeight(+(e.target as any).value)} onChangeCommitted={recompute}
                            />
                        </div>
                        <div className="input">
                            <h3>Cup Radius ({cupRadius} cm )</h3>
                            <Slider disabled={showSpinner} aria-label="Radius"
                                valueLabelDisplay="auto"
                                step={0.01} min={3} max={8} value={cupRadius}
                                onChange={(e) => setCupRadius(+(e.target as any).value)} onChangeCommitted={recompute}
                            />
                        </div>
                        <div className="input">
                            <h3>Cup Thickness ({cupThickness} cm )</h3>
                            <Slider disabled={showSpinner} aria-label="Thickness"
                                valueLabelDisplay="auto"
                                step={0.01} min={0.5} max={1} value={cupThickness}
                                onChange={(e) => setCupThickness(+(e.target as any).value)} onChangeCommitted={recompute}
                            />
                        </div>
                        <div className="input">
                            <h3>Handle Length ({cupHandleDistance} cm)</h3>
                            <Slider disabled={showSpinner} aria-label="Handle Length"
                                valueLabelDisplay="auto"
                                step={0.01} min={0.3} max={cupRadius} value={cupHandleDistance}
                                onChange={(e) => setHandleDistance(+(e.target as any).value)} onChangeCommitted={recompute}
                            />
                        </div>
                        <div className="input">
                            <h3>Handle Height ({cupHandleHeight})</h3>
                            <Slider disabled={showSpinner} aria-label="Handle Height"
                                valueLabelDisplay="auto"
                                step={0.01} min={0} max={1} value={cupHandleHeight}
                                onChange={(e) => setHandleHeight(+(e.target as any).value)} onChangeCommitted={recompute}
                            />
                        </div>
                        <div className="actions">
                            <Button disabled={showSpinner} variant="contained" onClick={downloadStep}>Download STEP</Button>
                            <Button disabled={showSpinner} variant="contained" onClick={downloadStl}>Download STL</Button>
                        </div>
                    </div>

                </div >
            </div >
        </div >
    );
}

export default App;
