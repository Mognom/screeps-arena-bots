import { getObjectsByPrototype } from "game/utils";
import { ConstructionSite, Creep, StructureSpawn } from "game/prototypes";
import * as C from "game/constants";

import { GLOBA_VISUAL } from "common/utils/Visual";
import { SpawnManager } from "common/managers/SpawnManager";
import { BootStrapEconomyManager } from "arena_alpha_spawn_and_swamp/managers/BootStrapEconomyManager";
import { MidGameEconomyManager } from "arena_alpha_spawn_and_swamp/managers/MidGameEconomyManager";
import { ArmyManager } from "arena_alpha_spawn_and_swamp/managers/ArmyManager";

export const LEFT_BASE_X = 13;
export const RIGHT_BASE_X = 86;

export const mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my)!;
export const enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my)!;

const leftSided = mySpawn.x <= 25;

const spawnManager: SpawnManager = new SpawnManager(mySpawn);
const earlyEconomyManager: BootStrapEconomyManager = new BootStrapEconomyManager(spawnManager, leftSided);
const midGameEconomyManager: MidGameEconomyManager = new MidGameEconomyManager(spawnManager, leftSided);
const armyManager: ArmyManager = new ArmyManager(spawnManager, enemySpawn, midGameEconomyManager);

/**
 * TODO:
 *
 */

export function loop() {
    GLOBA_VISUAL.clearRender();
    spawnManager.tick();
    if (earlyEconomyManager.tick()) {
        if (armyManager.tick()) {
            midGameEconomyManager.tick();
        }
    }
}
