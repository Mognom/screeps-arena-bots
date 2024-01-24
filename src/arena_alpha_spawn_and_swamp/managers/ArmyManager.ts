import * as C from "game/constants";

import { Creep, StructureSpawn } from "game/prototypes";
import { HUNTER_TEMPLATE, KITE_TEMPLATE } from "common/constants/templates";
import { LEFT_BASE_X, RIGHT_BASE_X } from "common/constants";

import { AttackerRole } from "common/roles/AttackerRole";
import { Manager } from "common/managers/Manager";
import { MidGameEconomyManager } from "./MidGameEconomyManager";
import { MoveToOpts } from "game/path-finder";
import { Priority } from "common/managers/spawn/Priority";
import { SpawnManager } from "common/managers/spawn/SpawnManager";
import { SpawnOrder } from "common/managers/spawn/SpawnOrder";
import { flee } from "common/utils/utils";
import { getObjectsByPrototype } from "game/utils";

const ARMY_QUEUE_NAME = "army";
const ARMY_PARTS: C.BodyPartConstant[] = [C.ATTACK, C.RANGED_ATTACK, C.HEAL];
const HUNTER_QUEUE_NAME = "hunt";

export class ArmyManager extends Manager {
    private midGameEconomyManager: MidGameEconomyManager;
    private hunter: Creep | undefined;
    private army: AttackerRole[];
    private spawnManager: SpawnManager;
    private enemySpawn: StructureSpawn;
    private hunterOrdered = false;

    public constructor(spawnManager: SpawnManager, enemySpawn: StructureSpawn, midGameEconomyManager: MidGameEconomyManager) {
        super();
        this.midGameEconomyManager = midGameEconomyManager;
        this.army = [];
        this.spawnManager = spawnManager;
        this.enemySpawn = enemySpawn;
    }

    public tick(): boolean {
        this.tickArmy(this.midGameEconomyManager.builder);
        return this.buildArmy();
    }

    private buildArmy(): boolean {
        if (!this.hunterOrdered) {
            const huntOrder = new SpawnOrder(HUNTER_QUEUE_NAME, Priority.Important, HUNTER_TEMPLATE, (creep: Creep) => (this.hunter = creep));
            this.spawnManager.spawnCreep(huntOrder);
            this.hunterOrdered = true;
        } else {
            if (this.spawnManager.getQueuedCountForName(ARMY_QUEUE_NAME) === 0) {
                const armyOrder = new SpawnOrder(ARMY_QUEUE_NAME, Priority.Standard, KITE_TEMPLATE, (creep: Creep) => this.army.push(new AttackerRole(creep)));
                this.spawnManager.spawnCreep(armyOrder);
            }
        }
        return true;
    }

    private tickArmy(gatherer: Creep | undefined) {
        const enemyCreeps = getObjectsByPrototype(Creep).filter(c => !c.my);
        const enemyArmy = enemyCreeps.filter(c => c.body.some(b => ARMY_PARTS.includes(b.type)));
        const enemyWorkers = enemyCreeps.filter(c => !c.body.some(b => ARMY_PARTS.includes(b.type)));

        if (this.hunter) {
            this.tickHunterCreep(this.hunter, enemyCreeps, gatherer);
        }
        for (const creep of this.army) {
            creep.run(this.army, enemyArmy, enemyWorkers, this.army.length <= 2);
        }
    }

    private tickHunterCreep(creep: Creep, enemies: Creep[], gatherer: Creep | undefined) {
        /**
         * TOOD:
         *  - Flee from ranged to preserve health
         *  - Hunt any melee creep as well if it crosses
         *  - Allow fallback into main army to help support the push
         *  - Fetch healers if badly damaged
         */
        const closestGatherer = creep.findClosestByRange(
            enemies.filter(c => c.x >= LEFT_BASE_X && c.x <= RIGHT_BASE_X && c.body.some(b => b.type === C.CARRY))
        );

        const closest = creep.findClosestByRange(enemies);
        let target: Creep | null = closestGatherer;
        let rangeToTarget = creep.getRangeTo(this.enemySpawn);
        let shouldIgnore: Creep[] = [];
        let hangOutSpot;
        if (gatherer && gatherer.x !== undefined && gatherer.x >= LEFT_BASE_X && gatherer.x <= RIGHT_BASE_X) {
            hangOutSpot = { x: gatherer.x, y: gatherer.y };
        } else {
            hangOutSpot = { x: 50, y: 50 };
        }
        if (closest) {
            const rangeToClosest = creep.getRangeTo(closest);
            if (rangeToClosest <= 7) {
                target = closest;
                rangeToTarget = rangeToClosest;
            }
        }

        if (rangeToTarget >= 7) {
            shouldIgnore = this.army;
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
