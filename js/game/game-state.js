const GameState = {
    grid: null,
    units: [],
    currentTurn: 'player',
    turnNumber: 1,
    selectedUnit: null,
    selectedSkill: null,
    actionMode: null,
    highlightedCells: [],
    
    init(gridWidth, gridHeight, hexSize) {
        this.grid = new HexGrid(gridWidth, gridHeight, hexSize);
        this.currentTurn = 'player';
        this.turnNumber = 1;
        this.units = [];
        this.selectedUnit = null;
        this.selectedSkill = null;
        this.actionMode = null;
        this.highlightedCells = [];
    },
    
    addUnit(unit, q, r) {
        const cell = this.grid.getCell(q, r);
        if (cell) {
            unit.setCell(cell);
            this.units.push(unit);
        }
    },
    
    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    },
    
    getPlayerUnits() {
        return this.units.filter(u => u.faction === 'player' && !u.isDead);
    },
    
    getEnemyUnits() {
        return this.units.filter(u => u.faction === 'enemy' && !u.isDead);
    },
    
    startTurn() {
        const units = this.currentTurn === 'player' ? this.getPlayerUnits() : this.getEnemyUnits();
        units.forEach(u => u.resetForTurn());
        
        if (this.currentTurn === 'player') {
            Utils.showMessage('玩家回合开始！');
        } else {
            Utils.showMessage('敌方回合开始！');
        }
    },
    
    endTurn() {
        const units = this.currentTurn === 'player' ? this.getPlayerUnits() : this.getEnemyUnits();
        units.forEach(u => u.endTurn());
        
        this.units = this.units.filter(u => !u.isDead);
        
        if (this.currentTurn === 'player') {
            this.currentTurn = 'enemy';
            this.startEnemyTurn();
        } else {
            this.currentTurn = 'player';
            this.turnNumber++;
            this.startTurn();
        }
        
        this.selectedUnit = null;
        this.selectedSkill = null;
        this.actionMode = null;
        this.clearHighlights();
    },
    
    startEnemyTurn() {
        setTimeout(() => {
            this.endTurn();
        }, 1000);
    },
    
    clearHighlights() {
        this.highlightedCells = [];
    },
    
    addHighlight(cell, type) {
        this.highlightedCells.push({ cell, type });
    },
    
    getMoveableCells(unit) {
        if (!unit || unit.movement <= 0) return [];
        return this.grid.getCellsInRange(unit.cell, unit.movement)
            .filter(c => !c.unit && c !== unit.cell);
    },
    
    getAttackableCells(unit) {
        if (!unit || unit.hasAttacked || unit.cannotAttackThisTurn) return [];
        if (unit.actionPoints < 1) return [];
        return this.grid.getCellsInRange(unit.cell, unit.range)
            .filter(c => c.unit && c.unit.faction !== unit.faction);
    },
    
    performAttack(attacker, targetCell) {
        if (!targetCell.unit) return;
        
        const target = targetCell.unit;
        let damage = attacker.atk;
        
        if (attacker.isRanged && attacker.bonusNextRangedDamage > 0) {
            damage *= (1 + attacker.bonusNextRangedDamage);
        }
        
        const wasTrueDamage = attacker.nextAttackIsTrueDamage;
        if (wasTrueDamage) {
            damage *= (1 + attacker.trueDamageBonus);
        }
        
        const dealt = target.takeDamage(damage, wasTrueDamage ? 'true' : 'physical');
        attacker.hasAttacked = true;
        attacker.actionPoints--;
        attacker.dealtDamageThisTurn = true;
        
        if (!attacker.hasMoved) {
            attacker.hasMoved = true;
        }
        
        attacker.bonusNextMeleeDamage = 0;
        attacker.bonusNextRangedDamage = 0;
        attacker.bonusNextRangedRange = 0;
        attacker.nextAttackIsTrueDamage = false;
        attacker.trueDamageBonus = 0;
        
        Utils.showMessage(`${attacker.name} 攻击了 ${target.name}，造成 ${Utils.round(dealt, 1)} 伤害！`);
        
        if (target.isDead) {
            this.removeUnit(target);
            Utils.showMessage(`${target.name} 被击败了！`);
        }
    },
    
    moveUnit(unit, targetCell) {
        const distance = this.grid.getDistance(unit.cell, targetCell);
        if (distance > unit.movement) return false;
        
        unit.movement -= distance;
        unit.setCell(targetCell);
        unit.hasMoved = true;
        
        return true;
    }
};
