import { ScoreCollector } from "arena/prototypes";
import { BuildableStructure } from "game/constants";
import { MoveToOpts, FindPathOpts, PathStep } from "game/path-finder";
import { ConstructionSite, Creep, Id, Resource, RoomObjectJSON, RoomPosition, Source, Store, Structure, StructureConstant } from "game/prototypes";

/**
 * Role decorator to extend the Creep class, and allow specialization
 */
export abstract class Role implements Creep {
    private creep: Creep;
    // Decorated properties
    plannedHealing: number;
    private previousHits: number;
    damageReceived: number;

    constructor(creep: Creep) {
        this.creep = creep;
        this.plannedHealing = 0;
        this.damageReceived = 0;
        this.previousHits = creep.hits;
    }

    /**
     * Early tick calculations, used to check the status diff between the previous and the current tick
     */
    earlyTick(): void {
        this.damageReceived = this.previousHits + this.plannedHealing - this.hits;

        this.plannedHealing = 0;
        this.previousHits = this.hits;
    }

    /**
     *
     * @param args Any args required by the specific role
     */
    abstract run(...args: any[]): void;

    //#region Creep interface implementation
    get prototype() {
        return this.creep.prototype;
    }
    get spawning() {
        return this.creep.spawning;
    }
    get hits() {
        return this.creep.hits;
    }
    get hitsMax() {
        return this.creep.hitsMax;
    }
    get my() {
        return this.creep.my;
    }
    get fatigue() {
        return this.creep.fatigue;
    }
    get body() {
        return this.creep.body;
    }
    get store() {
        return this.creep.store;
    }
    get initialPos() {
        return this.creep.initialPos;
    }
    get id(): Id<any> {
        return this.creep.id;
    }
    get exists() {
        return this.creep.exists;
    }
    get ticksToDecay() {
        return this.creep.ticksToDecay;
    }
    get x() {
        return this.creep.x;
    }
    get y() {
        return this.creep.y;
    }

    move(direction: any) {
        return this.creep.move(direction);
    }
    moveTo(target: RoomPosition, opts?: MoveToOpts | undefined) {
        return this.creep.moveTo(target, opts);
    }
    rangedAttack(target: Creep | Structure<StructureConstant>) {
        return this.creep.rangedAttack(target);
    }
    rangedMassAttack() {
        return this.creep.rangedMassAttack();
    }
    attack(target: Creep | Structure<StructureConstant>) {
        return this.creep.attack(target);
    }
    heal(target: Creep) {
        return this.creep.heal(target);
    }
    rangedHeal(target: Creep) {
        return this.creep.rangedHeal(target);
    }
    harvest(target: Source) {
        return this.creep.harvest(target);
    }
    pull(target: Creep) {
        return this.creep.pull(target);
    }
    transfer(target: Creep | Structure<StructureConstant> | ScoreCollector, resourceType: any, amount?: number | undefined) {
        return this.creep.transfer(target, resourceType, amount);
    }
    withdraw(target: Structure<StructureConstant>, resourceType: any, amount?: number | undefined) {
        return this.creep.withdraw(target, resourceType, amount);
    }
    drop(resourceType: any, amount?: number | undefined) {
        return this.creep.drop(resourceType, amount);
    }
    pickup(target: Resource) {
        return this.creep.pickup(target);
    }
    build(target: ConstructionSite<BuildableStructure>) {
        return this.creep.build(target);
    }
    getRangeTo(pos: RoomPosition): number {
        return this.creep.getRangeTo(pos);
    }
    findPathTo(pos: RoomPosition, opts?: FindPathOpts | undefined): PathStep[] {
        return this.creep.findPathTo(pos, opts);
    }
    findInRange<T extends RoomPosition>(positions: T[], range: number): T[] {
        return this.creep.findInRange(positions, range);
    }
    findClosestByRange<T extends RoomPosition>(positions: T[]): T | null {
        return this.creep.findClosestByRange(positions);
    }
    findClosestByPath<T extends RoomPosition>(positions: T[], opts?: FindPathOpts | undefined): T | null {
        return this.creep.findClosestByPath(positions, opts);
    }
    toJSON(): RoomObjectJSON {
        return this.creep.toJSON();
    }

    //#endregion Creep interface implementation
}
