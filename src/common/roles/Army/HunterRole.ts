import * as C from "game/constants";

import { LEFT_BASE_X, RIGHT_BASE_X, enemySpawn } from "common/constants";

import { AttackerRole } from "./AttackerRole";
import { Creep } from "game/prototypes";
import { EnemyCreep } from "common/roles/EnemyCreep";
import { OwnedCreep } from "common/roles/OwnedCreep";
import { flee } from "common/utils/movementUtils";

export class HunterRole extends OwnedCreep {
    public run(enemies: EnemyCreep[], gatherer: Creep | undefined, army: AttackerRole[]) {
        /**
         * TOOD:
         *  - Flee from ranged to preserve health
         *  - Hunt any melee creep as well if it crosses
         *  - Allow fallback into main army to help support the push
         *  - Fetch healers if badly damaged
         */
        const closestGatherer = this.findClosestByRange(enemies.filter(c => c.x >= LEFT_BASE_X && c.x <= RIGHT_BASE_X && c.body.some(b => b.type === C.CARRY)));

        const closest = this.findClosestByRange(enemies);
        let target: EnemyCreep | null = closestGatherer;
        let rangeToTarget = this.getRangeTo(enemySpawn);
        let shouldIgnore: Creep[] = [];
        let hangOutSpot;
        if (gatherer && gatherer.x !== undefined && gatherer.x >= LEFT_BASE_X && gatherer.x <= RIGHT_BASE_X) {
            hangOutSpot = { x: gatherer.x, y: gatherer.y };
        } else {
            hangOutSpot = { x: 50, y: 50 };
        }
        if (closest) {
            const rangeToClosest = this.getRangeTo(closest);
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
                    this.rangedMassAttack();
                } else {
                    this.rangedAttack(target);
                }

                if (rangeToTarget <= 2) {
                    flee(this, target); // TODO improve logic
                }
            } else {
                this.moveTo(target, { ignore: shouldIgnore });
            }
        } else {
            this.moveTo(hangOutSpot, { range: 3 });
        }

        // TODO heal others if needed
        this.heal(this);
    }
}
