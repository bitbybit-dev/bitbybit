import React, { useEffect, useState } from 'react';
import './App.css';
import { BitByBitBase } from '@bitbybit-dev/babylonjs';
import { OccStateEnum } from '@bitbybit-dev/occt-worker';
import { Scene, Engine, Color4, HemisphericLight, Vector3, ArcRotateCamera, Light } from '@babylonjs/core';
import { LaptopLogic, Laptop } from './laptop';
import { Button, TextField } from '@mui/material';
import { Add, Delete, Download, Menu } from '@mui/icons-material';
import { usePrevious } from './use-previous';


function App() {

    const [laptops, setLaptops] = useState<Laptop[]>([{
        id: Math.random().toString(),
        width: 30.41,
        length: 1.5,
        height: 21.24,
    }])
    const prevLaptops = usePrevious(laptops);

    const [menuVisible, setMenuVisible] = useState<boolean>(true);
    const [showSpinner, setShowSpinner] = useState<boolean>(true);
    const [bitByBitInitialised, setBitByBitInitialised] = useState<boolean>(false);
    const [laptopLogic, setLaptopLogic] = useState<LaptopLogic>(undefined);

    useEffect(() => {

        const bitbybit = new BitByBitBase();
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

        const engine = new Engine(canvas);
        engine.setHardwareScalingLevel(0.5);
        const scene = new Scene(engine);
        scene.clearColor = new Color4(26 / 255, 28 / 255, 31 / 255, 1);
        const camera = new ArcRotateCamera('Camera', 0, 10, 10, new Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        const light = new HemisphericLight('HemiLight', new Vector3(0, 1, 0), scene);
        light.intensityMode = Light.INTENSITYMODE_ILLUMINANCE;
        light.intensity = 1;
        scene.metadata = { shadowGenerators: [] };

        const occt = new Worker(new URL('./occ.worker', import.meta.url), { name: 'OCC', type: 'module' })
        const jscad = new Worker(new URL('./jscad.worker', import.meta.url), { name: 'JSCAD', type: 'module' })

        bitbybit.init(scene, occt, jscad);

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
                const ll = new LaptopLogic(bitbybit);
                setLaptopLogic(ll)
                ll.do();
            } else if (s.state === OccStateEnum.computing) {
                setShowSpinner(true);
            } else if (s.state === OccStateEnum.loaded) {
                setShowSpinner(false);
            }
        });
    }, [])

    const render = (renderableLaptops: Laptop[]) => {
        if (laptopLogic && renderableLaptops && renderableLaptops.length > 0 && ((prevLaptops && laptopsNotTheSame(prevLaptops, renderableLaptops)) || (!prevLaptops))) {
            laptopLogic.render(renderableLaptops);
        }
    }

    const handleLaptopChange = (event, type: 'width' | 'length' | 'height', laptop: Laptop) => {
        const val = event.target.value;
        let value;
        if (val !== '') {
            value = +val;
            if (value < 0) {
                value = 0.1;
            } else if (value > 1000) {
                value = 1000;
            }
        } else {
            value = '';
        }
        const lap = { ...laptop };
        switch (type) {
            case 'width':
                lap.width = value;
                break;
            case 'length':
                lap.length = value;
                break;
            case 'height':
                lap.height = value;
                break;
            default:
                break;
        }
        setLaptops([...laptops.map(l => l.id === laptop.id ? lap : l)])
    }

    const laptopsNotTheSame = (prev: Laptop[], current: Laptop[]) => {
        let result = false;
        if (prev.length !== current.length) {
            result = true;
        } else {
            prev.forEach((c) => {
                const laptop = laptops.find(s => s.id === c.id);
                if (!laptop) {
                    result = true;
                } else if (laptop.width !== c.width || laptop.height !== c.height || laptop.length !== c.length) {
                    result = true;
                }
            })
        }
        return result;
    }

    const downloadStep = () => {
        laptopLogic.downloadStep();
    }

    const downloadStl = () => {
        laptopLogic.downloadStl();
    }

    const del = (laptop) => {
        const remainingLaptops = [...laptops.filter(l => l.id !== laptop.id)];
        setLaptops(remainingLaptops);
        render(remainingLaptops);
    }

    const add = () => {
        const newLaptops = [...laptops, {
            id: Math.random().toString(),
            width: 30.41,
            length: 1.5,
            height: 21.24,
        }];
        setLaptops(newLaptops);
        render(newLaptops);
    }

    return (
        <div className="App">
            <div className="main">
                {showSpinner &&
                    <div className="lds-ellipsis">
                        <div></div><div></div><div></div><div></div>
                    </div>
                }
                <canvas id="renderCanvas" className={bitByBitInitialised ? '' : 'opaque'}>
                </canvas>
            </div>
            <div className="content">
                <div className="menu">
                    <div className="actions buttons-non-mobile">
                        <Button variant="contained" disabled={showSpinner} onClick={add}>Add Laptop</Button>
                        <Button variant="contained" onClick={downloadStep}>Download STEP</Button>
                        <Button variant="contained" onClick={downloadStl}>Download STL</Button>
                    </div>
                    <div className="actions buttons-mobile">
                        <Button variant="contained" disabled={showSpinner} onClick={add}><Add />Add</Button>
                        <Button variant="contained" onClick={downloadStep}><Download />STEP</Button>
                        <Button variant="contained" onClick={downloadStl}><Download />STL</Button>
                    </div>
                    <Button variant="contained" onClick={() => setMenuVisible(!menuVisible)}><Menu /></Button>
                </div>
                {menuVisible &&
                    <>
                        <div className="explanation">
                            <h1>LAPTOP HOLDER</h1>
                            <h2>Configurator</h2>
                            <div className="scrolling">
                                <p>
                                    <img width="100%" src="lapholders1.jpeg" alt="3d printed laptop holder" />
                                </p>
                                <p>
                                    The application allows you to configure custom multi slot laptop holder. Choose how many laptops you want and adjust the basic dimensions. Save your file and use it for 3D printing.
                                </p>
                                <p>
                                    This application also serves as an example which demonstrates possibilities to integrate Bit by bit developers
                                    platform in
                                    your own websites, configurators or webshops. We have recently released our core algorithms as an <a rel="noreferrer" href="https://www.npmjs.com/package/@bitbybit-dev/core" target="_blank">npm package</a>.
                                    If you are the beginner you can use our <a rel="noreferrer" href="https://bitbybit.dev" target="_blank">bitbybit.dev</a> platform to learn to use the API and construct parametric geometries.
                                    If you are professional, consider exploring our <a href="docs.bitbybit.dev" rel="noreferrer" target="_blank">bitbybit.dev API</a>.
                                </p>
                                <p>
                                    By downloading STEP file you can easily 3D print it. To understand how to do that and learn how the
                                    script works you can enroll in this free course on our school at <a rel="noreferrer"
                                        href="https://school.bitbybit.dev/p/programming-vertical-laptop-holder-in-typescript" target="_blank">school.bitbybit.dev</a>
                                </p>
                            </div>
                        </div>
                        <div className="space"></div>
                        <div className="interaction" >
                            <div className="interaction-content scrolling">
                                {
                                    laptops.map((laptop, index) => {
                                        return (
                                            <div key={laptop.id}>
                                                <div>
                                                    Laptop Nr. {index + 1}
                                                    <div className="delete">
                                                        <Button variant="contained" onClick={() => del(laptop)}><Delete /></Button>
                                                    </div>
                                                </div>
                                                <div className="input">
                                                    <TextField size="small" label="Width" variant="outlined" type="number" value={laptop.width} onChange={(e) => {
                                                        handleLaptopChange(e, 'width', laptop)
                                                    }} onBlur={() => render(laptops)} />
                                                </div>
                                                <div className="input">
                                                    <TextField size="small" label="Length" variant="outlined" type="number" value={laptop.length} onChange={(e) => {
                                                        handleLaptopChange(e, 'length', laptop)
                                                    }} onBlur={() => render(laptops)} />
                                                </div>
                                                <div className="input">
                                                    <TextField size="small" label="Height" variant="outlined" type="number" value={laptop.height} onChange={(e) => {
                                                        handleLaptopChange(e, 'height', laptop)
                                                    }} onBlur={() => render(laptops)} />
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div >
                    </>
                }
            </div >
        </div >
    );
}

export default App;
