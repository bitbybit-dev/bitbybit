import { describe, expect, it } from "vitest";
import { modelOf } from "../api/services/service-support";
import { modelOfRows } from "../__test__/geometry-fixtures";
import { MATERIAL_ASSOCIATION } from "./constants";
import { relatingOf, relationshipsOf } from "./relationships";

const PROXIES = 40;
const FIRST_PROXY = 100;

function globalIdOf(at: number): string {
    return `0${String(at).padStart(21, "0")}`;
}

function associationRows(related: readonly number[]): string[] {
    const proxies = Array.from({ length: PROXIES }, (_, at) => `#${FIRST_PROXY + at}=IFCBUILDINGELEMENTPROXY('${globalIdOf(at)}',$,$,$,$,$,$,$,$);`);
    return [
        ...proxies,
        "#10=IFCMATERIAL('Steel',$,$);",
        "#11=IFCMATERIAL('Wood',$,$);",
        `#20=IFCRELASSOCIATESMATERIAL('1${"0".repeat(21)}',$,$,$,(${related.map((id) => `#${id}`).join(",")}),#10);`,
        `#21=IFCRELASSOCIATESMATERIAL('2${"0".repeat(21)}',$,$,$,(#${FIRST_PROXY + 1}),#11);`,
    ];
}

describe("relatingOf", () => {
    it("should find the material of every object a long association names, and of one a short association names", () => {
        // Arrange
        const all = Array.from({ length: PROXIES }, (_, at) => FIRST_PROXY + at).filter((id) => id !== FIRST_PROXY + 1);
        const model = modelOf(modelOfRows(associationRows(all)));

        // Act
        const materials = Array.from({ length: PROXIES }, (_, at) => relatingOf(model, MATERIAL_ASSOCIATION, FIRST_PROXY + at));

        // Assert
        expect(materials).toEqual(Array.from({ length: PROXIES }, (_, at) => (at === 1 ? 11 : 10)));
    });

    it("should find no material for an object no association names, and the association of the material", () => {
        // Arrange
        const model = modelOf(modelOfRows(associationRows(Array.from({ length: PROXIES - 2 }, (_, at) => FIRST_PROXY + 2 + at))));

        // Act
        const material = relatingOf(model, MATERIAL_ASSOCIATION, FIRST_PROXY);

        // Assert
        expect(material).toBeUndefined();
        expect(relationshipsOf(model, MATERIAL_ASSOCIATION, 10)).toEqual([20]);
    });
});
