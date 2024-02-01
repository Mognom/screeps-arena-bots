import { MaxDistanceClustering } from "../../src/common/utils/lib/MaxDistanceClustering";
import { RoomPosition } from "game/prototypes";

describe("MaxDistanceClustering", () => {
    it("should correctly cluster points with max distance constraint", () => {
        const points: RoomPosition[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 0 },
            { x: 10, y: 10 },
            { x: 12, y: 12 },
            { x: 11, y: 11 },
            { x: 13, y: 13 },
            { x: 14, y: 19 }
        ];

        const maxDist = 4;
        const clustering = new MaxDistanceClustering(points, maxDist);
        const clusters = clustering.run();

        // Add your assertions based on the expected clusters
        expect(clusters).toEqual([1, 1, 1, 2, 2, 2, 2, 3]);
    });

    it("should handle empty points array", () => {
        const points: RoomPosition[] = [];
        const maxDist = 4;
        const clustering = new MaxDistanceClustering(points, maxDist);
        const clusters = clustering.run();
        expect(clusters).toEqual([]);
    });

    it("should handle a single point", () => {
        const points: RoomPosition[] = [{ x: 0, y: 0 }];
        const maxDist = 4;
        const clustering = new MaxDistanceClustering(points, maxDist);
        const clusters = clustering.run();
        expect(clusters).toEqual([1]);
    });

    it("should handle points with no clusters (max distance too small)", () => {
        const points: RoomPosition[] = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 }
        ];
        const maxDist = 0.5; // Set a small max distance to prevent clustering
        const clustering = new MaxDistanceClustering(points, maxDist);
        const clusters = clustering.run();
        expect(clusters).toEqual([1, 2, 3, 4]);
    });
});
