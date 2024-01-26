import * as C from "game/constants";

import { getObjectsByPrototype, getTicks } from "game/utils";

import { Creep } from "game/prototypes";

const ARMY_PARTS: C.BodyPartConstant[] = [C.ATTACK, C.RANGED_ATTACK, C.HEAL];

export class EnemyTracker {
    private static enemyCreeps: Creep[] = [];
    private static enemyArmy: Creep[] = [];
    private static enemyWorkers: Creep[] = [];
    private static currentTick: number;

    public static getEnemyCreeps(): Creep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyCreeps;
    }

    public static getEnemyArmy(): Creep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyArmy;
    }

    public static getEnemWorkers(): Creep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyWorkers;
    }

    private static updateValues(tick: number) {
        this.enemyCreeps = getObjectsByPrototype(Creep).filter(c => !c.my);
        this.enemyArmy = this.enemyCreeps.filter(c => c.body.some(b => ARMY_PARTS.includes(b.type)));
        this.enemyWorkers = this.enemyCreeps.filter(c => !c.body.some(b => ARMY_PARTS.includes(b.type)));
        this.currentTick = tick;
    }
}
