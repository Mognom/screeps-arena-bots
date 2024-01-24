import * as C from "game/constants";

import { BuildableStructure, CreepActionReturnCode, DirectionConstant, ResourceConstant } from "game/constants";
import { ConstructionSite, Creep, Id, Resource, RoomObjectJSON, RoomPosition, Source, Structure, StructureConstant } from "game/prototypes";
import { FindPathOpts, MoveToOpts, PathStep } from "game/path-finder";

import { ScoreCollector } from "arena/prototypes";

/**
 * Role decorator to extend the Creep class, and allow specialization
 */
export abstract class Role implements Creep {
    private creep: Creep;
    // Decorated properties
    protected plannedHealing: number;
    private previousHits: number;
    protected damageReceived: number;
    private currentSwampSpeed: number;

    // Combat stats of the creep
    private offensivePower: number;
    private ranged: boolean;
    private healPower: number;

    public constructor(creep: Creep) {
        this.creep = creep;
        this.plannedHealing = 0;
        this.damageReceived = 0;
        this.previousHits = creep.hits;
        this.currentSwampSpeed = 2;

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

    /**
     * Early tick calculations, used to check the status diff between the previous and the current tick
     */
    public earlyTick(): void {
        this.damageReceived = this.previousHits + this.plannedHealing - this.hits;

        this.plannedHealing = 0;
        this.previousHits = this.hits;

        // Calculate cost of moving through swamps fro this Creep current status
        if (this.hits < this.hitsMax) {
            const bodyCount = this.hitsMax / 100;
            const moveCount = (bodyCount * 5) / 6;
            const brokenMoves = this.hits % 100;

            const staminaPerTick = (moveCount - brokenMoves) * 2;
            const staminaPerMove = (10 * bodyCount) / 6;
            this.currentSwampSpeed = Math.ceil(staminaPerMove / staminaPerTick) * 2; // *2 to go from movement ticks to terrain cost
        }
    }

    /**
     *
     * @param args Any args required by the specific role
     */
    public abstract run(...args: any[]): void;

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

    public move(direction: DirectionConstant) {
        return this.creep.move(direction);
    }
    public moveTo(target: RoomPosition, opts?: MoveToOpts | undefined) {
        if (!opts) {
            opts = {};
        }
        if (opts.swampCost === undefined) {
            opts.swampCost = this.currentSwampSpeed;
        }

        return this.creep.moveTo(target, opts);
    }
    public rangedAttack(target: Creep | Structure<StructureConstant>) {
        return this.creep.rangedAttack(target);
    }
    public rangedMassAttack() {
        return this.creep.rangedMassAttack();
    }
    public attack(target: Creep | Structure<StructureConstant>) {
        return this.creep.attack(target);
    }
    public heal(target: Role | Creep): CreepActionReturnCode {
        if (target instanceof Role) {
            target = target.creep;
        }
        return this.creep.heal(target);
    }

    public rangedHeal(target: Creep) {
        return this.creep.rangedHeal(target);
    }
    public harvest(target: Source) {
        return this.creep.harvest(target);
    }
    public pull(target: Creep) {
        return this.creep.pull(target);
    }
    public transfer(target: Creep | Structure<StructureConstant> | ScoreCollector, resourceType: ResourceConstant, amount?: number | undefined) {
        return this.creep.transfer(target, resourceType, amount);
    }
    public withdraw(target: Structure<StructureConstant>, resourceType: ResourceConstant, amount?: number | undefined) {
        return this.creep.withdraw(target, resourceType, amount);
    }
    public drop(resourceType: ResourceConstant, amount?: number | undefined) {
        return this.creep.drop(resourceType, amount);
    }
    public pickup(target: Resource) {
        return this.creep.pickup(target);
    }
    public build(target: ConstructionSite<BuildableStructure>) {
        return this.creep.build(target);
    }
    public getRangeTo(pos: RoomPosition): number {
        return this.creep.getRangeTo(pos);
    }
    public findPathTo(pos: RoomPosition, opts?: FindPathOpts | undefined): PathStep[] {
        return this.creep.findPathTo(pos, opts);
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
