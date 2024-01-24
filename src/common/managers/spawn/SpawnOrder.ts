import * as C from "game/constants";

import { Creep } from "game/prototypes";
import { Priority } from "./Priority";

export class SpawnOrder {
    public priority: Priority;
    public body: C.BodyPartConstant[];
    public callback: (a: Creep) => void;
    public name: string;

    public constructor(name: string, priority: Priority, body: C.BodyPartConstant[], callback: (a: Creep) => void) {
        this.priority = priority;
        this.body = body;
        this.callback = callback;
        this.name = name;
    }
}
