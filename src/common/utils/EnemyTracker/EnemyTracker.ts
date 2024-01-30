import * as C from "game/constants";

import { getObjectsByPrototype, getTicks } from "game/utils";

import { Creep } from "game/prototypes";

const ARMY_PARTS: C.BodyPartConstant[] = [C.ATTACK, C.RANGED_ATTACK, C.HEAL];

export class EnemyTracker {
    private static instance: EnemyTracker;
    private enemyCreeps: Creep[] = [];
    private enemyArmy: Creep[] = [];
    private enemyWorkers: Creep[] = [];
    private currentTick: number = 0;

    public static get i() {
        if (!EnemyTracker.instance) {
            EnemyTracker.instance = new EnemyTracker();
        }

        return EnemyTracker.instance;
    }

    private constructor() {}

    public getEnemyCreeps(): Creep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyCreeps;
    }

    public getEnemyArmy(): Creep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyArmy;
    }

    public getEnemWorkers(): Creep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyWorkers;
    }

    private updateValues(tick: number) {
        this.enemyCreeps = getObjectsByPrototype(Creep).filter(c => !c.my);
        this.enemyArmy = this.enemyCreeps.filter(c => c.body.some(b => ARMY_PARTS.includes(b.type)));
        this.enemyWorkers = this.enemyCreeps.filter(c => !c.body.some(b => ARMY_PARTS.includes(b.type)));
        this.currentTick = tick;
    }
}
