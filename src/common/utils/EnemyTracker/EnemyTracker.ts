import * as C from "game/constants";

import { getObjectsByPrototype, getTicks } from "game/utils";

import { Creep } from "game/prototypes";
import { EnemyCreep } from "common/roles/EnemyCreep";
import { EnemyGroup } from "./EnemyGroup";
import { MAX_GROUP_DISTANCE } from "common/constants";
import { MaxDistanceClustering } from "../lib/MaxDistanceClustering";
import { Visual } from "game/visual";

const ARMY_PARTS: C.BodyPartConstant[] = [C.ATTACK, C.RANGED_ATTACK, C.HEAL];

export class EnemyTracker {
    private static instance: EnemyTracker;
    private enemyCreeps: EnemyCreep[] = [];
    private enemyArmy: EnemyCreep[] = [];
    private enemyWorkers: EnemyCreep[] = [];
    private currentTick = 0;

    private armyGroups: EnemyGroup[] = [];
    private debugVisual: Visual;

    public static get i() {
        if (!EnemyTracker.instance) {
            EnemyTracker.instance = new EnemyTracker();
        }

        return EnemyTracker.instance;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
        this.debugVisual = new Visual(10, true);
    }

    public getEnemyCreeps(): EnemyCreep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyCreeps;
    }

    public getEnemyArmy(): EnemyCreep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyArmy;
    }

    public getEnemWorkers(): EnemyCreep[] {
        const thisTick = getTicks();
        if (thisTick !== this.currentTick) {
            this.updateValues(thisTick);
        }

        return this.enemyWorkers;
    }

    private updateValues(tick: number) {
        this.enemyCreeps = getObjectsByPrototype(Creep)
            .filter(c => !c.my)
            .map(c => new EnemyCreep(c));
        this.enemyArmy = this.enemyCreeps.filter(c => c.body.some(b => ARMY_PARTS.includes(b.type)));
        this.enemyWorkers = this.enemyCreeps.filter(c => !c.body.some(b => ARMY_PARTS.includes(b.type)));
        this.currentTick = tick;

        // BETA: Group building logic
        this.buildGroups();
        // this.debugGroups();
    }

    private buildGroups(): void {
        const clustering = new MaxDistanceClustering(this.enemyArmy, MAX_GROUP_DISTANCE);
        clustering.run();

        // Assign clustered creeps to new groups
    }

    private debugGroups(): void {
        this.debugVisual.clear();
        this.armyGroups.forEach(group => group.debugVisual(this.debugVisual));
    }
}
