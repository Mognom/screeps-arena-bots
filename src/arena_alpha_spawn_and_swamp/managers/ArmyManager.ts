import { Creep, StructureSpawn } from "game/prototypes";
import { HUNTER_TEMPLATE, KITE_TEMPLATE } from "common/constants/templates";

import { AttackerRole } from "common/roles/AttackerRole";
import { EnemyTracker } from "common/utils/EnemyTracker/EnemyTracker";
import { HunterRole } from "common/roles/HunterRole";
import { Manager } from "common/managers/Manager";
import { MidGameEconomyManager } from "./MidGameEconomyManager";
import { Priority } from "common/managers/spawn/Priority";
import { SpawnManager } from "common/managers/spawn/SpawnManager";
import { SpawnOrder } from "common/managers/spawn/SpawnOrder";

const ARMY_QUEUE_NAME = "army";
const HUNTER_QUEUE_NAME = "hunt";

export class ArmyManager extends Manager {
    private midGameEconomyManager: MidGameEconomyManager;
    private hunter: HunterRole | undefined;
    private army: AttackerRole[];
    private spawnManager: SpawnManager;
    private enemySpawn: StructureSpawn;
    private hunterOrdered = false;

    public constructor(spawnManager: SpawnManager, enemySpawn: StructureSpawn, midGameEconomyManager: MidGameEconomyManager) {
        super();
        this.midGameEconomyManager = midGameEconomyManager;
        this.army = [];
        this.spawnManager = spawnManager;
        this.enemySpawn = enemySpawn;
    }

    public tick(): boolean {
        this.tickArmy(this.midGameEconomyManager.builder);
        return this.buildArmy();
    }

    private buildArmy(): boolean {
        if (!this.hunterOrdered) {
            const huntOrder = new SpawnOrder(HUNTER_QUEUE_NAME, Priority.Important, HUNTER_TEMPLATE, (creep: Creep) => (this.hunter = new HunterRole(creep)));
            this.spawnManager.spawnCreep(huntOrder);
            this.hunterOrdered = true;
        } else {
            if (this.spawnManager.getQueuedCountForName(ARMY_QUEUE_NAME) === 0) {
                const armyOrder = new SpawnOrder(ARMY_QUEUE_NAME, Priority.Standard, KITE_TEMPLATE, (creep: Creep) => this.army.push(new AttackerRole(creep)));
                this.spawnManager.spawnCreep(armyOrder);
            }
        }
        return true;
    }

    private tickArmy(gatherer: Creep | undefined) {
        const enemyCreeps = EnemyTracker.i.getEnemyCreeps();
        const enemyArmy = EnemyTracker.i.getEnemyArmy();
        const enemyWorkers = EnemyTracker.i.getEnemWorkers();
        if (this.hunter) {
            this.hunter.run(enemyCreeps, gatherer, this.army);
        }
        for (const creep of this.army) {
            creep.run(this.army, enemyArmy, enemyWorkers, this.army.length <= 3);
        }
    }
}
