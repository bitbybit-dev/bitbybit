import { Base } from "../../../inputs/base-inputs";

export function pointOnGround(x: number, y: number, coordinateSystem: Base.coordinateSystemEnum | undefined): Base.Point3 {
    return [x, 0, coordinateSystem === Base.coordinateSystemEnum.rightHanded ? 0 - y : y];
}
