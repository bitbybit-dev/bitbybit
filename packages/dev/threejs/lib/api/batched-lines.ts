import * as THREEJS from "three";

const SEGMENT_START = "vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );";
const SEGMENT_END = "vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );";
const MAIN = "void main() {";

const BATCH_DECLARATIONS = `
attribute float instanceBatch;
uniform highp sampler2D batchMatrices;
mat4 batchMatrixOf( const in float batch ) {
	int size = textureSize( batchMatrices, 0 ).x;
	int j = int( batch ) * 4;
	int x = j % size;
	int y = j / size;
	return mat4(
		texelFetch( batchMatrices, ivec2( x, y ), 0 ),
		texelFetch( batchMatrices, ivec2( x + 1, y ), 0 ),
		texelFetch( batchMatrices, ivec2( x + 2, y ), 0 ),
		texelFetch( batchMatrices, ivec2( x + 3, y ), 0 )
	);
}
`;

/**
 * The vertex shader of `LineMaterial` with each segment moved by its own matrix first: the matrix at
 * the segment's `instanceBatch` in the `batchMatrices` texture, four texels per matrix. Every other
 * step of the shader is kept, so the line keeps its width in pixels.
 * @param vertexShader - The vertex shader `LineMaterial` compiles
 * @returns The shader that moves each segment by its matrix
 */
export function batchedLineShader(vertexShader: string): string {
    if (!vertexShader.includes(MAIN) || !vertexShader.includes(SEGMENT_START) || !vertexShader.includes(SEGMENT_END)) {
        throw new Error("The line shader of this three.js version cannot be batched: the steps that place a segment are not where they were.");
    }
    return vertexShader
        .replace(MAIN, `${BATCH_DECLARATIONS}\n${MAIN}`)
        .replace(SEGMENT_START, `mat4 batchMatrix = batchMatrixOf( instanceBatch );\n\t\t\tvec4 start = modelViewMatrix * batchMatrix * vec4( instanceStart, 1.0 );`)
        .replace(SEGMENT_END, "vec4 end = modelViewMatrix * batchMatrix * vec4( instanceEnd, 1.0 );");
}

/**
 * A texture that holds `count` matrices, four texels each, in rows a multiple of four wide, so a
 * matrix never runs across a row: the layout `batchedLineShader` reads.
 * @param count - How many matrices the texture holds
 * @returns The texture, its matrices all zero
 */
export function matricesTexture(count: number): THREEJS.DataTexture {
    const size = Math.max(4, Math.ceil(Math.sqrt(count * 4) / 4) * 4);
    const texture = new THREEJS.DataTexture(new Float32Array(size * size * 4), size, size, THREEJS.RGBAFormat, THREEJS.FloatType);
    texture.needsUpdate = true;
    return texture;
}

/**
 * Writes `matrices`, each 16 numbers in column-major order, into the texture from its start, in
 * order, and marks it for upload.
 * @param texture - A texture `matricesTexture` made
 * @param matrices - The matrices to write
 */
export function writeMatrices(texture: THREEJS.DataTexture, matrices: readonly (readonly number[])[]): void {
    const data = texture.image.data as Float32Array;
    matrices.forEach((matrix, index) => {
        data.set(matrix, index * 16);
    });
    texture.needsUpdate = true;
}
