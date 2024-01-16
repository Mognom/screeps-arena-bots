import { Creep } from "game/prototypes";
export abstract class Role {
    public creep: Creep;
    constructor(creep: Creep) {
        this.creep = creep;
    }
    abstract run(...args: any[]): void;
}
