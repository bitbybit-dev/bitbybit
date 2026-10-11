export class UnsupportedGeometryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnsupportedGeometryError";
    }
}
