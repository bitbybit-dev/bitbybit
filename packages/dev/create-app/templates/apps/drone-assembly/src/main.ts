import "./style.css";
import type { Mesh, Object3D } from "three";
import { ACESFilmicToneMapping, Color, Group, Matrix4, MeshPhysicalMaterial, PMREMGenerator, Vector3 } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BitByBitBase, Inputs, initBitByBit, initThreeJS, type InitBitByBitOptions } from "@bitbybit-dev/threejs";
import { billOfMaterials, buildDocument, Z_UP, type BuiltDocument } from "./assembly";
import { downloadBlob } from "./exports";
import type { Shape, Transform } from "./kernel";
import { edgeColour, materialSpec, type FinishId, type MaterialId } from "./materials";
import { buildModel, defaultParams, FLIGHT_CEILING, partOf, type DroneModel, type DroneParams, type Part } from "./model";
import { mountPoint, mountUi, ROTOR_RPM, type ExportFormat } from "./ui";

const LOGO_URL = "https://git-cdn.bitbybit.dev/latest/assets/logo/logo-faces.stp";

const EDGE_WIDTH = 2;

const FLIGHT = { approach: 1.6, bob: 5, bobHz: 0.35, sway: 0.03, swayHz: 0.21 };

void start();

function isMesh(object: Object3D): object is Mesh {
    return "isMesh" in object && object.isMesh === true;
}

function required<T>(value: T | undefined, what: string): T {
    if (value === undefined) throw new Error(`${what} is missing`);
    return value;
}

function cameraOptions(sceneSize: number): Inputs.ThreeJSCamera.OrbitCameraDto {
    const camera = new Inputs.ThreeJSCamera.OrbitCameraDto();
    camera.distance = sceneSize * Math.SQRT2;
    camera.distanceMin = sceneSize * 0.02;
    camera.distanceMax = sceneSize * 10;
    return camera;
}

async function start(): Promise<void> {
    const sceneOptions = new Inputs.ThreeJSScene.InitThreeJSDto();
    sceneOptions.canvasId = "three-canvas";
    sceneOptions.sceneSize = 500;
    sceneOptions.groundScaleFactor = 5;
    sceneOptions.backgroundColor = "#15171a";
    sceneOptions.enableGround = true;
    sceneOptions.groundColor = "#24272b";
    sceneOptions.enableShadows = true;
    sceneOptions.shadowMapSize = 2048;
    sceneOptions.directionalLightIntensity = 2.2;
    sceneOptions.hemisphereLightIntensity = 0.6;
    sceneOptions.orbitCameraOptions = cameraOptions(sceneOptions.sceneSize);
    const { scene, renderer, orbitCamera, startAnimationLoop } = initThreeJS(sceneOptions);

    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;

    const bitbybit = new BitByBitBase();
    const options: InitBitByBitOptions = {
        enableOCCT: true,
        enableJSCAD: false,
        enableManifold: false,
    };
    await initBitByBit(scene, bitbybit, options);

    let params: DroneParams = { ...defaultParams };
    let current: DroneModel | undefined;
    let generation = 0;
    let timer: number | undefined;
    let framedFor = 0;
    let rotorSpeed = (ROTOR_RPM.initial * 2 * Math.PI) / 60;
    let throttle = ROTOR_RPM.initial / ROTOR_RPM.max;
    let edgesVisible = true;
    let flight = 0;
    let clock = 0;

    const materials = new Map<MaterialId, MeshPhysicalMaterial>();
    const prototypes = new Map<string, Group>();
    const root = new Group();
    root.name = "Drone";
    scene.add(root);
    const propellers: { object: Object3D; handed: 1 | -1 }[] = [];

    startAnimationLoop((deltaTime) => {
        clock += deltaTime;
        for (const propeller of propellers) propeller.object.rotation.y += propeller.handed * rotorSpeed * deltaTime;
        const target = FLIGHT_CEILING * throttle;
        flight += (target - flight) * Math.min(1, FLIGHT.approach * deltaTime);
        if (flight < 0.05 && target === 0) flight = 0;
        const airborne = flight / FLIGHT_CEILING;
        root.position.y = flight + Math.sin(2 * Math.PI * FLIGHT.bobHz * clock) * FLIGHT.bob * airborne;
        root.rotation.z = Math.sin(2 * Math.PI * FLIGHT.swayHz * clock) * FLIGHT.sway * airborne;
        root.rotation.x = Math.sin(2 * Math.PI * FLIGHT.swayHz * 1.37 * clock + 1) * FLIGHT.sway * 0.7 * airborne;
    });

    const ui = mountUi(mountPoint("panel"), params, {
        onChange: (next) => {
            params = next;
            window.clearTimeout(timer);
            timer = window.setTimeout(() => void rebuild(), 120);
        },
        onSpeed: (rpm) => {
            rotorSpeed = (rpm * 2 * Math.PI) / 60;
            throttle = rpm / ROTOR_RPM.max;
        },
        onEdges: (next) => { edgesVisible = next; showEdges(root); },
        onExport: (format) => void exportModel(format),
    });

    function materialFor(id: MaterialId, finish: FinishId): MeshPhysicalMaterial {
        let material = materials.get(id);
        if (!material) {
            material = new MeshPhysicalMaterial();
            material.name = id;
            material.clearcoatRoughness = 0.12;
            materials.set(id, material);
        }
        const spec = materialSpec(id, finish);
        material.color = new Color(spec.colour);
        material.metalness = spec.metalness;
        material.roughness = spec.roughness;
        material.clearcoat = spec.clearcoat;
        material.emissive = new Color(spec.emissive ?? "#000000");
        material.emissiveIntensity = spec.emissive ? 1.6 : 0;
        return material;
    }

    function prototypeKey(part: Part, finish: FinishId): string {
        return `${part.key}|${edgeColour(materialSpec(part.material, finish).colour)}`;
    }

    async function prototypeFor(part: Part, finish: FinishId): Promise<Group> {
        const key = prototypeKey(part, finish);
        const kept = prototypes.get(key);
        if (kept) return kept;
        const lines = edgeColour(materialSpec(part.material, finish).colour);
        const drawOptions = new Inputs.Draw.DrawOcctShapeOptions();
        drawOptions.precision = 0.05;
        drawOptions.faceMaterial = materialFor(part.material, finish);
        drawOptions.drawFaces = part.kind === "solid";
        drawOptions.drawEdges = true;
        drawOptions.edgeColour = lines;
        drawOptions.edgeWidth = part.kind === "wires" ? EDGE_WIDTH * 0.75 : EDGE_WIDTH;
        drawOptions.drawTwoSided = false;
        const drawn = await bitbybit.draw.drawAnyAsync({ entity: part.shape, options: drawOptions });
        scene.remove(drawn);
        drawn.traverse((object) => {
            if (!isMesh(object) || object.material === drawOptions.faceMaterial) return;
            if (part.kind === "solid") object.userData["edges"] = true;

            for (const lineMaterial of Array.isArray(object.material) ? object.material : [object.material]) {
                lineMaterial.polygonOffset = true;
                lineMaterial.polygonOffsetFactor = -1;
                lineMaterial.polygonOffsetUnits = -2;
            }
        });
        for (const [other, old] of prototypes) {
            if (other.split(/[:|]/)[0] === part.id) { disposeGeometry(old); prototypes.delete(other); }
        }
        prototypes.set(key, drawn);
        return drawn;
    }

    function place(object: Object3D, placement: Transform): void {
        object.matrix.identity();
        for (const step of placement) object.matrix.premultiply(new Matrix4().fromArray(step));
        object.matrix.decompose(object.position, object.quaternion, object.scale);
    }

    function instanceClone(model: DroneModel, protos: Map<string, Group>, node: Extract<DroneModel["nodes"][number], { kind: "instance" }>): Group {
        const part = partOf(model.parts, node.partId);
        const clone = required(protos.get(prototypeKey(part, model.params.finish)), `the drawn prototype of ${part.id}`).clone();
        clone.name = node.name;
        place(clone, node.placement);
        if (node.material) {
            const base = materials.get(part.material);
            const override = materialFor(node.material, model.params.finish);
            clone.traverse((object) => { if (isMesh(object) && object.material === base) object.material = override; });
        }
        return clone;
    }

    function assemble(model: DroneModel, protos: Map<string, Group>): void {
        root.clear();
        propellers.length = 0;
        const groups = new Map<string, Object3D>([["drone", root]]);
        const templates = new Map<string, Group>();
        for (const node of model.nodes) {
            if (node.kind === "definition") {
                const template = new Group();
                template.name = node.name;
                templates.set(node.id, template);
                groups.set(node.id, template);
            }
        }
        for (const node of model.nodes) {
            if (node.kind === "definition") continue;
            const parent = required(groups.get(node.parentId ?? "drone"), `the parent group of ${node.id}`);
            if (node.kind === "module") {
                const group = new Group();
                group.name = node.name;
                place(group, node.placement);
                parent.add(group);
                groups.set(node.id, group);
            } else if (node.kind === "instance") {
                const clone = instanceClone(model, protos, node);
                parent.add(clone);
                if (node.partId === "propeller-cw") propellers.push({ object: clone, handed: -1 });
                if (node.partId === "propeller-ccw") propellers.push({ object: clone, handed: 1 });
            }
        }
        for (const node of model.nodes) {
            if (node.kind !== "reference") continue;
            const copy = required(templates.get(node.definitionId), `the ${node.definitionId} definition`).clone();
            copy.name = node.name;
            place(copy, node.placement);
            required(groups.get(node.parentId), `the parent group of ${node.id}`).add(copy);
        }
        showEdges(root);
    }

    function showEdges(object: Object3D): void {
        object.traverse((child) => { if (child.userData["edges"]) child.visible = edgesVisible; });
    }

    async function withDocument<T>(model: DroneModel, frame: Transform | undefined, use: (built: BuiltDocument) => Promise<T>): Promise<T> {
        const built = await buildDocument(bitbybit.occt, model, frame);
        try {
            return await use(built);
        } finally {
            for (const document of [built.document, ...built.sources]) await bitbybit.occt.assembly.manager.deleteDocument({ document });
        }
    }

    async function rebuild(): Promise<void> {
        const mine = ++generation;
        const started = performance.now();
        ui.setStatus(current ? "Rebuilding..." : "Building 27 parts on the OpenCascade kernel...");
        try {
            const model = await buildModel(bitbybit.occt, params, logo, current);
            if (mine !== generation) return;
            ui.setParams(model.params);
            for (const material of materials.keys()) materialFor(material, model.params.finish);
            const protos = new Map<string, Group>();
            for (const part of model.parts) protos.set(prototypeKey(part, model.params.finish), await prototypeFor(part, model.params.finish));
            if (mine !== generation) return;
            assemble(model, protos);
            current = model;
            frame(model);
            const bom = await withDocument(model, undefined, ({ document }) => billOfMaterials(bitbybit.occt, document));
            ui.setBom(bom, model.counts.bolts);
            ui.setStatus(`${bom.parts} parts placed ${bom.instances} times in ${model.counts.modules} sub-assemblies, one leg placed ${model.counts.references} times, ${((performance.now() - started) / 1000).toFixed(1)} s.`);
        } catch (error) {
            ui.setStatus(`Could not build the drone: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async function exportModel(format: ExportFormat): Promise<void> {
        if (!current) return;
        const name = `drone-${current.params.arms}-arms-${current.params.armLength}mm`;
        ui.setStatus(`Writing the ${format.toUpperCase()} assembly...`);
        const manager = bitbybit.occt.assembly.manager;
        const bytes = await withDocument(current, format === "step" ? Z_UP : undefined, ({ document }) => format === "step"
            ? manager.exportDocumentToStep({ document, fileName: `${name}.step`, author: "Drone assembly", organization: "bitbybit.dev", compress: false, tryDownload: false })
            : manager.exportDocumentToGltf({ document, meshDeflection: 0.05, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: true, forceUVExport: false, fileName: `${name}.glb`, tryDownload: false }));
        downloadBlob(new Blob([bytes as BlobPart], { type: format === "step" ? "application/step" : "model/gltf-binary" }), `${name}.${format}`);
        ui.setStatus(`${format.toUpperCase()} downloaded: ${(bytes.byteLength / 1024).toFixed(0)} kB with the part tree, names and colours.`);
    }

    function frame(model: DroneModel): void {
        const extent = model.params.armLength + model.params.propDiameter / 2;
        if (!orbitCamera || (framedFor > 0 && Math.abs(extent - framedFor) / framedFor < 0.3)) return;
        framedFor = extent;
        const distance = extent * 2.2;
        const target = new Vector3(0, model.lift + FLIGHT_CEILING / 2, 0);
        orbitCamera.orbitCamera.resetAndLookAtPoint(new Vector3(distance * 0.55, target.y + distance * 0.42, distance * 0.7), target);
    }

    function disposeGeometry(group: Group): void {
        group.traverse((object) => { if (isMesh(object)) object.geometry.dispose(); });
    }

    async function fetchLogo(): Promise<Shape | undefined> {
        try {
            const response = await fetch(LOGO_URL);
            if (!response.ok) return undefined;
            const text = await response.text();
            return await bitbybit.occt.io.loadSTEPorIGESFromText({ text, fileType: Inputs.OCCT.fileTypeEnum.step, adjustZtoY: true });
        } catch {
            return undefined;
        }
    }

    const logo = await fetchLogo();
    if (!logo) ui.setStatus("The emblem was skipped: the logo could not be fetched from the CDN.");
    await rebuild();
}
