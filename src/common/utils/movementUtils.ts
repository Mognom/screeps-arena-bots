import { Creep, RoomPosition } from "game/prototypes";

import { CostMatrix } from "game/path-finder";
import { EnemyTracker } from "./EnemyTracker";
import { getTicks } from "game/utils";

let storedTick = 0;
let costMatrix: CostMatrix | undefined;

export function flee(creep: Creep, from: RoomPosition): void {
    /**
     * TODO
     * - change to searchPath
     * - Add heatmap to positions surrounding enemies
     * */
    console.log("Fleeing " + creep.id);
    creep.moveTo(from, { flee: true, range: 5, costMatrix: calculateCostMatrix() });
}

function calculateCostMatrix(): CostMatrix {
    const thisTick = getTicks();
    if (storedTick !== thisTick) {
        costMatrix = new CostMatrix();
        storedTick = thisTick;

        costMatrix = new CostMatrix();
        const enemies = EnemyTracker.getEnemyArmy();
        for (const enemy of enemies) {
            costMatrix.set(enemy.x, enemy.y, 100);
            for (let x = enemy.x - 2; x <= enemy.x + 2; x++) {
                for (let y = enemy.y - 2; y <= enemy.y + 2; y++) {
                    if (x === enemy.x && y === enemy.y) {
                        continue;
                    }
                    const cost = Math.max(costMatrix.get(x, y), 50 / Math.max(Math.abs(x - enemy.x), Math.abs(y - enemy.y)));
                    costMatrix.set(x, y, cost);
                }
            }
        }
    }
    return costMatrix!;
}
