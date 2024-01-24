import { enemySpawn, mySpawn } from "common/constants";

import { ArmyManager } from "arena_alpha_spawn_and_swamp/managers/ArmyManager";
import { BootStrapEconomyManager } from "arena_alpha_spawn_and_swamp/managers/BootStrapEconomyManager";
import { GLOBA_VISUAL } from "common/utils/Visual";
import { MidGameEconomyManager } from "arena_alpha_spawn_and_swamp/managers/MidGameEconomyManager";
import { SpawnManager } from "common/managers/spawn/SpawnManager";

const leftSided = mySpawn.x <= 25;

const spawnManager: SpawnManager = new SpawnManager(mySpawn);
const earlyEconomyManager: BootStrapEconomyManager = new BootStrapEconomyManager(spawnManager, leftSided);
const midGameEconomyManager: MidGameEconomyManager = new MidGameEconomyManager(spawnManager);
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
