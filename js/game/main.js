document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

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
    GameState.addUnit(soldier1, 2, 9);
    
    const soldier2 = new Unit({
        name: '远程士兵',
        faction: 'player',
        symbol: '弓',
        isRanged: true
    });
    soldier2.addSkill(Utils.cloneSkill(SkillDefinitions.aim));
    soldier2.addSkill(Utils.cloneSkill(SkillDefinitions.fireball));
    soldier2.addSkill(Utils.cloneSkill(SkillDefinitions.firestorm));
    GameState.addUnit(soldier2, 5, 9);
    
    const stake1 = new Unit({
        name: '木桩',
        faction: 'enemy',
        symbol: '桩',
        maxHp: 1000,
        hp: 1000,
        canAct: false
    });
    GameState.addUnit(stake1, 3, 3);
    
    const stake2 = new Unit({
        name: '木桩2',
        faction: 'enemy',
        symbol: '桩',
        maxHp: 1000,
        hp: 1000,
        canAct: false
    });
    GameState.addUnit(stake2, 5, 3);
    
    const stake3 = new Unit({
        name: '木桩3',
        faction: 'enemy',
        symbol: '桩',
        maxHp: 1000,
        hp: 1000,
        canAct: false
    });
    GameState.addUnit(stake3, 4, 2);
}
