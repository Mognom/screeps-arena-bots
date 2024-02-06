import { Clusters } from "../../src/common/utils/lib/Clusters";
import { EnemyCreep } from "../../src/common/roles/EnemyCreep";
import { EnemyGroup } from "../../src/common/utils/EnemyTracker/EnemyGroup";

describe("Clusters", () => {
    it("should cluster creeps based on maximum distance", () => {
        // Arrange
        const creeps = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 5, y: 5 }
        ] as EnemyCreep[];
        const maxDistance = 2;
        const expectedClusters = [
            new EnemyGroup().addCreep({ x: 0, y: 0 } as EnemyCreep).addCreep({ x: 1, y: 1 } as EnemyCreep),
            new EnemyGroup().addCreep({ x: 2, y: 2 } as EnemyCreep),
            new EnemyGroup().addCreep({ x: 5, y: 5 } as EnemyCreep)
        ];

        // Act
        const result = Clusters.run(creeps, maxDistance);

        // Assert
        expect(result).toEqual(expectedClusters);
    });

    it("should return an empty array when no creeps are provided", () => {
        // Arrange
        const creeps: EnemyCreep[] = [] as EnemyCreep[];
        const maxDistance = 2;
        const expectedClusters: any[] = [];

        // Act
        const result = Clusters.run(creeps, maxDistance);

        // Assert
        expect(result).toEqual(expectedClusters);
    });

    it("should return each individual creep as a separate cluster when maxDistance is 0", () => {
        // Arrange
        const creeps = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 }
        ] as EnemyCreep[];
        const maxDistance = 0;
        const expectedClusters = [
            new EnemyGroup().addCreep({ x: 0, y: 0 } as EnemyCreep),
            new EnemyGroup().addCreep({ x: 1, y: 1 } as EnemyCreep),
            new EnemyGroup().addCreep({ x: 2, y: 2 } as EnemyCreep)
        ];

        // Act
        const result = Clusters.run(creeps, maxDistance);

        // Assert
        expect(result).toEqual(expectedClusters);
    });
});
