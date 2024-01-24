import { Creep, StructureSpawn } from "game/prototypes";

import { Manager } from "common/managers/Manager";
import { SpawnOrder } from "./SpawnOrder";

/**
 * The `Priority` enum is used to ensure important tasks are performed first.
 *
 * Spawns use the priority on orders to spawn more important creeps first.
 */

export class SpawnManager extends Manager {
    public spawn: StructureSpawn;
    private spawnQueue: SpawnOrder[];
    private current: Creep | undefined;
    private currentOrder: SpawnOrder | undefined;

    public constructor(spawn: StructureSpawn) {
        super();
        this.spawn = spawn;
        this.spawnQueue = [];
    }

    public tick(): boolean {
        this.processQueue();
        return true;
    }

    public spawnCreep(order: SpawnOrder): boolean {
        this.spawnQueue.push(order);
        this.spawnQueue.sort((a, b) => a.priority - b.priority);

        return true;
    }

    public getQueuedCountForName(name: string) {
        return this.spawnQueue.filter(r => r.name === name).length;
    }

    private processQueue() {
        if (this.current?.spawning === true ?? false) {
            // wait until the current one is done spawning
            return;
        } else if (this.currentOrder !== undefined) {
            this.currentOrder.callback(this.current!);
            this.currentOrder = undefined;
        }

        const order = this.spawnQueue[0];

        if (order) {
            const result = this.spawn.spawnCreep(order.body);
            if (result.object !== undefined) {
                this.currentOrder = order;
                this.current = result.object;
                this.spawnQueue.shift();
            }
        }
    }
}
