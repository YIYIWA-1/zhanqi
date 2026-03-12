class Skill {
    constructor(config) {
        this.name = config.name || '技能';
        this.description = config.description || '';
        this.mpCost = config.mpCost || 10;
        this.apCost = config.apCost !== undefined ? config.apCost : 1;
        this.cooldown = config.cooldown || 0;
        this.currentCooldown = 0;
        this.range = config.range;
        this.needsTarget = config.needsTarget !== false;
        this.targetEmptyCell = config.targetEmptyCell || false;
        this.owner = null;
        this.onUse = config.onUse || (() => {});
        this.getTargetCells = config.getTargetCells || null;
    }

    canUse() {
        if (!this.owner) return false;
        if (this.owner.isDead) return false;
        if (this.currentCooldown > 0) return false;
        if (this.owner.mp < this.mpCost) return false;
        if (this.apCost > 0 && this.owner.actionPoints < this.apCost) return false;
        if (this.apCost === 0 && this.owner.hasUsedZeroAPAction) return false;
        return true;
    }

    use(targetCell) {
        if (!this.canUse()) return false;
        
        if (this.apCost > 0) {
            this.owner.actionPoints -= this.apCost;
        } else {
            this.owner.hasUsedZeroAPAction = true;
        }
        
        this.owner.spendMp(this.mpCost);
        this.currentCooldown = this.cooldown;
        
        this.onUse(this.owner, targetCell);
        return true;
    }
}
