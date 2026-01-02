import { PlayCanvas } from "./playcanvas";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";

describe("PlayCanvas unit tests", () => {
    let playcanvas: PlayCanvas;
    let mockContext: Context;
    let mockDrawHelper: DrawHelper;

    beforeEach(() => {
        mockContext = {
            app: null,
            scene: null,
        } as Context;

        mockDrawHelper = {} as DrawHelper;

        playcanvas = new PlayCanvas(mockContext, mockDrawHelper);
    });

    describe("Constructor initialization", () => {
        it("should create a PlayCanvas instance", () => {
            expect(playcanvas).toBeDefined();
            expect(playcanvas).toBeInstanceOf(PlayCanvas);
        });

        it("should initialize camera service", () => {
            expect(playcanvas.camera).toBeDefined();
        });

        it("should have context reference", () => {
            expect((playcanvas as any).context).toBe(mockContext);
        });

        it("should have drawHelper reference", () => {
            expect((playcanvas as any).drawHelper).toBe(mockDrawHelper);
        });
    });

    describe("Service integration", () => {
        it("should have camera with orbitCamera sub-service", () => {
            expect(playcanvas.camera.orbitCamera).toBeDefined();
        });
    });
});
