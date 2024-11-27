import { ShapesHelperService } from "./shapes-helper.service";


describe("OCCT shapes helper unit tests", () => {

    let service: ShapesHelperService;

    beforeAll(async () => {
        service = new ShapesHelperService();
    });

    it("should have service defined", () => {
        expect(service).toBeDefined();
    });

    it("should create inverted L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLInverted(1, 2, 3, 4);
        expect(res).toEqual([
            [0, 0, 0],
            [2, 0, 0],
            [2, 0, 1],
            [1.999999, 0, 1],
            [1.999999, 0, 4],
            [0, 0, 4]
        ]);
    });

    it("should create inverted L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLInverted(4, 2, 3, 1);
        expect(res).toEqual([
            [0, 0, 0],
            [2, 0, 0],
            [2, 0, 0.999999],
            [1.999999, 0, 0.999999],
            [1.999999, 0, 1],
            [0, 0, 1]
        ]);
    });

    it("should create middle L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLMiddle(1, 2, 3, 4);
        expect(res).toEqual([
            [0.9999995, 0, 0.5],
            [0.9999995, 0, 4],
            [-0.9999995, 0, 4],
            [-0.9999995, 0, -0.5],
            [2, 0, -0.5],
            [2, 0, 0.5]
        ]);
    });

    it("should create middle L polygon when width first is larger or equal to length first", () => {
        const res = service.polygonLMiddle(4, 2, 3, 1);
        expect(res).toEqual([
            [0.9999995, 0, 0.4999995],
            [0.9999995, 0, 1],
            [-0.9999995, 0, 1],
            [-0.9999995, 0, -0.4999995],
            [2, 0, -0.4999995],
            [2, 0, 0.4999995]
        ]);
    });
});
