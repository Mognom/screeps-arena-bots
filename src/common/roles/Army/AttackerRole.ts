import { Creep, StructureSpawn } from "game/prototypes";
import { enemySpawn, mySpawn } from "common/constants";

import { EnemyCreep } from "../EnemyCreep";
import { OwnedCreep } from "common/roles/OwnedCreep";
import { flee } from "common/utils/movementUtils";

export class AttackerRole extends OwnedCreep {
    public run(army: AttackerRole[], enemySoldiers: EnemyCreep[], enemyWorkers: EnemyCreep[], fleeing: boolean): void {
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
        if (this.x === undefined) {
            const index = army.indexOf(this);
            if (index !== -1) {
                army.splice(index, 1);
            }
            console.log("army removed :" + this.id);
            return;
        }

        const closestSoldier = this.findClosestByRange(enemySoldiers);
        const closest = this.findClosestByRange(enemyWorkers);
        let attackTarget: EnemyCreep | StructureSpawn = enemySpawn;
        let approachTarget: EnemyCreep | StructureSpawn = enemySpawn;
        let rangeToTarget = this.getRangeTo(enemySpawn);
        let shouldIgnore: Creep[] = [];

        // Prioritize soldiers to workers
        if (closestSoldier) {
            const rangeToClosest = this.getRangeTo(closestSoldier);
            if (rangeToClosest <= 45) {
                approachTarget = closestSoldier;
                rangeToTarget = rangeToClosest;
                if (rangeToClosest <= 3) {
                    attackTarget = closestSoldier;
                }
            }
        }

        if (closest && !attackTarget) {
            const rangeToClosest = this.getRangeTo(closest);
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
            shouldIgnore = army;
        }
        if (rangeToTarget <= 3) {
            if (rangeToTarget <= 1) {
                this.rangedMassAttack();
            } else {
                this.rangedAttack(attackTarget);
            }
            if (rangeToTarget <= 2) {
                flee(this, attackTarget); // TODO improve logic
            }
        } else {
            if (fleeing && rangeToTarget > 10) {
                this.moveTo(mySpawn);
            } else {
                this.moveTo(approachTarget, { ignore: shouldIgnore });
            }
        }

        // Heal others if needed
        const damagedCreeps = army.filter(a => a.hits < a.hitsMax);
        let healTarget: Creep | OwnedCreep | undefined;
        let healDistance: number;
        if (this.hits < this.hitsMax - 200) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            healTarget = this;
            healDistance = 0;
            // Enforce flee
            flee(this, attackTarget);
        } else {
            for (const damaged of damagedCreeps) {
                const range = this.getRangeTo(damaged);
                healTarget = damaged;
                healDistance = range;
                if (range <= 1) {
                    break;
                }
            }
        }
        if (healTarget) {
            if (healDistance! <= 1) {
                this.heal(healTarget);
            } else {
                this.rangedHeal(healTarget);
            }
        }
    }
}
