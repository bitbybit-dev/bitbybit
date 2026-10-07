import { describe, expect, it } from "vitest";
import * as Inputs from "./index";

type AnyDto = new (...args: never[]) => object;

const DTOS: [string, AnyDto][] = [
    ["ModelDto", Inputs.IFC.ModelDto<unknown>],
    ["CreateModelDto", Inputs.IFC.CreateModelDto],
    ["ReadModelDto", Inputs.IFC.ReadModelDto],
    ["WriteModelDto", Inputs.IFC.WriteModelDto<unknown>],
    ["ElementsDto", Inputs.IFC.ElementsDto<unknown>],
    ["ElementDto", Inputs.IFC.ElementDto<unknown>],
    ["SetAttributeDto", Inputs.IFC.SetAttributeDto<unknown>],
    ["GetAttributeDto", Inputs.IFC.GetAttributeDto<unknown>],
    ["GlobalIdOfDto", Inputs.IFC.GlobalIdOfDto<unknown>],
    ["MoveElementDto", Inputs.IFC.MoveElementDto<unknown>],
    ["AddStoreyDto", Inputs.IFC.AddStoreyDto<unknown>],
    ["AddMaterialDto", Inputs.IFC.AddMaterialDto<unknown>],
    ["MaterialLayerDto", Inputs.IFC.MaterialLayerDto],
    ["AddLayerSetDto", Inputs.IFC.AddLayerSetDto<unknown>],
    ["StoreyInfoDto", Inputs.IFC.StoreyInfoDto],
    ["SetStoreyElevationDto", Inputs.IFC.SetStoreyElevationDto<unknown>],
    ["AddSpaceDto", Inputs.IFC.AddSpaceDto<unknown>],
    ["SpacesDto", Inputs.IFC.SpacesDto<unknown>],
    ["SpaceInfoDto", Inputs.IFC.SpaceInfoDto],
    ["ElementInfoDto", Inputs.IFC.ElementInfoDto],
    ["ModelSummaryDto", Inputs.IFC.ModelSummaryDto],
    ["AddWallDto", Inputs.IFC.AddWallDto<unknown>],
    ["ConnectWallsDto", Inputs.IFC.ConnectWallsDto<unknown>],
    ["ClipWallDto", Inputs.IFC.ClipWallDto<unknown>],
    ["ClipWallByRoofDto", Inputs.IFC.ClipWallByRoofDto<unknown>],
    ["AddWallTypeDto", Inputs.IFC.AddWallTypeDto<unknown>],
    ["WallDto", Inputs.IFC.WallDto<unknown>],
    ["EditWallDto", Inputs.IFC.EditWallDto<unknown>],
    ["WallJoinInfoDto", Inputs.IFC.WallJoinInfoDto],
    ["WallParametersDto", Inputs.IFC.WallParametersDto],
    ["AddOpeningDto", Inputs.IFC.AddOpeningDto<unknown>],
    ["EditOpeningDto", Inputs.IFC.EditOpeningDto<unknown>],
    ["AddSlabOpeningDto", Inputs.IFC.AddSlabOpeningDto<unknown>],
    ["AddDoorTypeDto", Inputs.IFC.AddDoorTypeDto<unknown>],
    ["AddWindowTypeDto", Inputs.IFC.AddWindowTypeDto<unknown>],
    ["AddDoorDto", Inputs.IFC.AddDoorDto<unknown>],
    ["AddWindowDto", Inputs.IFC.AddWindowDto<unknown>],
    ["AddSlabDto", Inputs.IFC.AddSlabDto<unknown>],
    ["AddRoofDto", Inputs.IFC.AddRoofDto<unknown>],
    ["AddColumnDto", Inputs.IFC.AddColumnDto<unknown>],
    ["AddBeamDto", Inputs.IFC.AddBeamDto<unknown>],
    ["AddMemberDto", Inputs.IFC.AddMemberDto<unknown>],
    ["AddTerrainDto", Inputs.IFC.AddTerrainDto<unknown>],
    ["AddTreeDto", Inputs.IFC.AddTreeDto<unknown>],
    ["PropertyDto", Inputs.IFC.PropertyDto],
    ["AddPropertySetDto", Inputs.IFC.AddPropertySetDto<unknown>],
    ["SetPropertyValuesDto", Inputs.IFC.SetPropertyValuesDto<unknown>],
    ["RemovePropertyValuesDto", Inputs.IFC.RemovePropertyValuesDto<unknown>],
    ["RemovePropertySetDto", Inputs.IFC.RemovePropertySetDto<unknown>],
    ["PropertySetInfoDto", Inputs.IFC.PropertySetInfoDto],
    ["ComputeQuantitiesDto", Inputs.IFC.ComputeQuantitiesDto<unknown>],
    ["QuantitySetInfoDto", Inputs.IFC.QuantitySetInfoDto],
    ["GeometryDto", Inputs.IFC.GeometryDto<unknown>],
    ["GeometryProblemDto", Inputs.IFC.GeometryProblemDto],
];

const BASE_CLASSES = ["MemberSharedDto"];

const sentinels = (count: number): never[] => Array.from({ length: count }, (_, index) => ({ argument: index })) as never[];

describe("the IFC input DTOs", () => {
    it("should all be listed here, so each is checked below", () => {
        // Arrange
        const exported = Object.entries(Inputs.IFC).filter(([name, value]) => name.endsWith("Dto") && typeof value === "function").map(([name]) => name);

        // Assert
        expect([...DTOS.map(([name]) => name), ...BASE_CLASSES].sort()).toEqual(exported.sort());
    });

    describe("constructed with nothing", () => {
        it.each(DTOS)("%s should carry no property it left undefined", (_name, Dto) => {
            // Act
            const built = new Dto();

            // Assert
            expect(Object.entries(built).filter(([, value]) => value === undefined)).toEqual([]);
        });
    });

    describe("constructed with values", () => {
        it.each(DTOS)("%s should hold every value its constructor was given", (_name, Dto) => {
            // Arrange
            const values = sentinels(Dto.length);

            // Act
            const built = new Dto(...values);

            // Assert
            expect(Object.values(built)).toEqual(expect.arrayContaining(values));
        });

        it.each(DTOS)("%s should give each value a property of its own", (_name, Dto) => {
            // Arrange
            const values = sentinels(Dto.length);

            // Act
            const built = new Dto(...values);
            const held = Object.values(built).filter((value) => (values as unknown[]).includes(value));

            // Assert
            expect(held).toHaveLength(values.length);
        });
    });
});
