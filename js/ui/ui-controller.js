const UIController = {
    boardElement: null,
    
    init() {
        this.boardElement = document.getElementById('game-board');
        this.bindEvents();
    },
    
    bindEvents() {
        document.getElementById('end-turn-btn').addEventListener('click', () => {
            if (GameState.currentTurn === 'player') {
                GameState.endTurn();
                this.render();
            }
        });
        
        document.getElementById('move-btn').addEventListener('click', () => {
            if (GameState.selectedUnit && GameState.currentTurn === 'player') {
                GameState.actionMode = 'move';
                GameState.selectedSkill = null;
                this.highlightCells();
                this.render();
            }
        });
        
        document.getElementById('attack-btn').addEventListener('click', () => {
            if (GameState.selectedUnit && GameState.currentTurn === 'player') {
                GameState.actionMode = 'attack';
                GameState.selectedSkill = null;
                this.highlightCells();
                this.render();
            }
        });
    },
    
    render() {
        this.renderBoard();
        this.renderUnitInfo();
        this.renderSkillPanel();
        this.renderTurnInfo();
        this.updateActionButtons();
    },
    
    renderBoard() {
        this.boardElement.innerHTML = '';
        
        const grid = GameState.grid;
        const dims = grid.getGridDimensions();
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'hex-grid';
        gridContainer.style.width = dims.width + 'px';
        gridContainer.style.height = dims.height + 'px';
        
        grid.cells.forEach(cell => {
            const pixel = grid.hexToPixel(cell.q, cell.r);
            const hexElement = this.createHexCell(cell, pixel);
            gridContainer.appendChild(hexElement);
        });
        
        this.boardElement.appendChild(gridContainer);
    },
    
    createHexCell(cell, pixel) {
        const size = GameState.grid.hexSize;
        
        const div = document.createElement('div');
        div.className = 'hex-cell';
        div.style.left = (pixel.x + size) + 'px';
        div.style.top = (pixel.y + size) + 'px';
        div.style.width = (size * 2) + 'px';
        div.style.height = (size * 2) + 'px';
        
        if (GameState.selectedUnit && GameState.selectedUnit.cell === cell) {
            div.classList.add('selected');
        }
        
        const highlight = GameState.highlightedCells.find(h => h.cell === cell);
        if (highlight) {
            div.classList.add(highlight.type);
        }
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `-${size} -${size} ${size * 2} ${size * 2}`);
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', Utils.getHexPoints(size));
        polygon.setAttribute('class', 'hex-shape');
        svg.appendChild(polygon);
        
        div.appendChild(svg);
        
        if (cell.unit) {
            const unitSprite = this.createUnitSprite(cell.unit);
            div.appendChild(unitSprite);
        }
        
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onCellClick(cell);
        });
        
        return div;
    },
    
    createUnitSprite(unit) {
        const sprite = document.createElement('div');
        sprite.className = `unit-sprite ${unit.faction}`;
        sprite.textContent = unit.symbol;
        
        const hpBar = document.createElement('div');
        hpBar.className = 'unit-hp-bar';
        
        const hpFill = document.createElement('div');
        hpFill.className = 'unit-hp-fill';
        const hpPercent = (unit.hp / unit.maxHp) * 100;
        hpFill.style.width = hpPercent + '%';
        if (hpPercent < 30) {
            hpFill.classList.add('low');
        }
        
        hpBar.appendChild(hpFill);
        sprite.appendChild(hpBar);
        
        return sprite;
    },
    
    onCellClick(cell) {
        if (GameState.currentTurn !== 'player') return;
        
        if (GameState.actionMode === 'move') {
            const moveable = GameState.getMoveableCells(GameState.selectedUnit);
            if (moveable.includes(cell)) {
                GameState.moveUnit(GameState.selectedUnit, cell);
                GameState.actionMode = null;
                GameState.clearHighlights();
            }
        } else if (GameState.actionMode === 'attack') {
            const attackable = GameState.getAttackableCells(GameState.selectedUnit);
            if (attackable.includes(cell)) {
                GameState.performAttack(GameState.selectedUnit, cell);
                GameState.actionMode = null;
                GameState.clearHighlights();
            }
        } else if (GameState.selectedSkill) {
            const skill = GameState.selectedSkill;
            let targetCells = [];
            
            if (skill.getTargetCells) {
                targetCells = skill.getTargetCells(GameState.selectedUnit, GameState.grid);
            } else if (skill.range) {
                targetCells = GameState.grid.getCellsInRange(GameState.selectedUnit.cell, skill.range);
                if (skill.targetEmptyCell) {
                    targetCells = targetCells.filter(c => !c.unit);
                } else if (!skill.targetEmptyCell && skill.needsTarget) {
                    targetCells = targetCells.filter(c => c.unit && c.unit.faction !== GameState.selectedUnit.faction);
                }
            }
            
            if (targetCells.includes(cell) || !skill.needsTarget) {
                skill.use(skill.needsTarget ? cell : null);
                GameState.selectedSkill = null;
                GameState.actionMode = null;
                GameState.clearHighlights();
            }
        } else if (cell.unit && cell.unit.faction === 'player') {
            GameState.selectedUnit = cell.unit;
            GameState.selectedSkill = null;
            GameState.actionMode = null;
            GameState.clearHighlights();
        } else {
            GameState.selectedUnit = null;
            GameState.selectedSkill = null;
            GameState.actionMode = null;
            GameState.clearHighlights();
        }
        
        this.render();
    },
    
    highlightCells() {
        GameState.clearHighlights();
        
        if (!GameState.selectedUnit) return;
        
        if (GameState.actionMode === 'move') {
            const cells = GameState.getMoveableCells(GameState.selectedUnit);
            cells.forEach(c => GameState.addHighlight(c, 'selectable'));
        } else if (GameState.actionMode === 'attack') {
            const cells = GameState.getAttackableCells(GameState.selectedUnit);
            cells.forEach(c => GameState.addHighlight(c, 'attackable'));
        } else if (GameState.selectedSkill) {
            const skill = GameState.selectedSkill;
            if (skill.needsTarget) {
                let targetCells = [];
                if (skill.getTargetCells) {
                    targetCells = skill.getTargetCells(GameState.selectedUnit, GameState.grid);
                } else if (skill.range) {
                    targetCells = GameState.grid.getCellsInRange(GameState.selectedUnit.cell, skill.range);
                    if (skill.targetEmptyCell) {
                        targetCells = targetCells.filter(c => !c.unit);
                    } else {
                        targetCells = targetCells.filter(c => c.unit && c.unit.faction !== GameState.selectedUnit.faction);
                    }
                }
                targetCells.forEach(c => GameState.addHighlight(c, 'skill-target'));
            }
        }
    },
    
    renderUnitInfo() {
        const unit = GameState.selectedUnit;
        const nameEl = document.getElementById('selected-unit-name');
        const hpBar = document.getElementById('hp-bar');
        const mpBar = document.getElementById('mp-bar');
        const hpText = document.getElementById('hp-text');
        const mpText = document.getElementById('mp-text');
        const statAtk = document.getElementById('stat-atk');
        const statArm = document.getElementById('stat-arm');
        const statMov = document.getElementById('stat-mov');
        
        if (unit) {
            nameEl.textContent = unit.name;
            hpBar.style.width = (unit.hp / unit.maxHp * 100) + '%';
            mpBar.style.width = (unit.mp / unit.maxMp * 100) + '%';
            hpText.textContent = `${Utils.round(unit.hp, 0)}/${Utils.round(unit.maxHp, 0)}`;
            mpText.textContent = `${Utils.round(unit.mp, 0)}/${Utils.round(unit.maxMp, 0)}`;
            statAtk.textContent = unit.atk;
            statArm.textContent = unit.armor;
            statMov.textContent = unit.movement + '/' + unit.maxMovement;
        } else {
            nameEl.textContent = '-';
            hpBar.style.width = '0%';
            mpBar.style.width = '0%';
            hpText.textContent = '0/0';
            mpText.textContent = '0/0';
            statAtk.textContent = '0';
            statArm.textContent = '0';
            statMov.textContent = '0';
        }
    },
    
    renderSkillPanel() {
        const skillList = document.getElementById('skill-list');
        skillList.innerHTML = '';
        
        const unit = GameState.selectedUnit;
        if (!unit || unit.faction !== 'player') return;
        
        unit.skills.forEach(skill => {
            const btn = document.createElement('button');
            btn.className = 'skill-btn';
            
            const name = document.createElement('div');
            name.className = 'skill-name';
            name.textContent = skill.name;
            btn.appendChild(name);
            
            const cost = document.createElement('div');
            cost.className = 'skill-cost';
            cost.textContent = `蓝:${skill.mpCost}`;
            btn.appendChild(cost);
            
            if (skill.currentCooldown > 0) {
                const cd = document.createElement('div');
                cd.className = 'skill-cooldown';
                cd.textContent = `CD:${skill.currentCooldown}`;
                btn.appendChild(cd);
                btn.classList.add('on-cooldown');
            }
            
            if (!skill.canUse()) {
                if (unit.mp < skill.mpCost) {
                    btn.classList.add('no-mana');
                }
            }
            
            if (GameState.selectedSkill === skill) {
                btn.classList.add('selected');
            }
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (skill.canUse()) {
                    if (GameState.selectedSkill === skill) {
                        GameState.selectedSkill = null;
                        GameState.actionMode = null;
                        GameState.clearHighlights();
                    } else {
                        GameState.selectedSkill = skill;
                        GameState.actionMode = 'skill';
                        if (!skill.needsTarget) {
                            skill.use(null);
                            GameState.selectedSkill = null;
                            GameState.actionMode = null;
                        } else {
                            this.highlightCells();
                        }
                    }
                    this.render();
                }
            });
            
            skillList.appendChild(btn);
        });
    },
    
    renderTurnInfo() {
        document.getElementById('current-turn').textContent = 
            GameState.currentTurn === 'player' ? '玩家回合' : '敌方回合';
        document.getElementById('turn-number').textContent = `回合 ${GameState.turnNumber}`;
    },
    
    updateActionButtons() {
        const moveBtn = document.getElementById('move-btn');
        const attackBtn = document.getElementById('attack-btn');
        const unit = GameState.selectedUnit;
        
        const canAct = unit && unit.faction === 'player' && GameState.currentTurn === 'player';
        
        moveBtn.disabled = !canAct || unit.movement <= 0;
        attackBtn.disabled = !canAct || unit.hasAttacked || unit.cannotAttackThisTurn || unit.actionPoints < 1;
        
        if (GameState.actionMode === 'move') {
            moveBtn.style.background = '#4cc9f0';
        } else {
            moveBtn.style.background = '';
        }
        
        if (GameState.actionMode === 'attack') {
            attackBtn.style.background = '#4cc9f0';
        } else {
            attackBtn.style.background = '';
        }
    }
};
