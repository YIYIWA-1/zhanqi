const UIController = {
    boardElement: null,
    
    init() {
        this.boardElement = document.getElementById('game-board');
        this.bindEvents();
    },
    
    bindEvents() {
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            document.getElementById('main-menu').style.display = 'flex';
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('cheat-menu').style.display = 'none';
        });
        
        document.getElementById('end-turn-btn').addEventListener('click', async () => {
            if (GameState.currentTurn === 'player') {
                await GameState.endTurn();
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
        
        document.getElementById('cheat-toggle').addEventListener('click', () => {
            document.getElementById('cheat-options').classList.toggle('show');
        });
        
        document.getElementById('spawn-melee-enemy').addEventListener('click', () => {
            this.spawnEnemy('melee');
        });
        
        document.getElementById('spawn-ranged-enemy').addEventListener('click', () => {
            this.spawnEnemy('ranged');
        });
        
        document.getElementById('spawn-stake').addEventListener('click', () => {
            this.spawnEnemy('stake');
        });
    },
    
    spawnEnemy(type) {
        let unit;
        const emptyCells = GameState.grid.cells.filter(c => !c.unit);
        if (emptyCells.length === 0) {
            Utils.showMessage('没有空位置了！');
            return;
        }
        
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        if (type === 'melee') {
            unit = new Unit({
                name: '敌方近战',
                faction: 'enemy',
                symbol: '敌'
            });
            unit.addSkill(Utils.cloneSkill(SkillDefinitions.dash));
            unit.addSkill(Utils.cloneSkill(SkillDefinitions.selfHeal));
            unit.addSkill(Utils.cloneSkill(SkillDefinitions.bruteForce));
            unit.addSkill(Utils.cloneSkill(SkillDefinitions.flashStrike));
        } else if (type === 'ranged') {
            unit = new Unit({
                name: '敌方远程',
                faction: 'enemy',
                symbol: '弓',
                isRanged: true
            });
            unit.addSkill(Utils.cloneSkill(SkillDefinitions.aim));
            unit.addSkill(Utils.cloneSkill(SkillDefinitions.fireball));
            unit.addSkill(Utils.cloneSkill(SkillDefinitions.firestorm));
        } else {
            unit = new Unit({
                name: '木桩',
                faction: 'enemy',
                symbol: '桩',
                maxHp: 1000,
                hp: 1000,
                canAct: false
            });
        }
        
        GameState.addUnit(unit, randomCell.q, randomCell.r);
        Utils.showMessage(`生成了 ${unit.name}！`);
        this.render();
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
            const pixel = grid.hexToPixel(cell.col, cell.row);
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
        
        const canAct = unit.actionPoints > 0 || !unit.hasAttacked || unit.movement > 0;
        if (!canAct && unit.faction === 'player') {
            sprite.classList.add('inactive');
        }
        
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
        
        if (unit.faction === 'player') {
            const apIndicator = document.createElement('div');
            apIndicator.className = 'unit-ap-indicator';
            apIndicator.textContent = unit.actionPoints;
            sprite.appendChild(apIndicator);
        }
        
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
            moveBtn.classList.add('active');
        } else {
            moveBtn.classList.remove('active');
        }
        
        if (GameState.actionMode === 'attack') {
            attackBtn.classList.add('active');
        } else {
            attackBtn.classList.remove('active');
        }
    }
};
