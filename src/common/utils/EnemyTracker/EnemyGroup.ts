import { EnemyCreep } from "common/roles/EnemyCreep";
import { Visual } from "game/visual";

export class EnemyGroup {
    private creeps: EnemyCreep[];
    private combatPower: number;
    private healPower: number;
    private threatLevel: number;

    public constructor() {
        this.creeps = [];
        this.combatPower = 0;
        this.healPower = 0;
        this.threatLevel = 0; // TODO calculate
    }

    public addCreep(creep: EnemyCreep): EnemyGroup {
        this.creeps.push(creep);
        // TODO recalculate stats
        return this;
    }

    public removeCreep(creep: EnemyCreep) {
        this.creeps.splice(this.creeps.indexOf(creep), 1);
    }

    public debugVisual(debugVisual: Visual): void {
        for (let i = 1; i < this.creeps.length; i++) {
            const previousCreep = this.creeps[i - 1];
            const currentCreep = this.creeps[i];
            debugVisual.line({ x: previousCreep.x, y: previousCreep.y }, { x: currentCreep.x, y: currentCreep.y });
        }
    }
}
