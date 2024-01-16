import { Creep, StructureSpawn } from "game/prototypes";
import { LEFT_BASE_X, RIGHT_BASE_X, mySpawn, enemySpawn } from "arena_alpha_spawn_and_swamp/main";

import { Role } from "common/roles/Role";
import { flee } from "common/utils/utils";

export class AttackerRole extends Role {
    run(army: AttackerRole[], enemySoldiers: Creep[], enemyWorkers: Creep[], fleeing: boolean, ...args: any[]): void {
        /**
         * TODO:
         *  - Better targeting
         *  - Better kiting (better flee)
         *      - Pathing gets stuck and sends creeps into melee range / flee across
         *  - Better force calculations
         *  - Do not kite if fight is won, press on into melee range
         *  - Stick together more
         *  - Defend the base if needed?
         *  - Better force calculations
         */
        if (this.creep.x === undefined) {
            var index = army.indexOf(this);
            if (index !== -1) {
                army.splice(index, 1);
            }
            console.log("army removed :" + this.creep.id);
            return;
        }

        var closestSoldier = this.creep.findClosestByRange(enemySoldiers);
        var closest = this.creep.findClosestByRange(enemyWorkers);
        var attackTarget: Creep | StructureSpawn = enemySpawn!;
        var approachTarget: Creep | StructureSpawn = enemySpawn!;
        var rangeToTarget = this.creep.getRangeTo(enemySpawn!);
        var shouldIgnore: Creep[] = [];

        // Prioritize soldiers to workers
        if (closestSoldier) {
            var rangeToClosest = this.creep.getRangeTo(closestSoldier);
            if (rangeToClosest <= 45) {
                approachTarget = closestSoldier;
                rangeToTarget = rangeToClosest;
                if (rangeToClosest <= 3) {
                    attackTarget = closestSoldier;
                }
            }
        }

        if (closest && !attackTarget) {
            var rangeToClosest = this.creep.getRangeTo(closest);
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

        if (rangeToTarget >= 7) {
            shouldIgnore = army.map(a => a.creep);
        }
        if (rangeToTarget <= 3) {
            if (rangeToTarget <= 1) {
                this.creep.rangedMassAttack();
            } else {
                this.creep.rangedAttack(attackTarget);
            }
            if (rangeToTarget <= 2) {
                flee(this.creep, attackTarget); // TODO improve logic
            }
        } else {
            if (fleeing && rangeToTarget > 10) {
                this.creep.moveTo(mySpawn);
            } else {
                this.creep.moveTo(approachTarget, { ignore: shouldIgnore });
            }
        }

        // Heal others if needed
        var damagedCreeps = army.filter(a => a.creep.hits < a.creep.hitsMax);
        var healTarget: Creep | undefined;
        var healDistance: number;
        if (this.creep.hits < this.creep.hitsMax - 200) {
            healTarget = this.creep;
            healDistance = 0;
            // Enforce flee
            flee(this.creep, attackTarget);
        } else {
            for (var damaged of damagedCreeps) {
                var range = this.creep.getRangeTo(damaged.creep);
                healTarget = damaged.creep;
                healDistance = range;
                if (range <= 1) {
                    break;
                }
            }
        }
        if (healTarget) {
            if (healDistance! <= 1) {
                this.creep.heal(healTarget);
            } else {
                this.creep.rangedHeal(healTarget);
            }
        }
    }
}
