import { BuildableStructure, CreepActionReturnCode, DirectionConstant, ResourceConstant } from "game/constants";
import { ConstructionSite, Creep, Resource, RoomPosition, Source, Structure, StructureConstant } from "game/prototypes";
import { FindPathOpts, MoveToOpts, PathStep } from "game/path-finder";

import { CreepDecorator } from "./CreepDecorator";
import { EnemyCreep } from "./EnemyCreep";
import { ScoreCollector } from "arena/prototypes";

/**
 * Role decorator to extend the Creep class, and allow specialization
 */
export abstract class OwnedCreep extends CreepDecorator {
    // Decorated properties
    protected plannedHealing: number;
    private previousHits: number;
    protected damageReceived: number;
    private currentSwampSpeed: number;

    public constructor(creep: Creep) {
        super(creep);
        this.plannedHealing = 0;
        this.damageReceived = 0;
        this.previousHits = creep.hits;
        this.currentSwampSpeed = 2;
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
    public rangedAttack(target: EnemyCreep | Creep | Structure<StructureConstant>) {
        if (target instanceof EnemyCreep) {
            target = target.creep;
        }
        return this.creep.rangedAttack(target);
    }
    public rangedMassAttack() {
        return this.creep.rangedMassAttack();
    }
    public attack(target: EnemyCreep | Creep | Structure<StructureConstant>) {
        if (target instanceof EnemyCreep) {
            target = target.creep;
        }
        return this.creep.attack(target);
    }

    public heal(target: OwnedCreep | Creep): CreepActionReturnCode {
        if (target instanceof OwnedCreep) {
            target.plannedHealing += this.healPower;
            target = target.creep;
        }
        return this.creep.heal(target);
    }

    public rangedHeal(target: OwnedCreep | Creep) {
        if (target instanceof OwnedCreep) {
            target.plannedHealing += this.healPower / 3; // Ranged heals are 1/3 effective
            target = target.creep;
        }
        return this.creep.rangedHeal(target);
    }
    public harvest(target: Source) {
        return this.creep.harvest(target);
    }
    public pull(target: Creep | OwnedCreep) {
        if (target instanceof OwnedCreep) {
            target = target.creep;
        }
        return this.creep.pull(target);
    }
    public transfer(target: OwnedCreep | Creep | Structure<StructureConstant> | ScoreCollector, resourceType: ResourceConstant, amount?: number | undefined) {
        if (target instanceof OwnedCreep) {
            target = target.creep;
        }
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
    public findPathTo(pos: RoomPosition, opts?: FindPathOpts | undefined): PathStep[] {
        return this.creep.findPathTo(pos, opts);
    }
    // #endregion Creep interface implementation
}
