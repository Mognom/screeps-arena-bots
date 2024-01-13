import { Visual } from 'game/visual'


const DEBUG_ENABLED = true;

var mainVisual = new Visual(10, true);

export var VisualUtils = {
    clearMainRender: function clearMainRender() {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.clear();
    },

    renderAttackLine: function renderAttackLine(source, target, style) {
        if (!DEBUG_ENABLED) {
            return;
        }

        mainVisual.line(source, target, style);
    },

    renderTextAboveCreep: function renderTextAboveCreep(creep, text) {
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
}
