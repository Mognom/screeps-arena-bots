import { RoomPosition, Creep } from 'game/prototypes';
import { Visual } from 'game/visual'

const DEBUG_ENABLED = false;
var mainVisual = new Visual(10, true);

export class VisualUtils {
    clearRender(): void {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.clear();
    }

    renderAttackLine(source: RoomPosition, target: RoomPosition): void;
    renderAttackLine(source: RoomPosition, target: RoomPosition, style?: any): void {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.line(source, target, style);

    }

    renderTextAboveCreep(creep: Creep, text: string): void {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.text(
            text,
            {
                x: creep.x, y: creep.y - 0.5
            }, // above the creep
            {
                font: '0.5',
                opacity: 0.7,
                backgroundColor: '#808080',
                backgroundPadding: 0.03
            }
        );
    }

    renderBox(center: RoomPosition, width: number, height: number): void {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.rect(center, width, height);
    }

    renderCircle(center: RoomPosition, radius: number): void {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.circle(center, { radius: radius, opacity: 0.1 });
    }
}
export const GLOBA_VISUAL = new VisualUtils();
