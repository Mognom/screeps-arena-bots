import { Creep } from "game/prototypes";
import { CreepDecorator } from "./CreepDecorator";

/**
 * Role decorator to extend the Creep class, and allow specialization
 */
export class EnemyCreep extends CreepDecorator {
    // Decorated properties
    private plannedDamage: number;
    private previousHits: number;
    private estimatedHealing: number;

    public constructor(creep: Creep) {
        super(creep);
        this.plannedDamage = 0;
        this.estimatedHealing = 0;
        this.previousHits = creep.hits;
    }

    /**
     * Early tick calculations, used to check the status diff between the previous and the current tick
     */
    public earlyTick(): void {
        // This is the healing it received last tick
        this.estimatedHealing = this.hits - this.previousHits + this.plannedDamage;

        this.plannedDamage = 0;
        this.previousHits = this.hits;
    }

    // Check if it would die this tick with the current planned damage
    public isPlannedDead(newDamage: number = 0): boolean {
        return this.hits - this.plannedDamage - newDamage + this.estimatedHealing <= 0;
    }

    /**
     * Add planned damage to this creep if it is not yet expected to die this tick
     * @param damage : The amount of damage that it would be added
     * @returns boolean: If the attack was added or not.
     */
    public addDamageIfNeeded(damage: number): boolean {
        if (this.isPlannedDead()) {
            return false;
        }

        this.addDamage(damage);
        return true;
    }

    public addDamage(damage: number): void {
        this.plannedDamage += damage;
    }
}
