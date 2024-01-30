declare module "game/prototypes" {
    interface Creep {
        initialPos: RoomPosition;
        spawning: boolean; // Redifine this to avoid issues
    }
}
