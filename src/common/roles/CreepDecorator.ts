import * as C from "game/constants";

import { Creep, Id, RoomObjectJSON, RoomPosition } from "game/prototypes";

import { FindPathOpts } from "game/path-finder";

/**
 * Role decorator to extend the Creep class, and allow specialization
 */
export abstract class CreepDecorator implements Creep {
    public readonly creep: Creep;
    // Combat stats of the creep
    protected offensivePower: number;
    protected ranged: boolean;
    protected healPower: number;

    public constructor(creep: Creep) {
        this.creep = creep;

        // Calculate combat stats of the creep
        this.ranged = false;
        this.offensivePower = 0;
        this.healPower = 0;
        this.populateCombatStats();
    }

    private populateCombatStats() {
        for (const part of this.creep.body) {
            switch (part.type) {
                case C.ATTACK:
                    this.offensivePower += C.ATTACK_POWER;
                    break;
                case C.RANGED_ATTACK:
                    this.offensivePower += C.RANGED_ATTACK_POWER;
                    this.ranged = true;
                    break;
                case C.HEAL:
                    this.healPower += C.HEAL_POWER;
                    break;
            }
        }
    }

    public get isRanged() {
        return this.ranged;
    }
    public get isWorker() {
        return this.offensivePower === 0 && this.healPower === 0;
    }

    public get OffensivePower() {
        return this.offensivePower;
    }

    public get Ranged() {
        return this.ranged;
    }

    public get HealPower() {
        return this.healPower;
    }

    /**
     * Early tick calculations, used to check the status diff between the previous and the current tick
     */
    public abstract earlyTick(): void;

    // #region Creep interface implementation
    public get prototype() {
        return this.creep.prototype;
    }
    public get spawning() {
        return this.creep.spawning;
    }
    public get hits() {
        return this.creep.hits;
    }
    public get hitsMax() {
        return this.creep.hitsMax;
    }
    public get my() {
        return this.creep.my;
    }
    public get fatigue() {
        return this.creep.fatigue;
    }
    public get body() {
        return this.creep.body;
    }
    public get store() {
        return this.creep.store;
    }
    public get initialPos() {
        return this.creep.initialPos;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Wrong type
    public get id(): Id<Creep> {
        return this.creep.id;
    }
    public get exists() {
        return this.creep.exists;
    }
    public get ticksToDecay() {
        return this.creep.ticksToDecay;
    }
    public get x() {
        return this.creep.x;
    }
    public get y() {
        return this.creep.y;
    }
    public getRangeTo(pos: RoomPosition): number {
        return this.creep.getRangeTo(pos);
    }
    public findInRange<T extends RoomPosition>(positions: T[], range: number): T[] {
        return this.creep.findInRange(positions, range);
    }
    public findClosestByRange<T extends RoomPosition>(positions: T[]): T | null {
        return this.creep.findClosestByRange(positions);
    }
    public findClosestByPath<T extends RoomPosition>(positions: T[], opts?: FindPathOpts | undefined): T | null {
        return this.creep.findClosestByPath(positions, opts);
    }
    public toJSON(): RoomObjectJSON {
        return this.creep.toJSON();
    }
    // #endregion Creep interface implementation
}
