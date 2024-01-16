import { Manager } from "common/managers/Manager";
import { Creep, StructureSpawn } from "game/prototypes";
import * as C from "game/constants";

/**
 * The `Priority` enum is used to ensure important tasks are performed first.
 *
 * Spawns use the priority on orders to spawn more important creeps first.
 */
export enum Priority {
    Blocker = 0,
    Critical = 1,
    Important = 2,
    Standard = 3,
    Low = 4,
    Trivial = 5,
    Overflow = 6
}

export class SpawnOrder {
    public priority: Priority;
    public body: C.BodyPartConstant[];
    public callback: (a: Creep) => void;
    public name: String;

    constructor(name: String, priority: Priority, body: C.BodyPartConstant[], callback: (a: Creep) => void) {
        this.priority = priority;
        this.body = body;
        this.callback = callback;
        this.name = name;
    }
}

export class SpawnManager extends Manager {
    public spawn: StructureSpawn;
    private spawnQueue: SpawnOrder[];
    private current: Creep | undefined;
    private currentOrder: SpawnOrder | undefined;

    constructor(spawn: StructureSpawn) {
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

    public getQueuedCountForName(name: String) {
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

        var order = this.spawnQueue[0];

        if (order) {
            var result = this.spawn.spawnCreep(order.body);
            if (result.object != undefined) {
                this.currentOrder = order;
                this.current = result.object;
                this.spawnQueue.shift();
            }
        }
    }
}
