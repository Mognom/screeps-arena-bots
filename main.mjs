import { getObjectsByPrototype } from 'game/utils';
import { Creep, Flag} from 'game/prototypes';
import * as Constants from "game/constants";

import { Visual } from 'game/visual'
import { } from 'arena';

import { VisualUtils } from './utils';


var creeps = getObjectsByPrototype(Creep);

var myCreeps = creeps.filter(c => c.my);
var enemyCreeps = creeps.filter(c => !c.my);

var meleeCreeps = creeps.filter(c => c.body.some(part => part.type == Constants.ATTACK))
var rangedCreeps = creeps.filter(c => c.body.some(part => part.type == Constants.RANGED_ATTACK))
var healCreeps = creeps.filter(c => c.body.some(part => part.type == Constants.HEAL))

var enemyFlag = getObjectsByPrototype(Flag).filter(f => !f.my);
var myFlag = getObjectsByPrototype(Flag).filter(f => f.my);

var enemyFlag = getObjectsByPrototype(Flag).find(object => !object.my);
var myCreeps = getObjectsByPrototype(Creep).filter(object => object.my);

var currentState = 10;

export function loop() {

    // CALL OTHER LOOP LISTENERS
    clearMainRender();


    // Defend around the river
    switch(currentState) {
        case 1:
            handleStartState();
            break;
        default:
            handleRushState();
            break;
    }

    // if they do not push, collect upgrades


    // if they push, fallback a bit and defend in tower range
}



function handleStartState() {
}

function handleDefense() {
}

function handleRushState() {
    var myCreeps = creeps.filter(c => c.my);
    var enemyCreeps = creeps.filter(c => !c.my);

    var meleeCreeps = myCreeps.filter(c => c.body.some(part => part.type == Constants.ATTACK))
    var rangedCreeps = myCreeps.filter(c => c.body.some(part => part.type == Constants.RANGED_ATTACK))
    var healCreeps = myCreeps.filter(c => c.body.some(part => part.type == Constants.HEAL))

    var currentRangedTargets = [];

    meleeCreeps.forEach(creep => {
        let closestEnemy = creep.findClosestByRange(enemyCreeps, 3)

        if (creep.target && creep.attack(creep.target) == Constants.OK) {
            currentRangedTargets.push(closestEnemy);
        } else {
            creep.target = undefined;
            if (closestEnemy) {
                if (creep.attack(closestEnemy) == Constants.ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestEnemy);
                } else {
                    currentRangedTargets.push(closestEnemy);
                    creep.target = closestEnemy;
                }
            } else {
                creep.moveTo(enemyFlag);
            }
        }

        if (creep.target) {
            creep.visual.line(creep, creep.target, {lineStyle: 'dashed'});
        }
    });

    rangedCreeps.forEach(creep => {
        var currentTarget;
        var bestDistance;
        for(var enemy of currentRangedTargets) {
            var currentDistance = creep.getRangeTo(enemy);
            if (!bestDistance || bestDistance > currentDistance) {
                currentTarget = enemy;
                bestDistance = currentDistance;                
            }
        }

        var moving = false;
        if (currentTarget) {
            if (bestDistance == 1 && creep.rangedMassAttack() == Constants.OK || creep.rangedAttack(currentTarget) == Constants.OK) {
                creep.visual.line(creep, currentTarget, {lineStyle: 'dashed'});
                return;
            } else {
                creep.moveTo(currentTarget)
                moving = true;
            }
        } 
        
        let targetsInRange = creep.findInRange(enemyCreeps, 3);
        if (targetsInRange.length >= 3) {
            console.log("MASS ATTACK");
            creep.rangedMassAttack();
        } else if (targetsInRange.length > 0) {
            creep.rangedAttack(targetsInRange[0]);
            creep.visual.line(creep, targetsInRange[0], {lineStyle: 'dotted'});
        } else {
            if (!moving) {
                creep.moveTo(meleeCreeps[0]);
            }
        }
    })

    healCreeps.forEach(creep => {
        let closestMelee = creep.findClosestByPath(meleeCreeps)
        let damagedCreeps = myCreeps.filter(c => c.hits < c.hitsMax)
        if (damagedCreeps.length > 0) {
            let target = creep.findClosestByRange(damagedCreeps)
            creep.heal(target);
            creep.moveTo(target);
        } else{
            creep.moveTo(meleeCreeps[0]);
        }
    });

    // Draw CPU time


}



