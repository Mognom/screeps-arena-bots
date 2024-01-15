import { getObjectsByPrototype } from 'game/utils';
import { Creep, StructureSpawn, ConstructionSite } from 'game/prototypes';
import * as C from "game/constants";

import { GLOBA_VISUAL } from "common/utils/Visual"
import { BootStrapEconomyManager } from 'arena_alpha_spawn_and_swamp/managers/BootStrapEconomyManager'
import { MidGameEconomyManager } from 'arena_alpha_spawn_and_swamp/managers/MidGameEconomyManager'
import { ArmyManager } from 'arena_alpha_spawn_and_swamp/managers/ArmyManager'

export const LEFT_BASE_X = 13;
export const RIGHT_BASE_X = 86;

const mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my)!;
const enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my)!;

var leftSided = mySpawn.x <= 25;

var earlyEconomyManager: BootStrapEconomyManager = new BootStrapEconomyManager(mySpawn, leftSided);
var midGameEconomyManager: MidGameEconomyManager = new MidGameEconomyManager(mySpawn, leftSided);
var armyManager: ArmyManager = new ArmyManager(mySpawn, enemySpawn, midGameEconomyManager);

/**
 * TODO:
 *
 */

export function loop() {
    GLOBA_VISUAL.clearRender();
    if (earlyEconomyManager.tick()) {
        if (armyManager.tick()) {
            midGameEconomyManager.tick();
        }
    }
}
