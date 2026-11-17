export const ARGUMENTS_PER_PATH_COMMAND: ReadonlyMap<string, number> = new Map([
    ["m", 2], ["l", 2], ["h", 1], ["v", 1], ["c", 6], ["s", 4], ["q", 4], ["t", 2], ["a", 7], ["z", 0],
]);
export const ARC_COMMAND = "a";
export const MOVE_COMMAND = "m";
export const ARC_FLAG_ARGUMENTS: ReadonlySet<number> = new Set([3, 4]);
export const CUBIC_END_ARGUMENT = 4;
export const ARC_END_ARGUMENT = 5;
export const QUADRATIC_TO_CUBIC_SHARE = 2 / 3;
export const QUARTER_TURN = Math.PI / 2;
