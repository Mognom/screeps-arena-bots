import { Creep, StructureSpawn, RoomPosition } from "game/prototypes";
import { MoveToOpts } from "game/path-finder";
import * as C from "game/constants";

export function flee(creep: Creep, from: RoomPosition): void {
    // TODO change to searchPath
    creep.moveTo(from, { flee: true, range: 5 } as MoveToOpts);
}
