import { PlayCanvasCamera } from "./camera";
import { Context } from "../../context";

describe("PlayCanvasCamera unit tests", () => {
    let camera: PlayCanvasCamera;
    let mockContext: Context;

    beforeEach(() => {
        mockContext = {
            app: null,
            scene: null,
        } as Context;

        camera = new PlayCanvasCamera(mockContext);
    });

    describe("Constructor initialization", () => {
        it("should create a PlayCanvasCamera instance", () => {
            expect(camera).toBeDefined();
            expect(camera).toBeInstanceOf(PlayCanvasCamera);
        });

        it("should initialize orbitCamera service", () => {
            expect(camera.orbitCamera).toBeDefined();
        });

        it("should have context reference", () => {
            expect((camera as any).context).toBe(mockContext);
        });
    });
});
