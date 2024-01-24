import * as C from "game/constants";

import { ConstructionSite, Creep, Resource, StructureContainer, StructureExtension, StructureRampart } from "game/prototypes";
import { LEFT_BASE_X, RIGHT_BASE_X } from "common/constants";
import { createConstructionSite, getObjectsByPrototype } from "game/utils";

import { Manager } from "common/managers/Manager";
import { Priority } from "common/managers/spawn/Priority";
import { REMOTEBUILDER_TEMPLATE } from "common/constants/templates";
import { SpawnManager } from "common/managers/spawn/SpawnManager";
import { SpawnOrder } from "common/managers/spawn/SpawnOrder";

const EXTENSION_POSITIONS = [
    { x: 1, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 }
];
/**
 * TODO:
 * - Build home rampart
 * - TODO: refactor into state machine
 * - auxiliar gatherers
 * - build forward spawn?
 */
export class MidGameEconomyManager extends Manager {
    public builder: Creep | undefined;
    private builderRequested = false;
    private spawnManager: SpawnManager;
    private currentTarget: StructureContainer | null;
    private energyDrop: Resource | null;
    private currentExtension: ConstructionSite | undefined;
    private currentExtensionIndex: number;
    private currentState: number;

    public constructor(spawnManager: SpawnManager) {
        super();
        this.spawnManager = spawnManager;
        this.currentTarget = null;
        this.energyDrop = null;
        this.currentExtensionIndex = 0;
        this.currentState = 0;
    }

    private findNewTarget(): void {
        const validContainers = getObjectsByPrototype(StructureContainer).filter(
            c => c.store.getUsedCapacity(C.RESOURCE_ENERGY)! > 0 && c.x >= LEFT_BASE_X && c.x <= RIGHT_BASE_X
        );
        this.currentTarget = this.builder!.findClosestByPath(validContainers);
    }

    private findEnergyDrop(): void {
        this.energyDrop = this.builder!.findInRange(getObjectsByPrototype(Resource), 1)[0];
        console.log("New energy: " + this.energyDrop?.id);
        this.currentExtensionIndex = 0;
    }

    private tryFillExtensions(): void {
        const neighboringExtensions = this.builder?.findInRange(
            getObjectsByPrototype(StructureExtension).filter(c => c.store.getFreeCapacity(C.RESOURCE_ENERGY)! > 0),
            1
        );
        if (neighboringExtensions!.length > 0) {
            this.builder!.transfer(neighboringExtensions![0], C.RESOURCE_ENERGY);
        }
    }

    private tickBuildInitialRampart(): void {
        if (this.currentExtension?.exists === false) {
            this.builder!.transfer(this.spawnManager.spawn, C.RESOURCE_ENERGY);
            this.currentState = 1;
        }

        if (!this.currentExtension) {
            const site = createConstructionSite(this.spawnManager.spawn, StructureRampart);
            this.currentExtension = site.object;
        }
        this.builder!.withdraw(this.spawnManager.spawn, C.RESOURCE_ENERGY);
        this.builder!.build(this.currentExtension!);
    }

    public tick(): boolean {
        this.buildCreeps();
        this.handleCreeps();
        return true;
    }

    public buildCreeps() {
        if (!this.builderRequested) {
            const remoteHarvesterOrder = new SpawnOrder("localrelay", Priority.Standard, REMOTEBUILDER_TEMPLATE, (creep: Creep) => (this.builder = creep));
            this.spawnManager.spawnCreep(remoteHarvesterOrder);
            this.builderRequested = true;
        }
    }

    public handleCreeps() {
        if (this.builder && !this.builder.spawning) {
            if (this.currentState === 0) {
                this.tickBuildInitialRampart();
                return true;
            }

            if (this.currentState === 1 || this.currentState === 2) {
                // If there is no energy drop, find a new target
                if (this.currentState === 1) {
                    this.findNewTarget(); // Renew it each tick to find the closest always
                }

                if (this.currentTarget && this.currentTarget.exists && this.currentTarget.store.getUsedCapacity(C.RESOURCE_ENERGY)! > 0) {
                    // There is energy in the container, drain it to the ground
                    this.builder.withdraw(this.currentTarget, C.RESOURCE_ENERGY);

                    if (this.builder.drop(C.RESOURCE_ENERGY) === C.OK) {
                        if (!this.energyDrop || this.energyDrop.exists === false) {
                            console.log("GATHER: Start collection phase");
                            this.currentState = 2;
                            this.findEnergyDrop();
                        }
                    }

                    this.builder.moveTo(this.currentTarget);
                } else {
                    if (this.currentState === 2) {
                        console.log("GATHER: Start building phase");
                        this.currentState = 3;
                    }
                }
            } else {
                // The container is now drained
                if (this.energyDrop && this.energyDrop.exists) {
                    this.builder.pickup(this.energyDrop);

                    if (!this.currentExtension || this.currentExtension.exists === false) {
                        this.currentExtension = undefined;
                        while (!this.currentExtension && this.currentExtensionIndex < EXTENSION_POSITIONS.length) {
                            const position = {
                                x: this.builder.x + EXTENSION_POSITIONS[this.currentExtensionIndex].x,
                                y: this.builder.y + EXTENSION_POSITIONS[this.currentExtensionIndex].y
                            };
                            this.currentExtensionIndex += 1;
                            this.currentExtension = createConstructionSite(position, StructureExtension).object;
                        }
                        console.log("Getting new extension");
                    }
                    if (!this.currentExtension) {
                        // No more extension space
                        this.currentState = 1;
                        this.currentTarget = null;
                        this.energyDrop = null;
                        this.currentExtension = undefined;
                        this.currentExtensionIndex = 0;
                        console.log("GATHER: Start fetch phase");
                    } else {
                        this.builder.build(this.currentExtension);
                        this.tryFillExtensions();
                    }
                } else {
                    // Empty energy source
                    this.currentState = 1;
                    this.currentTarget = null;
                    this.energyDrop = null;
                    this.currentExtension = undefined;
                    this.currentExtensionIndex = 0;
                    console.log("GATHER: Start fetch phase");
                }
            }
        }

        return true;
    }
}
