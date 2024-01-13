import {Visual} from 'game/visual'


const DEBUG_ENABLED = true;

var mainVisual = new Visual(10, true);

export class VisualUtils {
    function clearMainRender() {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.clear();
    }
    
    function renderAttackLine(source, target, style) {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.line(creep, creep.target, {lineStyle: 'dashed'});
    }
    
    function renderTextAboveCreep(creep, text, ) {
        if (!DEBUG_ENABLED) {
            return;
        }
        mainVisual.text(
            text
            { 
                x: creep.x, y: creep.y - 0.5
            }, // above the creep
            {
                font: '0.5',
                opacity: 0.7,
                backgroundColor: '#808080',
                backgroundPadding: '0.03'
            }
        );
    }
}