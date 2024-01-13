import { getObjectsByPrototype, createConstructionSite } from 'game/utils';
import { Creep, StructureContainer, StructureSpawn, StructureExtension, ConstructionSite, StructureRoad, RoomPosition } from 'game/prototypes';
import * as C from "game/constants";
import { getTicks } from "game/utils";

import { attempSpawn, flee } from "common/utils/utils"
import { GLOBA_VISUAL } from "common/utils/Visual"
import { BootStrapEconomyManager } from 'arena_alpha_spawn_and_swamp/managers/BootStrapEconomyManager'


const LEFT_BASE_X = 13;
const RIGHT_BASE_X = 86;
const ARMY_PARTS: C.BodyPartConstant[] = [C.ATTACK, C.RANGED_ATTACK, C.HEAL];

// ################
// TEMPLATES
const LOCALEXTENSIONRELAY = [C.CARRY, C.CARRY, C.MOVE, C.MOVE]
const REMOTEBUILDER_TEMPLATE = [C.WORK, C.WORK, C.CARRY, C.MOVE, C.MOVE]
const GATHERERER = [C.CARRY, C.CARRY, C.CARRY, C.MOVE, C.MOVE, C.MOVE]
// const HUNTER = [C.RANGED_ATTACK, C.RANGED_ATTACK, C.HEAL, C.MOVE, C.MOVE, C.MOVE, C.MOVE] // 750, swamp 4
// const SIEGE = [C.RANGED_ATTACK, C.RANGED_ATTACK, C.RANGED_ATTACK, C.HEAL, C.MOVE, C.MOVE, C.MOVE, C.MOVE] // 900

const HUNTER_TEMPLATE = [C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.RANGED_ATTACK] // 450?, 1 swamp
const SIEGE_TEMPLATE = [C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.RANGED_ATTACK, C.RANGED_ATTACK, C.HEAL] // 950, 2 swamp

// ################

const mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my)!;
const enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my)!;

var hunter1: Creep | undefined;

var currentBaseConstruction: ConstructionSite | undefined;

var enemyCreeps: Creep[];

var leftSided = mySpawn.x <= 25;

var earlyEconomyManager: BootStrapEconomyManager = new BootStrapEconomyManager(mySpawn, leftSided);

/**
 * TODO:
 * - Build single local rampart to prevent backdoor viability
 * - REMOTEBUILDER to go middle and fully drop a container, then build load & build extensions
 *
 */

export function loop() {
    GLOBA_VISUAL.clearRender();
    if (earlyEconomyManager.tick()) {
        tickArmy();
        buildArmy();
    }
}

var army: Creep[] = []

// var siegeCreeps = creeps.all.filter(c => c.my && c.body.some(part => part.type == C.ATTACK));
function buildArmy() {
    if (hunter1) {
        var newCreep = attempSpawn(mySpawn, SIEGE_TEMPLATE);
        if (newCreep) {
            army.push(newCreep);
        }
    } else {
        hunter1 = attempSpawn(mySpawn, HUNTER_TEMPLATE);
    }

}

function tickArmy() {
    enemyCreeps = getObjectsByPrototype(Creep).filter(c => !c.my);
    var enemyArmy = enemyCreeps.filter(c => c.body.some(b => ARMY_PARTS.includes(b.type)));
    var enemyWorkers = enemyCreeps.filter(c => !c.body.some(b => ARMY_PARTS.includes(b.type)));

    // console.log("army lenght: " + enemyArmy.length);
    // console.log("workers lenght: " + enemyWorkers.length);

    if (hunter1) {
        tickHunterCreep(hunter1, enemyCreeps);
    }
    for (var creep of army) {
        tickArmyCreep(creep, enemyArmy, enemyWorkers, enemySpawn, army.length <= 4);
    }

}

function tickArmyCreep(creep: Creep, enemySoldiers: Creep[], enemyWorkers: Creep[], enemySpawn: StructureSpawn, fleeing: boolean) {
    /**
     * TODO:
     *  - Better targeting
     *  - Stick together more
     *  - Defend the base if needed?
     *  - Better force calculations
     */
    if (creep.spawning) {
        return;
    }
    if (creep.x === undefined) {
        var index = army.indexOf(creep);
        if (index !== -1) {
            army.splice(index, 1);
        }
        console.log("army removed :" + creep.id)
        return;
    }

    var closestSoldier = creep.findClosestByRange(enemySoldiers);
    var closest = creep.findClosestByRange(enemyWorkers)
    var attackTarget: Creep | StructureSpawn = enemySpawn;
    var approachTarget: Creep | StructureSpawn = enemySpawn;
    var rangeToTarget = creep.getRangeTo(enemySpawn);
    var shouldIgnore: Creep[] = [];

    // Prioritize soldiers to workers
    if (closestSoldier) {
        var rangeToClosest = creep.getRangeTo(closestSoldier);
        if (rangeToClosest <= 45) {
            approachTarget = closestSoldier
            attackTarget = closestSoldier;
            rangeToTarget = rangeToClosest;
            if (rangeToClosest <= 3) {
                attackTarget = closestSoldier;
            }
        }
    }

    if (closest && !attackTarget) {
        var rangeToClosest = creep.getRangeTo(closest);
        if (rangeToClosest <= 7) {
            if (!approachTarget) {
                approachTarget = closest;
                rangeToTarget = rangeToClosest;
            }
            if (rangeToClosest <= 3) {
                attackTarget = closest;
                rangeToTarget = rangeToClosest;
            }
        }
    }

    if (approachTarget === enemySpawn) {
        GLOBA_VISUAL.renderCircle(creep, 35)
    }

    if (rangeToTarget >= 7) {
        shouldIgnore = army;
    }
    if (rangeToTarget <= 3) {
        if (rangeToTarget <= 1) {
            creep.rangedMassAttack();
        } else {
            creep.rangedAttack(attackTarget);
        }
        if (rangeToTarget <= 2) {
            flee(creep, attackTarget); // TODO improve logic
        }
    } else {
        if (fleeing && rangeToTarget > 10) {
            creep.moveTo(mySpawn);
        } else {
            creep.moveTo(approachTarget, { ignore: shouldIgnore });
        }

    }

    // Heal others if needed
    var damagedCreeps = army.filter(c => c.hits < c.hitsMax);
    var healTarget: Creep | undefined;
    var healDistance: number;
    if (creep.hits < creep.hitsMax - 200) {
        healTarget = creep;
        healDistance = 0;
        // Enforce flee
        flee(creep, attackTarget);
    } else {
        for (var damaged of damagedCreeps) {
            var range = creep.getRangeTo(damaged);
            healTarget = damaged;
            healDistance = range;
            if (range <= 1) {
                break;
            }
        }
    }
    if (healTarget) {
        if (healDistance! <= 1) {
            creep.heal(healTarget);
        } else {
            creep.rangedHeal(healTarget);
        }
    }
}


function tickHunterCreep(creep: Creep, enemies: Creep[]) {
    /**
     * TOOD:
     *  - Flee from ranged to preserve health
     *  - Hunt any melee creep as well if it crosses
     *  - Change template to 5M,1RA for speed
     *  - Allow fallback into main army to help support the push
     *  - Fetch healers if badly damaged
     */
    var closestGatherer = creep.findClosestByRange(enemies.filter(c => c.x >= LEFT_BASE_X && c.x <= RIGHT_BASE_X && c.body.some(b => b.type === C.CARRY)));

    var closest = creep.findClosestByRange(enemies);
    var target: Creep | null = closestGatherer;
    var rangeToTarget = creep.getRangeTo(enemySpawn);
    var shouldIgnore: Creep[] = [];
    if (closest) {
        var rangeToClosest = creep.getRangeTo(closest);
        if (rangeToClosest <= 7) {
            target = closest;
            rangeToTarget = rangeToClosest;
        }
    }

    if (rangeToTarget >= 7) {
        shouldIgnore = army;
    }

    if (target) {
        if (rangeToTarget <= 3) {
            if (rangeToTarget <= 1) {
                creep.rangedMassAttack();
            } else {
                creep.rangedAttack(target);
            }

            if (rangeToTarget <= 2) {
                flee(creep, target); // TODO improve logic
            }
        } else {
            creep.moveTo(target, { ignore: shouldIgnore });

        }
    } else {
        creep.moveTo({ x: 50, y: 50 })
    }

    // TODO heal others if needed
    creep.heal(creep);

}
