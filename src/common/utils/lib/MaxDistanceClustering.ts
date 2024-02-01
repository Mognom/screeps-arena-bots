import { RoomPosition } from "game/prototypes";

export class MaxDistanceClustering {
    private points: RoomPosition[];
    private maxDistance: number;
    private clusters: number[];
    private visited: boolean[];

    public constructor(points: RoomPosition[], maxDistance: number) {
        this.points = points;
        this.maxDistance = maxDistance;
        this.clusters = Array.from({ length: this.points.length }, () => 0); // Initialize with 0 for unclustered points
        this.visited = Array.from({ length: this.points.length }, () => false);
    }

    public run(): number[] {
        let clusterId = 1;
        for (let i = 0; i < this.points.length; i++) {
            if (this.visited[i]) continue;
            this.visited[i] = true;

            const neighbors = this.regionQuery(i);
            this.expandCluster(i, neighbors, clusterId);
            clusterId++;
        }
        return this.clusters;
    }

    private regionQuery(pointIndex: number): number[] {
        const neighbors: number[] = [];
        const { x, y } = this.points[pointIndex];

        for (let i = 0; i < this.points.length; i++) {
            if (i === pointIndex) continue;

            const { x: nx, y: ny } = this.points[i];
            const distance = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);

            if (distance <= this.maxDistance) {
                neighbors.push(i);
            }
        }

        return neighbors;
    }

    private expandCluster(pointIndex: number, neighbors: number[], clusterId: number): void {
        this.clusters[pointIndex] = clusterId;

        let i = 0;
        while (i < neighbors.length) {
            const neighborIndex = neighbors[i];
            if (!this.visited[neighborIndex]) {
                this.visited[neighborIndex] = true;
                const neighborNeighbors = this.regionQuery(neighborIndex);
                neighbors.push(...neighborNeighbors);
            }
            if (this.clusters[neighborIndex] === 0) {
                this.clusters[neighborIndex] = clusterId; // Corrected condition
            }
            i++;
        }
    }
}
