/**
 * Mock data for testing geometry drawing functions
 */

/**
 * Creates a mock surface object for Verb NURBS testing
 */
export function createSurfaceMock() {
    return {
        tessellate: () => {
            return {
                points: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [34, -5, 3]],
                normals: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [34, -5, 3]],
                uvs: [[1, 2], [2, 3], [3, 4], [4, 5], [34, -5]],
                faces: [[0, 1, 2], [1, 2, 3], [2, 3, 4]]
            };
        },
        _data: { controlPoints: [], knotsU: 3, knotsV: 4, degreeU: 3, degreeV: 4 },
    };
}

/**
 * Creates a second mock surface object with different data
 */
export function createSurfaceMock2() {
    return {
        tessellate: () => {
            return {
                points: [[1, 3, 3], [2, 5, 4], [3, 6, 5], [3, 5, 6], [3, -5, 3]],
                normals: [[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [34, -5, 3]],
                uvs: [[1, 2], [2, 3], [3, 4], [4, 5], [34, -5]],
                faces: [[0, 1, 2], [1, 2, 3], [2, 3, 4]]
            };
        },
        _data: { controlPoints: [], knotsU: 3, knotsV: 4, degreeU: 3, degreeV: 4 },
    };
}

/**
 * Creates mock OCCT box decomposed mesh data
 */
export function mockOCCTBoxDecomposedMesh() {
    return {
        "faceList": [
            { "vertexCoord": [-0.5, -1, -1.5, -0.5, -1, 1.5, -0.5, 1, -1.5, -0.5, 1, 1.5], "normalCoord": [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0], "uvs": [0, 0, 3, 0, 0, -2, 3, -2], "triIndexes": [0, 1, 2, 2, 1, 3], "vertexCoordVec": [[-0.5, -1, -1.5], [-0.5, -1, 1.5], [-0.5, 1, -1.5], [-0.5, 1, 1.5]], "numberOfTriangles": 2, "centerPoint": [-0.5, 0, 0], "centerNormal": [-1, 0, 0], "faceIndex": 0 },
            { "vertexCoord": [0.5, -1, -1.5, 0.5, -1, 1.5, 0.5, 1, -1.5, 0.5, 1, 1.5], "normalCoord": [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], "uvs": [0, 0, 3, 0, 0, -2, 3, -2], "triIndexes": [1, 0, 2, 1, 2, 3], "vertexCoordVec": [[0.5, -1, -1.5], [0.5, -1, 1.5], [0.5, 1, -1.5], [0.5, 1, 1.5]], "numberOfTriangles": 2, "centerPoint": [0.5, 0, 0], "centerNormal": [1, 0, 0], "faceIndex": 1 },
            { "vertexCoord": [-0.5, -1, -1.5, 0.5, -1, -1.5, -0.5, -1, 1.5, 0.5, -1, 1.5], "normalCoord": [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0], "uvs": [0, 0, 0, 1, 3, 0, 3, 1], "triIndexes": [1, 3, 0, 0, 3, 2], "vertexCoordVec": [[-0.5, -1, -1.5], [0.5, -1, -1.5], [-0.5, -1, 1.5], [0.5, -1, 1.5]], "numberOfTriangles": 2, "centerPoint": [0, -1, 0], "centerNormal": [0, -1, 0], "faceIndex": 2 },
            { "vertexCoord": [-0.5, 1, -1.5, 0.5, 1, -1.5, -0.5, 1, 1.5, 0.5, 1, 1.5], "normalCoord": [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], "uvs": [0, 0, 0, 1, 3, 0, 3, 1], "triIndexes": [3, 1, 0, 3, 0, 2], "vertexCoordVec": [[-0.5, 1, -1.5], [0.5, 1, -1.5], [-0.5, 1, 1.5], [0.5, 1, 1.5]], "numberOfTriangles": 2, "centerPoint": [0, 1, 0], "centerNormal": [0, 1, 0], "faceIndex": 3 },
            { "vertexCoord": [-0.5, -1, -1.5, -0.5, 1, -1.5, 0.5, -1, -1.5, 0.5, 1, -1.5], "normalCoord": [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], "uvs": [0, 0, 0, 2, 1, 0, 1, 2], "triIndexes": [1, 3, 0, 0, 3, 2], "vertexCoordVec": [[-0.5, -1, -1.5], [-0.5, 1, -1.5], [0.5, -1, -1.5], [0.5, 1, -1.5]], "numberOfTriangles": 2, "centerPoint": [0, 0, -1.5], "centerNormal": [0, 0, -1], "faceIndex": 4 },
            { "vertexCoord": [-0.5, -1, 1.5, -0.5, 1, 1.5, 0.5, -1, 1.5, 0.5, 1, 1.5], "normalCoord": [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], "uvs": [0, 0, 0, 2, 1, 0, 1, 2], "triIndexes": [3, 1, 0, 3, 0, 2], "vertexCoordVec": [[-0.5, -1, 1.5], [-0.5, 1, 1.5], [0.5, -1, 1.5], [0.5, 1, 1.5]], "numberOfTriangles": 2, "centerPoint": [0, 0, 1.5], "centerNormal": [0, 0, 1], "faceIndex": 5 }
        ],
        "edgeList": [
            { "vertexCoord": [[-0.5, -1, -1.5], [-0.5, -1, 1.5]], "middlePoint": [-0.5, -1, 0], "edgeIndex": 0 },
            { "vertexCoord": [[-0.5, -1, 1.5], [-0.5, 1, 1.5]], "middlePoint": [-0.5, 0, 1.5], "edgeIndex": 1 },
            { "vertexCoord": [[-0.5, 1, -1.5], [-0.5, 1, 1.5]], "middlePoint": [-0.5, 1, 0], "edgeIndex": 2 },
            { "vertexCoord": [[-0.5, -1, -1.5], [-0.5, 1, -1.5]], "middlePoint": [-0.5, 0, -1.5], "edgeIndex": 3 },
            { "vertexCoord": [[0.5, -1, -1.5], [0.5, -1, 1.5]], "middlePoint": [0.5, -1, 0], "edgeIndex": 4 },
            { "vertexCoord": [[0.5, -1, 1.5], [0.5, 1, 1.5]], "middlePoint": [0.5, 0, 1.5], "edgeIndex": 5 },
            { "vertexCoord": [[0.5, 1, -1.5], [0.5, 1, 1.5]], "middlePoint": [0.5, 1, 0], "edgeIndex": 6 },
            { "vertexCoord": [[0.5, -1, -1.5], [0.5, 1, -1.5]], "middlePoint": [0.5, 0, -1.5], "edgeIndex": 7 },
            { "vertexCoord": [[-0.5, -1, -1.5], [0.5, -1, -1.5]], "middlePoint": [0, -1, -1.5], "edgeIndex": 8 },
            { "vertexCoord": [[-0.5, -1, 1.5], [0.5, -1, 1.5]], "middlePoint": [0, -1, 1.5], "edgeIndex": 9 },
            { "vertexCoord": [[-0.5, 1, -1.5], [0.5, 1, -1.5]], "middlePoint": [0, 1, -1.5], "edgeIndex": 10 },
            { "vertexCoord": [[-0.5, 1, 1.5], [0.5, 1, 1.5]], "middlePoint": [0, 1, 1.5], "edgeIndex": 11 }
        ],
        "pointsList": [[-0.5, -1, 1.5], [-0.5, -1, -1.5], [-0.5, 1, 1.5], [-0.5, -1, 1.5], [-0.5, 1, 1.5], [-0.5, 1, -1.5], [-0.5, 1, -1.5], [-0.5, -1, -1.5], [0.5, -1, 1.5], [0.5, -1, -1.5], [0.5, 1, 1.5], [0.5, -1, 1.5], [0.5, 1, 1.5], [0.5, 1, -1.5], [0.5, 1, -1.5], [0.5, -1, -1.5], [0.5, -1, -1.5], [-0.5, -1, -1.5], [0.5, -1, 1.5], [0.5, -1, -1.5], [0.5, -1, 1.5], [-0.5, -1, 1.5], [-0.5, -1, 1.5], [-0.5, -1, -1.5], [0.5, 1, -1.5], [-0.5, 1, -1.5], [0.5, 1, 1.5], [0.5, 1, -1.5], [0.5, 1, 1.5], [-0.5, 1, 1.5], [-0.5, 1, 1.5], [-0.5, 1, -1.5], [-0.5, 1, -1.5], [-0.5, -1, -1.5], [0.5, 1, -1.5], [-0.5, 1, -1.5], [0.5, 1, -1.5], [0.5, -1, -1.5], [0.5, -1, -1.5], [-0.5, -1, -1.5], [-0.5, 1, 1.5], [-0.5, -1, 1.5], [0.5, 1, 1.5], [-0.5, 1, 1.5], [0.5, 1, 1.5], [0.5, -1, 1.5], [0.5, -1, 1.5], [-0.5, -1, 1.5]]
    };
}

/**
 * Creates mock JSCAD box decomposed mesh data
 */
export function mockJSCADBoxDecomposedMesh() {
    return {
        "positions": [-0.5, -1, -1.5, -0.5, 1, 1.5, -0.5, 1, -1.5, -0.5, -1, -1.5, -0.5, -1, 1.5, -0.5, 1, 1.5, 0.5, -1, -1.5, 0.5, 1, 1.5, 0.5, -1, 1.5, 0.5, -1, -1.5, 0.5, 1, -1.5, 0.5, 1, 1.5, -0.5, -1, -1.5, 0.5, -1, 1.5, -0.5, -1, 1.5, -0.5, -1, -1.5, 0.5, -1, -1.5, 0.5, -1, 1.5, -0.5, 1, -1.5, 0.5, 1, 1.5, 0.5, 1, -1.5, -0.5, 1, -1.5, -0.5, 1, 1.5, 0.5, 1, 1.5, -0.5, -1, -1.5, 0.5, 1, -1.5, 0.5, -1, -1.5, -0.5, -1, -1.5, -0.5, 1, -1.5, 0.5, 1, -1.5, -0.5, -1, 1.5, 0.5, 1, 1.5, -0.5, 1, 1.5, -0.5, -1, 1.5, 0.5, -1, 1.5, 0.5, 1, 1.5],
        "normals": [],
        "indices": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
        "transforms": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        "hash": -1894319935
    };
}
