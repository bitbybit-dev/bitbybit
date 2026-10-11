import type { IfcModel } from "../index";

export interface ValidationFixture {
    name: string;
    build: () => IfcModel;
}

export interface ValidationStatement {
    level: string;
    message: string;
    instance?: string;
    attribute?: string | null;
}

export interface RegeneratedWall {
    name: string;
    globalId: string;
    ours: number;
    regenerated: number | null;
    problem: string | null;
}

export interface GeometryFailure {
    globalId: string;
    type: string;
    problem: string;
}

export interface MeasuredVolume {
    globalId: string;
    type: string;
    ours: number;
    measured: number | null;
    curved: boolean;
}

export interface ValidationReport {
    file: string;
    statements: ValidationStatement[];
    geometryFailures: GeometryFailure[];
    volumes: MeasuredVolume[];
    walls: RegeneratedWall[];
    clippedWalls: number;
}
