import * as C from "game/constants";

import { Creep, StructureContainer } from "game/prototypes";
import { LOCALMINER, LOCALRELAY } from "common/constants/templates";

import { Manager } from "common/managers/Manager";
import { Priority } from "common/managers/spawn/Priority";
import { SpawnManager } from "common/managers/spawn/SpawnManager";
import { SpawnOrder } from "common/managers/spawn/SpawnOrder";
import { getObjectsByPrototype } from "game/utils";

/**
 * TODO:
 * - Fix stop if no more container
 * - Harvest middle
 * - Add extension as deposits when harvesting middle
 */
export class BootStrapEconomyManager extends Manager {
    private localMiner: Creep | undefined;
    private relay: Creep | undefined;
    private spawnManager: SpawnManager;
    private leftSided: boolean;
    private initialContainers: StructureContainer[];
    private requestedCreeps = false;

    public constructor(spawnManager: SpawnManager, leftSided: boolean) {
        super();
        this.spawnManager = spawnManager;
        this.leftSided = leftSided;
        this.initialContainers = spawnManager.spawn.findInRange(getObjectsByPrototype(StructureContainer), 5);
    }

    public tick(): boolean {
        if (!this.requestedCreeps) {
            this.requestCreeps();
            this.requestedCreeps = true;
        }
        return this.runHarvesterRelayPair();
    }

    private requestCreeps() {
        const harvesterOrder = new SpawnOrder("localMiner", Priority.Critical, LOCALMINER, (creep: Creep) => (this.localMiner = creep));
        const relayOrder = new SpawnOrder("localrelay", Priority.Critical, LOCALRELAY, (creep: Creep) => (this.relay = creep));

        this.spawnManager.spawnCreep(harvesterOrder);
        this.spawnManager.spawnCreep(relayOrder);
    }

    private runHarvesterRelayPair(): boolean {
        if (this.localMiner && !this.localMiner.spawning) {
            if (this.localMiner && (!this.relay || this.relay.spawning)) {
                this.localMinerTick(this.localMiner, this.initialContainers[1]);
            } else {
                const targetContainer = this.initialContainers.find(c => c.store.getUsedCapacity(C.RESOURCE_ENERGY));
                if (targetContainer) {
                    const deltaPos = this.leftSided ? +1 : -1;
                    if (this.localMiner.store.getFreeCapacity(C.RESOURCE_ENERGY)) {
                        this.localMiner.moveTo({
                            x: this.initialContainers[1].x + deltaPos,
                            y: this.initialContainers[1].y
                        });
                        if (this.localMiner.withdraw(targetContainer, C.RESOURCE_ENERGY) === C.ERR_NOT_IN_RANGE) {
                            this.localMiner.moveTo({
                                x: this.initialContainers[1].x + deltaPos,
                                y: this.initialContainers[1].y
                            });
                        } else {
                            this.localMiner.moveTo(this.spawnManager.spawn);
                        }
                        this.relay!.transfer(this.spawnManager.spawn, C.RESOURCE_ENERGY);
                    } else {
                        if (this.localMiner.transfer(this.spawnManager.spawn, C.RESOURCE_ENERGY) !== C.ERR_NOT_IN_RANGE) {
                            this.localMiner.moveTo({
                                x: this.initialContainers[1].x + deltaPos * 2,
                                y: this.initialContainers[1].y
                            });
                            this.localMiner?.pull(this.relay!);
                            this.relay?.moveTo(this.localMiner);
                        }
                        if (this.localMiner.transfer(this.relay!, C.RESOURCE_ENERGY) === C.ERR_NOT_IN_RANGE) {
                            this.localMiner.moveTo({
                                x: this.initialContainers[1].x + deltaPos * 3,
                                y: this.initialContainers[1].y
                            });
                        } else {
                            this.localMiner.moveTo({
                                x: this.initialContainers[1].x + deltaPos,
                                y: this.initialContainers[1].y
                            });
                        }
                    }
                }
            }
            return true;
        }
        return false;
    }

    private localMinerTick(creep: Creep, targetContainer: StructureContainer) {
        if (creep.spawning === true || creep.x === undefined) {
            return;
        }

        if (creep.store.getFreeCapacity(C.RESOURCE_ENERGY)) {
            if (creep.withdraw(targetContainer, C.RESOURCE_ENERGY) === C.ERR_NOT_IN_RANGE) {
                creep.moveTo(targetContainer);
            } else {
                creep.moveTo(this.spawnManager.spawn);
            }
        } else {
            if (creep.transfer(this.spawnManager.spawn, C.RESOURCE_ENERGY) === C.ERR_NOT_IN_RANGE) {
                creep.moveTo(this.spawnManager.spawn);
            } else {
                creep.moveTo(targetContainer);
            }
        }
    }
}
