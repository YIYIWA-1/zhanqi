class Unit {
    constructor(config = {}) {
        this.id = config.id || Math.random().toString(36).substr(2, 9);
        this.name = config.name || '单位';
        this.faction = config.faction || 'player';
        this.symbol = config.symbol || '?';
        this.cell = null;

        this.maxHp = config.maxHp || 100.00;
        this.hp = config.hp || this.maxHp;
        this.meleeAtk = config.meleeAtk || 10;
        this.rangedAtk = config.rangedAtk || 10;
        this.armor = config.armor || 0;
        this.armorPen = config.armorPen || 0;
        this.maxMovement = config.maxMovement || 3;
        this.movement = this.maxMovement;
        this.maxActionPoints = config.maxActionPoints || 1;
        this.actionPoints = this.maxActionPoints;
        this.meleeRange = config.meleeRange || 1;
        this.rangedRange = config.rangedRange || 4;
        this.isRanged = config.isRanged || false;
        this.maxMp = config.maxMp || 100.00;
        this.mp = config.mp || this.maxMp;
        this.mpRegen = config.mpRegen || 0.05;
        this.spellPower = config.spellPower || 0;
        this.spellDefense = config.spellDefense || 0;
        this.spellPen = config.spellPen || 0;
        this.population = config.population || 1;

        this.hasAttacked = false;
        this.hasMoved = false;
        this.hasUsedZeroAPAction = false;
        this.tookDamageLastEnemyTurn = false;
        this.dealtDamageThisTurn = false;
        this.cannotAttackThisTurn = false;
        this.bonusNextMeleeDamage = 0;
        this.bonusNextRangedDamage = 0;
        this.bonusNextRangedRange = 0;
        this.nextAttackIsTrueDamage = false;
        this.trueDamageBonus = 0;

        this.skills = [];
        this.isDead = false;
        this.canAct = config.canAct !== false;
    }

    get atk() {
        return this.isRanged ? this.rangedAtk : this.meleeAtk;
    }

    get range() {
        let base = this.isRanged ? this.rangedRange : this.meleeRange;
        if (this.bonusNextRangedRange > 0 && this.isRanged) {
            base += this.bonusNextRangedRange;
        }
        return base;
    }

    setCell(cell) {
        if (this.cell) {
            this.cell.unit = null;
        }
        this.cell = cell;
        if (cell) {
            cell.unit = this;
        }
    }

    takeDamage(damage, damageType = 'physical') {
        let finalDamage = damage;
        
        if (damageType === 'physical' && !this.nextAttackIsTrueDamage) {
            const effectiveArmor = Math.max(0, this.armor - (this.armorPen || 0));
            finalDamage = Math.max(damage * 0.1, damage - effectiveArmor);
        } else if (damageType === 'spell') {
            const effectiveSpellDef = Math.max(0, this.spellDefense - (this.spellPen || 0));
            finalDamage = Math.max(damage * 0.1, damage - effectiveSpellDef);
        }

        this.hp = Math.max(0, this.hp - finalDamage);
        this.tookDamageLastEnemyTurn = true;
        
        if (this.hp <= 0) {
            this.die();
        }
        
        return finalDamage;
    }

    heal(amount) {
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        return this.hp - oldHp;
    }

    spendMp(amount) {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        return false;
    }

    restoreMp(amount) {
        this.mp = Math.min(this.maxMp, this.mp + amount);
    }

    die() {
        this.isDead = true;
        if (this.cell) {
            this.cell.unit = null;
            this.cell = null;
        }
    }

    resetForTurn() {
        this.movement = this.maxMovement;
        this.actionPoints = this.maxActionPoints;
        this.hasAttacked = false;
        this.hasMoved = false;
        this.hasUsedZeroAPAction = false;
        this.dealtDamageThisTurn = false;
        this.bonusNextMeleeDamage = 0;
        this.bonusNextRangedDamage = 0;
        this.bonusNextRangedRange = 0;
        this.nextAttackIsTrueDamage = false;
        this.trueDamageBonus = 0;
        
        this.restoreMp(this.maxMp * this.mpRegen);
    }

    endTurn() {
        if (!this.dealtDamageThisTurn && !this.tookDamageLastEnemyTurn) {
            const healAmount = this.maxHp * 0.05;
            this.heal(healAmount);
        }
        
        this.skills.forEach(skill => {
            if (skill.currentCooldown > 0) {
                skill.currentCooldown--;
            }
        });
        
        this.tookDamageLastEnemyTurn = false;
    }

    addSkill(skill) {
        skill.owner = this;
        this.skills.push(skill);
    }
}
