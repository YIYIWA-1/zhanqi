document.addEventListener('DOMContentLoaded', () => {
    bindMenuEvents();
});

function bindMenuEvents() {
    document.getElementById('test-mode-btn').addEventListener('click', () => {
        startTestMode();
    });
}

function startTestMode() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'flex';
    document.getElementById('cheat-menu').style.display = 'block';
    initGame();
}

function initGame() {
    const GRID_WIDTH = 8;
    const GRID_HEIGHT = 12;
    const HEX_SIZE = 30;
    
    GameState.init(GRID_WIDTH, GRID_HEIGHT, HEX_SIZE);
    UIController.init();
    
    createTestUnits();
    
    GameState.startTurn();
    UIController.render();
}

function createTestUnits() {
    const soldier1 = new Unit({
        name: '近战士兵',
        faction: 'player',
        symbol: '战'
    });
    soldier1.addSkill(Utils.cloneSkill(SkillDefinitions.dash));
    soldier1.addSkill(Utils.cloneSkill(SkillDefinitions.selfHeal));
    soldier1.addSkill(Utils.cloneSkill(SkillDefinitions.bruteForce));
    soldier1.addSkill(Utils.cloneSkill(SkillDefinitions.flashStrike));
    
    const cell1 = GameState.grid.getCellByColRow(2, 9);
    if (cell1) {
        soldier1.setCell(cell1);
        GameState.units.push(soldier1);
    }
    
    const soldier2 = new Unit({
        name: '远程士兵',
        faction: 'player',
        symbol: '弓',
        isRanged: true
    });
    soldier2.addSkill(Utils.cloneSkill(SkillDefinitions.aim));
    soldier2.addSkill(Utils.cloneSkill(SkillDefinitions.fireball));
    soldier2.addSkill(Utils.cloneSkill(SkillDefinitions.firestorm));
    
    const cell2 = GameState.grid.getCellByColRow(5, 9);
    if (cell2) {
        soldier2.setCell(cell2);
        GameState.units.push(soldier2);
    }
    
    const stake1 = new Unit({
        name: '木桩',
        faction: 'enemy',
        symbol: '桩',
        maxHp: 1000,
        hp: 1000,
        canAct: false
    });
    const stakeCell1 = GameState.grid.getCellByColRow(3, 3);
    if (stakeCell1) {
        stake1.setCell(stakeCell1);
        GameState.units.push(stake1);
    }
    
    const stake2 = new Unit({
        name: '木桩2',
        faction: 'enemy',
        symbol: '桩',
        maxHp: 1000,
        hp: 1000,
        canAct: false
    });
    const stakeCell2 = GameState.grid.getCellByColRow(5, 3);
    if (stakeCell2) {
        stake2.setCell(stakeCell2);
        GameState.units.push(stake2);
    }
    
    const stake3 = new Unit({
        name: '木桩3',
        faction: 'enemy',
        symbol: '桩',
        maxHp: 1000,
        hp: 1000,
        canAct: false
    });
    const stakeCell3 = GameState.grid.getCellByColRow(4, 2);
    if (stakeCell3) {
        stake3.setCell(stakeCell3);
        GameState.units.push(stake3);
    }
}
