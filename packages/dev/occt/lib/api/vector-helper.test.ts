import { Inputs } from ".";
import { VectorHelperService } from "./vector-helper.service";


describe("OCCT vector helper unit tests", () => {

    let service: VectorHelperService;

    beforeAll(async () => {
        service = new VectorHelperService();
    });

    it("should convert degrees to radians", () => {
        expect(service.degToRad(180)).toBe(Math.PI);
    });

    it("should remap value", () => {
        expect(service.remap(5, 0, 10, 0, 100)).toBe(50);
    });

    it("should remove all duplicate vectors", () => {
        const vectors = [[1, 2, 3], [1, 2, 3], [1, 2, 3]];
        expect(service.removeAllDuplicateVectors(vectors)).toEqual([[1, 2, 3]]);
    });

    it("should compute average vector", () => {
        const vectors = [[1, 2, 3], [2, 3, 4], [3, 4, 5]];
        expect(service.averageVector(vectors)).toEqual([2, 3, 4]);
    });

    it("should compute magnitude of the vector", () => {
        const vector = [1, 2, 3];
        expect(service.magnitude(vector)).toEqual(Math.sqrt(14));
    });

    it("should normalize vector", () => {
        const vector = [1, 2, 3];
        const magnitude = service.magnitude(vector);
        expect(service.normalize(vector)).toEqual([1 / magnitude, 2 / magnitude, 3 / magnitude]);
    });

    it("should translate point", () => {
        const point = [1, 2, 3] as Inputs.Base.Point3;
        const vector = [1, 2, 3] as Inputs.Base.Vector3;
        const distance = 2;
        const res = service.translatePoint(point, vector, distance);
        expect(res).toEqual([3, 6, 9]);
    });

    it("should check if vectors are the same", () => {
        const vec1 = [1, 2, 3];
        const vec2 = [1, 2, 3, 6];
        const res = service.vectorsTheSame(vec1, vec2, 1e-7);
        expect(res).toEqual(false);
    });

    it("should remove all duplicates", () => {
        const vectors = [[1, 2, 3], [2, 5, 6], [1, 2, 3], [2, 5, 6], [1, 2, 3]];
        const res = service.removeAllDuplicateVectors(vectors);
        expect(res).toEqual([[1, 2, 3], [2, 5, 6]]);
    });

    it("should remove consecutive duplicates", () => {
        const vectors = [[1, 2, 3], [2, 5, 6], [1, 2, 3], [2, 5, 6], [1, 2, 3]];
        const res = service.removeConsecutiveDuplicates(vectors,);
        expect(res).toEqual([[1, 2, 3], [2, 5, 6], [1, 2, 3], [2, 5, 6]]);
    });

    it("should do nothing just return single vector when removing consecutive duplicates", () => {
        const vectors = [[1, 2, 3]];
        const res = service.removeConsecutiveDuplicates(vectors);
        expect(res).toEqual([[1, 2, 3]]);
    });
});
