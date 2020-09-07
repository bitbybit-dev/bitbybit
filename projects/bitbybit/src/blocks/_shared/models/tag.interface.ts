export interface TagInterface {
    text: string;
    position: {x: number, y: number, z: number};
    colour: string;
    size: number;
    adaptDepth: boolean;
    needsUpdate: boolean;
    id: string;
}
