import { Inputs, type BitByBitBase } from "@bitbybit-dev/threejs";
import {
    CARPORT, CARPORT_DECK_BOTTOM, DOOR_TYPES, DOORS, FIRST_FLOOR_ELEVATION, HARD_SURFACES, LAYER_SETS, MATERIALS, PASSAGES, PROPERTY_SETS, ROOF, ROOMS, SLABS, TERRAIN_OUTLINE, TREES, WALL_RUNS, WINDOW_TYPES, WINDOWS, rect,
} from "./house-plan";
import { houseDetails } from "./details";
import type { DetailSpec, HouseModel, Layer } from "./house-types";

type Model = Inputs.IFC.IfcModelPointer;

const FRAME = { frameMaterial: "Anthracite aluminium", glassMaterial: "Clear glass", frameThickness: 0.07, frameDepth: 0.09, glassThickness: 0.03 };
const LINING = { liningThickness: 0.06, liningDepth: 0.12, panelThickness: 0.05 };

export class HouseAuthor {
    private model!: Model;
    private readonly layers = new Map<string, Layer>();
    private readonly bitbybit: BitByBitBase;
    private readonly progress: (message: string) => void;

    constructor(bitbybit: BitByBitBase, progress: (message: string) => void) {
        this.bitbybit = bitbybit;
        this.progress = progress;
    }

    async build(): Promise<HouseModel> {
        const ifc = this.bitbybit.ifc;
        this.progress("Setting up the project");
        this.model = await ifc.model.create({ name: "Family house", lengthUnit: Inputs.IFC.lengthUnitEnum.metre, seed: "ifc-family-house" });
        this.model = await ifc.spatial.addStorey({ model: this.model, id: "ground", name: "Ground floor", elevation: 0 });
        this.model = await ifc.spatial.addStorey({ model: this.model, id: "first", name: "First floor", elevation: FIRST_FLOOR_ELEVATION });
        await this.addMaterials();
        this.progress("Raising the walls");
        await this.addWalls();
        this.progress("Laying the floors");
        await this.addSlabs();
        this.progress("Fitting windows and doors");
        await this.addWindowsAndDoors();
        this.progress("Roofing and the carport");
        await this.addRoof();
        await this.addCarport();
        this.progress("Cladding, flashings, the stair and the solar array");
        await this.addDetails(houseDetails());
        this.progress("Shaping the garden");
        await this.addSite();
        this.progress("Naming the rooms");
        await this.addRooms();
        await this.addProperties();
        this.progress("Measuring quantities");
        this.model = await ifc.quantities.compute({ model: this.model });
        return { model: this.model, layers: await this.layersByGlobalId(), rooms: ROOMS };
    }

    private remember(id: string, layer: Layer): string {
        this.layers.set(id, layer);
        return id;
    }

    private async layersByGlobalId(): Promise<Map<string, Layer>> {
        const entries = await Promise.all([...this.layers].map(async ([id, layer]) => [await this.bitbybit.ifc.model.globalIdOf({ model: this.model, id }), layer] as const));
        return new Map(entries);
    }

    private async addMaterials(): Promise<void> {
        const ifc = this.bitbybit.ifc;
        for (const material of MATERIALS) {
            this.model = await ifc.materials.add({ model: this.model, ...material });
        }
        for (const layerSet of LAYER_SETS) {
            this.model = await ifc.materials.addLayerSet({ model: this.model, ...layerSet });
        }
        for (const type of WINDOW_TYPES) {
            this.model = await ifc.windows.addType({ model: this.model, ...type, ...FRAME });
        }
        for (const type of DOOR_TYPES) {
            this.model = await ifc.doors.addType({
                model: this.model, id: type.id, name: type.name, width: type.width, height: type.height, ...LINING, operation: type.operation,
                liningMaterial: type.lining, panelMaterial: type.panel, handle: type.handle, handleMaterial: type.handleMaterial,
            });
        }
    }

    private async addWalls(): Promise<void> {
        const ifc = this.bitbybit.ifc;
        for (const run of WALL_RUNS) {
            const layer: Layer = run.storey === "ground" ? "ground" : "first";
            for (const wall of run.walls) {
                this.model = await ifc.walls.add({
                    model: this.model, storey: run.storey, id: this.remember(wall.id, layer), name: wall.name, start: wall.start, end: wall.end,
                    height: wall.height ?? run.height, baseOffset: run.baseOffset, layerSet: run.layerSet, alignment: run.alignment,
                    predefinedType: run.external ? Inputs.IFC.wallPredefinedTypeEnum.standard : Inputs.IFC.wallPredefinedTypeEnum.partitioning,
                });
            }
            for (const [wall, other] of run.joins) {
                this.model = await ifc.walls.connect({ model: this.model, wall, other });
            }
        }
    }

    private async addSlabs(): Promise<void> {
        for (const slab of SLABS) {
            this.model = await this.bitbybit.ifc.slabs.add({
                model: this.model, storey: slab.storey, id: this.remember(slab.id, slab.layer), name: slab.name,
                outline: slab.outline, holes: slab.holes, layerSet: slab.layerSet, topOffset: slab.topOffset, predefinedType: slab.kind,
            });
        }
    }

    private layerOfWall(wall: string): Layer {
        return this.layers.get(wall) ?? "ground";
    }

    private async addWindowsAndDoors(): Promise<void> {
        const ifc = this.bitbybit.ifc;
        for (const window of WINDOWS) {
            this.model = await ifc.windows.add({ model: this.model, wall: window.wall, windowType: window.type, id: this.remember(window.id, this.layerOfWall(window.wall)), name: window.name, offset: window.offset, sill: window.sill });
        }
        for (const door of DOORS) {
            this.model = await ifc.doors.add({ model: this.model, wall: door.wall, doorType: door.type, id: this.remember(door.id, this.layerOfWall(door.wall)), name: door.name, offset: door.offset, sill: door.sill });
        }
        for (const passage of PASSAGES) {
            this.model = await ifc.openings.add({ model: this.model, wall: passage.wall, id: passage.id, name: passage.name, offset: passage.offset, sill: 0, width: passage.width, height: passage.height });
        }
    }

    private async addRoof(): Promise<void> {
        this.model = await this.bitbybit.ifc.roofs.add({
            model: this.model, storey: "first", id: this.remember(ROOF.id, "roof"), name: ROOF.name,
            outline: ROOF.outline, kind: Inputs.IFC.roofKindEnum.flat, layerSet: ROOF.layerSet, baseOffset: ROOF.baseOffset,
        });
    }

    private async addCarport(): Promise<void> {
        const ifc = this.bitbybit.ifc;
        const { x0, x1, y0, y1, beam, post } = CARPORT;
        this.model = await ifc.roofs.add({
            model: this.model, storey: "ground", id: this.remember("carport-roof", "garden"), name: "Carport roof",
            outline: rect(x0 + beam.width, y0 + beam.width, x1, y1 - beam.width), kind: Inputs.IFC.roofKindEnum.flat, layerSet: "Carport roof", baseOffset: CARPORT_DECK_BOTTOM,
        });
        const corners: Inputs.Base.Point2[] = [[x0 + post / 2, y0 + post / 2], [x0 + post / 2, y1 - post / 2]];
        for (const [index, position] of corners.entries()) {
            this.model = await ifc.columns.add({
                model: this.model, storey: "ground", id: this.remember(`carport-post-${index + 1}`, "garden"), name: "Carport post",
                position, height: CARPORT.clearance, width: post, depth: post, material: "Blackened steel",
            });
        }
    }

    private async addDetails(details: DetailSpec[]): Promise<void> {
        const { profileKindEnum, memberPredefinedTypeEnum } = Inputs.IFC;
        for (const detail of details) {
            const common = {
                model: this.model, storey: detail.storey, id: this.remember(detail.id, detail.layer), name: detail.name, start: detail.start, end: detail.end, material: detail.material,
                profile: detail.radius === undefined ? profileKindEnum.rectangle : profileKindEnum.circle, width: detail.width, depth: detail.depth, radius: detail.radius, rotation: detail.rotation ?? 0,
            };
            this.model = detail.beam
                ? await this.bitbybit.ifc.beams.add(common)
                : await this.bitbybit.ifc.members.add({ ...common, predefinedType: detail.kind ?? memberPredefinedTypeEnum.member });
        }
    }

    private async addSite(): Promise<void> {
        const site = this.bitbybit.ifc.site;
        this.model = await site.addTerrain({ model: this.model, id: this.remember("terrain", "garden"), name: "Garden", outline: TERRAIN_OUTLINE, holes: [HARD_SURFACES], material: "Lawn" });
        for (const tree of TREES) {
            this.model = await site.addTree({
                model: this.model, id: this.remember(tree.id, "garden"), name: tree.species, species: tree.species, position: tree.position,
                height: tree.height, crownRadius: tree.crown, trunkRadius: tree.trunk, crownMaterial: tree.foliage, trunkMaterial: tree.bark,
            });
        }
    }

    private async addRooms(): Promise<void> {
        for (const room of ROOMS) {
            this.model = await this.bitbybit.ifc.spaces.add({ model: this.model, storey: room.storey, id: room.id, name: room.number, longName: room.name, outline: room.outline, height: room.height });
        }
    }

    private async addProperties(): Promise<void> {
        for (const set of PROPERTY_SETS) {
            this.model = await this.bitbybit.ifc.properties.addSet({ model: this.model, elements: set.elements, name: set.name, properties: set.properties });
        }
    }
}
