import { Creep, StructureSpawn, RoomPosition } from 'game/prototypes';
import { MoveToOpts } from 'game/path-finder'
import * as C from "game/constants";

export function attempSpawn(spawn: StructureSpawn, partList: (C.BodyPartConstant)[]): Creep | undefined {
    var res = spawn.spawnCreep(partList);

    if (res.error === undefined) {
        return res.object!;
    } else {
        return undefined;
    }
}

export function flee(creep: Creep, from: RoomPosition): void {
    // TODO change to searchPath
    creep.moveTo(from, { flee: true, range: 5 } as MoveToOpts)
}
