const EnemyAI = {
    async executeTurn(enemyUnits) {
        for (const unit of enemyUnits) {
            if (unit.isDead || !unit.canAct) continue;
            await this.executeUnitTurn(unit);
            await this.delay(500);
        }
    },
    
    async executeUnitTurn(unit) {
        const playerUnits = GameState.getPlayerUnits();
        if (playerUnits.length === 0) return;
        
        let target = this.findNearestTarget(unit, playerUnits);
        if (!target) return;
        
        await this.tryUseHealingSkills(unit);
        await this.delay(300);
        
        await this.tryUseBuffSkills(unit);
        await this.delay(300);
        
        let moved = await this.tryMoveToTarget(unit, target);
        if (moved) {
            await this.delay(400);
            UIController.render();
        }
        
        await this.tryUseAttackSkills(unit, playerUnits);
        await this.delay(300);
        
        await this.tryAttack(unit);
    },
    
    findNearestTarget(unit, targets) {
        let nearest = null;
        let minDistance = Infinity;
        
        targets.forEach(target => {
            const distance = GameState.grid.getDistance(unit.cell, target.cell);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = target;
            }
        });
        
        return nearest;
    },
    
    async tryMoveToTarget(unit, target) {
        if (unit.movement <= 0) return false;
        
        const distance = GameState.grid.getDistance(unit.cell, target.cell);
        
        if (distance <= unit.range) {
            return false;
        }
        
        const moveableCells = GameState.getMoveableCells(unit);
        if (moveableCells.length === 0) return false;
        
        let bestCell = null;
        let bestDistance = distance;
        
        moveableCells.forEach(cell => {
            const newDist = GameState.grid.getDistance(cell, target.cell);
            if (newDist < bestDistance) {
                bestDistance = newDist;
                bestCell = cell;
            }
        });
        
        if (bestCell) {
            GameState.moveUnit(unit, bestCell);
            return true;
        }
        
        return false;
    },
    
    async tryUseHealingSkills(unit) {
        const hpPercent = unit.hp / unit.maxHp;
        const hasTakenDamage = hpPercent < 0.9 || unit.tookDamageLastEnemyTurn;
        
        if (!hasTakenDamage) return;
        
        for (const skill of unit.skills) {
            if (!skill.canUse()) continue;
            
            if (skill.name === '自愈') {
                skill.use(null);
                UIController.render();
                return;
            }
        }
    },
    
    async tryUseBuffSkills(unit) {
        for (const skill of unit.skills) {
            if (!skill.canUse()) continue;
            
            if (skill.name === '蛮力' || skill.name === '瞄准') {
                if (Math.random() < 0.6) {
                    skill.use(null);
                    UIController.render();
                    return;
                }
            }
        }
    },
    
    async tryUseAttackSkills(unit, playerUnits) {
        for (const skill of unit.skills) {
            if (!skill.canUse()) continue;
            
            if (['火球术', '炎爆术', '闪身击'].includes(skill.name)) {
                if (Math.random() < 0.5) continue;
                
                let targetCells = [];
                if (skill.getTargetCells) {
                    targetCells = skill.getTargetCells(unit, GameState.grid);
                } else if (skill.range) {
                    targetCells = GameState.grid.getCellsInRange(unit.cell, skill.range);
                    if (skill.targetEmptyCell) {
                        targetCells = targetCells.filter(c => !c.unit);
                    } else {
                        targetCells = targetCells.filter(c => c.unit && c.unit.faction !== unit.faction);
                    }
                }
                
                if (targetCells.length > 0) {
                    let bestCell = null;
                    let bestScore = -1;
                    
                    targetCells.forEach(cell => {
                        let score = 0;
                        const neighbors = GameState.grid.getNeighbors(cell);
                        neighbors.forEach(n => {
                            if (n.unit && n.unit.faction === 'player') score += 1;
                        });
                        if (cell.unit && cell.unit.faction === 'player') score += 2;
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestCell = cell;
                        }
                    });
                    
                    if (bestCell) {
                        skill.use(skill.needsTarget ? bestCell : null);
                        UIController.render();
                        return;
                    }
                }
            }
        }
    },
    
    async tryAttack(unit) {
        const attackable = GameState.getAttackableCells(unit);
        if (attackable.length === 0) return;
        
        const targetCell = attackable[Math.floor(Math.random() * attackable.length)];
        GameState.performAttack(unit, targetCell);
        UIController.render();
    },
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
