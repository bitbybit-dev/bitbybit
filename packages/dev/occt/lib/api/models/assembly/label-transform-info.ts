import { Base } from "../../inputs";

/**
 * Transform info returned from getLabelTransform.
 */
export interface LabelTransformInfo {
    /** 4x4 transformation matrix in column-major order */
    matrix: number[];
    /** Translation [x, y, z] */
    translation: Base.Point3;
    /** Rotation as quaternion [x, y, z, w] */
    quaternion: [number, number, number, number];
    /** Scale factor (uniform) */
    scale: number;
}
