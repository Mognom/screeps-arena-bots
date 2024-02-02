import { StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export const LEFT_BASE_X = 13;
export const RIGHT_BASE_X = 86;

export const mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my)!;
export const enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my)!;

// Enemy grouping constants
export const MAX_GROUP_DISTANCE = 10;
