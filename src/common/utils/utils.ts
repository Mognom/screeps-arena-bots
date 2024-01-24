import { Creep, RoomPosition } from "game/prototypes";

export function flee(creep: Creep, from: RoomPosition): void {
    // TODO change to searchPath
    creep.moveTo(from, { flee: true, range: 5 });
}
