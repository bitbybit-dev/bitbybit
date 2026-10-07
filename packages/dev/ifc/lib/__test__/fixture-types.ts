import type { IFCService } from "../api/ifc-service";
import type { EntityWriter } from "../build/entity-writer";
import type { IfcModel } from "../model/model-types";
import type { ModelSnapshot } from "../model/snapshot";
import type { IfcTransaction } from "../model/transaction";

export type Random = () => number;

export interface AxisPlacement {
    readonly relativeTo: number | null;
    readonly location: number[];
    readonly axis: number[] | null;
    readonly refDirection: number[] | null;
}

export interface UnwrappedBody {
    readonly solid: number;
    readonly clippings: number[];
    readonly halfSpaces: number[];
}

export interface Fixture {
    readonly ifc: IFCService;
    readonly model: IfcModel;
}

export interface Writing {
    readonly tx: IfcTransaction;
    readonly writer: EntityWriter;
}

export interface ExtrudedWall {
    readonly model: ModelSnapshot;
    readonly context: number;
    readonly shape: number;
    readonly placement: number;
    readonly wall: number;
}
