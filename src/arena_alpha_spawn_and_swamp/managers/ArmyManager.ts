import { Manager } from "common/managers/Manager";
import { MidGameEconomyManager } from "./MidGameEconomyManager";
import { SpawnManager, SpawnOrder, Priority } from "common/managers/SpawnManager";
import { flee } from "common/utils/utils";
import { GLOBA_VISUAL } from "common/utils/Visual";
import { LEFT_BASE_X, RIGHT_BASE_X } from "arena_alpha_spawn_and_swamp/main";

import { Creep, StructureSpawn } from "game/prototypes";
import * as C from "game/constants";
import { getObjectsByPrototype } from "game/utils";
import { MoveToOpts } from "game/path-finder";
import { AttackerRole } from "common/roles/AttackerRole";

const ARMY_QUEUE_NAME = "army";
const ARMY_PARTS: C.BodyPartConstant[] = [C.ATTACK, C.RANGED_ATTACK, C.HEAL];
const HUNTER_QUEUE_NAME = "hunt";
const HUNTER_TEMPLATE = [C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.RANGED_ATTACK]; // 450?, 1 swamp
const KITE_TEMPLATE = [C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.RANGED_ATTACK, C.RANGED_ATTACK, C.HEAL]; // 950, 2 swamp
const MELEE_TEMPLATE = [C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.ATTACK, C.ATTACK]; // 660, 1 swamp
const HEAL_TEMPLATE = [C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.MOVE, C.HEAL, C.HEAL]; // 1000 , 1 swamp

export class ArmyManager extends Manager {
    midGameEconomyManager: MidGameEconomyManager;
    hunter: Creep | undefined;
    army: AttackerRole[];
    spawnManager: SpawnManager;
    enemySpawn: StructureSpawn;
    hunterOrdered: boolean = false;

    constructor(spawnManager: SpawnManager, enemySpawn: StructureSpawn, midGameEconomyManager: MidGameEconomyManager) {
        super();
        this.midGameEconomyManager = midGameEconomyManager;
        this.army = [];
        this.spawnManager = spawnManager;
        this.enemySpawn = enemySpawn;
    }

    tick(): boolean {
        this.tickArmy(this.midGameEconomyManager.builder);
        return this.buildArmy();
    }

    buildArmy(): boolean {
        if (!this.hunterOrdered) {
            var huntOrder = new SpawnOrder(HUNTER_QUEUE_NAME, Priority.Important, HUNTER_TEMPLATE, (creep: Creep) => (this.hunter = creep));
            this.spawnManager.spawnCreep(huntOrder);
            this.hunterOrdered = true;
        } else {
            if (this.spawnManager.getQueuedCountForName(ARMY_QUEUE_NAME) === 0) {
                var armyOrder = new SpawnOrder(ARMY_QUEUE_NAME, Priority.Standard, KITE_TEMPLATE, (creep: Creep) => this.army.push(new AttackerRole(creep)));
                this.spawnManager.spawnCreep(armyOrder);
            }
        }
        return true;
    }

    tickArmy(gatherer: Creep | undefined) {
        var enemyCreeps = getObjectsByPrototype(Creep).filter(c => !c.my);
        var enemyArmy = enemyCreeps.filter(c => c.body.some(b => ARMY_PARTS.includes(b.type)));
        var enemyWorkers = enemyCreeps.filter(c => !c.body.some(b => ARMY_PARTS.includes(b.type)));

        if (this.hunter) {
            this.tickHunterCreep(this.hunter, enemyCreeps, gatherer);
        }
        for (var creep of this.army) {
            creep.run(this.army, enemyArmy, enemyWorkers, this.army.length <= 4);
        }
    }

    // tickArmyCreep(creep: Creep, enemySoldiers: Creep[], enemyWorkers: Creep[], enemySpawn: StructureSpawn, fleeing: boolean) {
    //     /**
    //      * TODO:
    //      *  - Better targeting
    //      *  - Better kiting (better flee)
    //      *      - Pathing gets stuck and sends creeps into melee range / flee across
    //      *  - Better force calculations
    //      *  - Do not kite if fight is won, press on into melee range
    //      *  - Stick together more
    //      *  - Defend the base if needed?
    //      *  - Better force calculations
    //      */
    //     if (creep.spawning) {
    //         return;
    //     }
    //     if (creep.x === undefined) {
    //         var index = this.army.indexOf(creep);
    //         if (index !== -1) {
    //             this.army.splice(index, 1);
    //         }
    //         console.log("army removed :" + creep.id);
    //         return;
    //     }

    //     var closestSoldier = creep.findClosestByRange(enemySoldiers);
    //     var closest = creep.findClosestByRange(enemyWorkers);
    //     var attackTarget: Creep | StructureSpawn = enemySpawn;
    //     var approachTarget: Creep | StructureSpawn = enemySpawn;
    //     var rangeToTarget = creep.getRangeTo(enemySpawn);
    //     var shouldIgnore: Creep[] = [];

    //     // Prioritize soldiers to workers
    //     if (closestSoldier) {
    //         var rangeToClosest = creep.getRangeTo(closestSoldier);
    //         if (rangeToClosest <= 45) {
    //             approachTarget = closestSoldier;
    //             rangeToTarget = rangeToClosest;
    //             if (rangeToClosest <= 3) {
    //                 attackTarget = closestSoldier;
    //             }
    //         }
    //     }

    //     if (closest && !attackTarget) {
    //         var rangeToClosest = creep.getRangeTo(closest);
    //         if (rangeToClosest <= 7) {
    //             if (!approachTarget) {
    //                 approachTarget = closest;
    //                 rangeToTarget = rangeToClosest;
    //             }
    //             if (rangeToClosest <= 3) {
    //                 attackTarget = closest;
    //                 rangeToTarget = rangeToClosest;
    //             }
    //         }
    //     }

    //     if (approachTarget === enemySpawn) {
    //         GLOBA_VISUAL.renderCircle(creep, 35);
    //     }

    //     if (rangeToTarget >= 7) {
    //         shouldIgnore = this.army;
    //     }
    //     if (rangeToTarget <= 3) {
    //         if (rangeToTarget <= 1) {
    //             creep.rangedMassAttack();
    //         } else {
    //             creep.rangedAttack(attackTarget);
    //         }
    //         if (rangeToTarget <= 2) {
    //             flee(creep, attackTarget); // TODO improve logic
    //         }
    //     } else {
    //         if (fleeing && rangeToTarget > 10) {
    //             creep.moveTo(this.spawnManager.spawn);
    //         } else {
    //             creep.moveTo(approachTarget, { ignore: shouldIgnore });
    //         }
    //     }

    //     // Heal others if needed
    //     var damagedCreeps = this.army.filter(c => c.hits < c.hitsMax);
    //     var healTarget: Creep | undefined;
    //     var healDistance: number;
    //     if (creep.hits < creep.hitsMax - 200) {
    //         healTarget = creep;
    //         healDistance = 0;
    //         // Enforce flee
    //         flee(creep, attackTarget);
    //     } else {
    //         for (var damaged of damagedCreeps) {
    //             var range = creep.getRangeTo(damaged);
    //             healTarget = damaged;
    //             healDistance = range;
    //             if (range <= 1) {
    //                 break;
    //             }
    //         }
    //     }
    //     if (healTarget) {
    //         if (healDistance! <= 1) {
    //             creep.heal(healTarget);
    //         } else {
    //             creep.rangedHeal(healTarget);
    //         }
    //     }
    // }

    tickHunterCreep(creep: Creep, enemies: Creep[], gatherer: Creep | undefined) {
        /**
         * TOOD:
         *  - Flee from ranged to preserve health
         *  - Hunt any melee creep as well if it crosses
         *  - Allow fallback into main army to help support the push
         *  - Fetch healers if badly damaged
         */
        var closestGatherer = creep.findClosestByRange(enemies.filter(c => c.x >= LEFT_BASE_X && c.x <= RIGHT_BASE_X && c.body.some(b => b.type === C.CARRY)));

        var closest = creep.findClosestByRange(enemies);
        var target: Creep | null = closestGatherer;
        var rangeToTarget = creep.getRangeTo(this.enemySpawn);
        var shouldIgnore: Creep[] = [];
        var hangOutSpot;
        if (gatherer && gatherer.x != undefined && gatherer.x >= LEFT_BASE_X && gatherer.x <= RIGHT_BASE_X) {
            hangOutSpot = { x: gatherer.x, y: gatherer.y };
        } else {
            hangOutSpot = { x: 50, y: 50 };
        }
        if (closest) {
            var rangeToClosest = creep.getRangeTo(closest);
            if (rangeToClosest <= 7) {
                target = closest;
                rangeToTarget = rangeToClosest;
            }
        }

        if (rangeToTarget >= 7) {
            shouldIgnore = this.army.map(a => a.creep);
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
            creep.moveTo(hangOutSpot, { range: 3 } as MoveToOpts);
        }

        // TODO heal others if needed
        creep.heal(creep);
    }
}
