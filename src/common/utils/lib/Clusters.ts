import { EnemyCreep } from "common/roles/EnemyCreep";
import { EnemyGroup } from "../EnemyTracker/EnemyGroup";

export class Clusters {
    public static run(creeps: EnemyCreep[], maxDistance: number): EnemyGroup[] {
        const visited = new Set<number>();
        const result: EnemyGroup[] = [];

        for (let j = 0; j < creeps.length; j++) {
            if (visited.has(j)) {
                continue;
            }

            const creep = creeps[j];
            const cluster = new EnemyGroup();
            cluster.addCreep(creep);
            visited.add(j);

            for (let i = j + 1; i < creeps.length; i++) {
                if (visited.has(i)) {
                    continue;
                }

                const creep2 = creeps[i];
                const distanceSquared = (creep.x - creep2.x) ** 2 + (creep.y - creep2.y) ** 2;

                if (distanceSquared <= maxDistance ** 2) {
                    visited.add(i);
                    cluster.addCreep(creep2);
                }
            }

            result.push(cluster);
        }

        return result;
    }
}
