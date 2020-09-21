import { Vector3, Quaternion } from '@babylonjs/core';

export class Plane {
    origin: Vector3 = new Vector3();
    quaternion: Quaternion = new Quaternion();

    xAxis: number[] = [1, 0, 0];
    yAxis: number[] = [0, 1, 0];
    zAxis: number[] = [0, 0, 1];
}
