import { Manager } from 'common/managers/Manager'
import { getObjectsByPrototype, createConstructionSite } from 'game/utils';
import { Creep, StructureContainer, StructureSpawn, StructureExtension, ConstructionSite, StructureRoad, RoomPosition } from 'game/prototypes';
import { attempSpawn, flee } from "common/utils/utils"
import * as C from "game/constants";

const LOCALMINER = [C.CARRY, C.MOVE]
const LOCALRELAY = [C.CARRY]
/**
 * TODO:
 * - Fix stop if no more container
 * - Harvest middle
 * - Add extension as deposits when harvesting middle
 */
export class BootStrapEconomyManager extends Manager {

    localMiner: Creep | undefined
    relay: Creep | undefined
    spawn: StructureSpawn
    leftSided: boolean
    initialContainers: StructureContainer[]

    constructor(spawn: StructureSpawn, leftSided: boolean) {
        super();
        this.spawn = spawn
        this.leftSided = leftSided
        this.initialContainers = spawn.findInRange(getObjectsByPrototype(StructureContainer), 5)
    }

    tick(): boolean {
        if (this.localMiner && !this.localMiner.spawning) {
            if (this.localMiner && (!this.relay || this.relay.spawning)) {
                this.localMinerTick(this.localMiner, this.initialContainers[1]);
            } else {
                var targetContainer = this.initialContainers.find(c => c.store.getUsedCapacity(C.RESOURCE_ENERGY));
                if (targetContainer) {
                    var deltaPos = this.leftSided ? +1 : -1;
                    if (this.localMiner!.store.getFreeCapacity(C.RESOURCE_ENERGY)) {
                        this.localMiner!.moveTo({ x: this.initialContainers[1].x + deltaPos, y: this.initialContainers[1].y })
                        if (this.localMiner!.withdraw(targetContainer!, C.RESOURCE_ENERGY) === C.ERR_NOT_IN_RANGE) {
                            this.localMiner!.moveTo({ x: this.initialContainers[1].x + deltaPos, y: this.initialContainers[1].y })
                        } else {
                            this.localMiner!.moveTo(this.spawn);
                        }
                        this.relay!.transfer(this.spawn, C.RESOURCE_ENERGY);
                    } else {
                        if (this.localMiner!.transfer(this.spawn, C.RESOURCE_ENERGY) !== C.ERR_NOT_IN_RANGE) {
                            this.localMiner!.moveTo({ x: this.initialContainers[1].x + deltaPos * 2, y: this.initialContainers[1].y })
                            this.localMiner?.pull(this.relay!);
                            this.relay?.moveTo(this.localMiner!)
                        }
                        if (this.localMiner!.transfer(this.relay!, C.RESOURCE_ENERGY) === C.ERR_NOT_IN_RANGE) {
                            this.localMiner!.moveTo({ x: this.initialContainers[1].x + deltaPos * 3, y: this.initialContainers[1].y });
                        } else {
                            this.localMiner!.moveTo({ x: this.initialContainers[1].x + deltaPos, y: this.initialContainers[1].y });
                        }
                    }
                }
            }
        }

        if (!this.localMiner) {
            this.localMiner = attempSpawn(this.spawn, LOCALMINER);
        } else if (!this.relay) {
            this.relay = attempSpawn(this.spawn, LOCALRELAY);
        } else {
            return true;
        }
        //  else if (!baseBuilder) {
        //     baseBuilder = attempSpawn(BUILDER);
        // } else if (!extensionRelay) {
        //     extensionRelay = attempSpawn(LOCALEXTENSIONRELAY);
        // }
        return false;

        // if (baseBuilder && baseBuilder.spawning == false) {
        //     if (currentBaseConstruction && currentBaseConstruction.exists === false) {
        //         currentBaseConstruction = undefined;
        //     }
        //     while (!currentBaseConstruction) {
        //         var position = { x: mySpawn.x, y: mySpawn.y };
        //         position.x += Math.floor(Math.random() * (5 - 2)) + 2;
        //         position.y += Math.floor(Math.random() * (3 + 2)) - 2;
        //         currentBaseConstruction = createConstructionSite(position, StructureExtension).object;
        //     }

        //     if (!baseBuilder.store[C.RESOURCE_ENERGY]) {
        //         if (baseBuilder.withdraw(mySpawn, C.RESOURCE_ENERGY) == C.ERR_NOT_IN_RANGE) {
        //             baseBuilder.moveTo(mySpawn);
        //         }
        //     } else {
        //         if (baseBuilder.build(currentBaseConstruction) == C.ERR_NOT_IN_RANGE) {
        //             baseBuilder.moveTo(currentBaseConstruction);
        //         }
        //     }
        // }

        // if (extensionRelay && extensionRelay.spawning == false) {

        //     var depletedExtensions = getObjectsByPrototype(StructureExtension).filter(s => s.my && s.store.getFreeCapacity(C.RESOURCE_ENERGY)! > 0);

        //     if (!extensionRelay.store[C.RESOURCE_ENERGY]) {
        //         if (extensionRelay.withdraw(mySpawn, C.RESOURCE_ENERGY) == C.ERR_NOT_IN_RANGE) {
        //             extensionRelay.moveTo(mySpawn);
        //         }
        //     } else {
        //         var targetExtension = extensionRelay.findClosestByRange(depletedExtensions);
        //         if (targetExtension) {
        //             if (extensionRelay.transfer(targetExtension, C.RESOURCE_ENERGY) == C.ERR_NOT_IN_RANGE) {
        //                 console.log(extensionRelay.moveTo(targetExtension));
        //             }
        //         }
        //     }
        //     return true;
        // }
    }

    private localMinerTick(creep: Creep, targetContainer: StructureContainer) {
        if (creep.spawning == true || creep.x === undefined) {
            return;
        }

        if (creep.store.getFreeCapacity(C.RESOURCE_ENERGY)) {
            if (creep.withdraw(targetContainer, C.RESOURCE_ENERGY) == C.ERR_NOT_IN_RANGE) {
                creep.moveTo(targetContainer);
            } else {
                creep.moveTo(this.spawn);
            }
        } else {
            if (creep.transfer(this.spawn, C.RESOURCE_ENERGY) == C.ERR_NOT_IN_RANGE) {
                creep.moveTo(this.spawn);
            } else {
                creep.moveTo(targetContainer);
            }
        }
    }

}
