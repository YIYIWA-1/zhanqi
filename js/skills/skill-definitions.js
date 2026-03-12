const SkillDefinitions = {
    dash: new Skill({
        name: '冲刺',
        description: '获得额外3移动力，本回合无法攻击',
        mpCost: 9,
        apCost: 1,
        cooldown: 4,
        needsTarget: false,
        onUse: (user, targetCell) => {
            user.movement += 3;
            user.cannotAttackThisTurn = true;
            Utils.showMessage(`${user.name} 使用了冲刺！移动力+3`);
        }
    }),

    selfHeal: new Skill({
        name: '自愈',
        description: '回复9+18%已损失生命值',
        mpCost: 22,
        apCost: 0,
        cooldown: 6,
        needsTarget: false,
        onUse: (user, targetCell) => {
            const missingHp = user.maxHp - user.hp;
            const healAmount = 9 + missingHp * 0.18;
            const healed = user.heal(healAmount);
            Utils.showMessage(`${user.name} 使用了自愈，回复了 ${Utils.round(healed, 1)} 生命值！`);
        }
    }),

    bruteForce: new Skill({
        name: '蛮力',
        description: '下次普攻造成25%额外真实伤害',
        mpCost: 12,
        apCost: 0,
        cooldown: 3,
        needsTarget: false,
        onUse: (user, targetCell) => {
            user.nextAttackIsTrueDamage = true;
            user.trueDamageBonus = 0.25;
            Utils.showMessage(`${user.name} 使用了蛮力！下次攻击将造成真实伤害`);
        }
    }),

    flashStrike: new Skill({
        name: '闪身击',
        description: '闪现到目标格子，对周围造成伤害',
        mpCost: 24,
        apCost: 1,
        cooldown: 5,
        range: 4,
        targetEmptyCell: true,
        getTargetCells: (user, grid) => {
            return grid.getCellsInRange(user.cell, 4).filter(c => !c.unit);
        },
        onUse: (user, targetCell) => {
            const oldCell = user.cell;
            user.setCell(targetCell);
            
            const damage = user.meleeAtk * 1.0;
            const neighbors = GameState.grid.getNeighbors(targetCell);
            neighbors.forEach(n => {
                if (n.unit && n.unit.faction !== user.faction) {
                    const dealt = n.unit.takeDamage(damage, 'physical');
                    Utils.showMessage(`${user.name} 的闪身击对 ${n.unit.name} 造成了 ${Utils.round(dealt, 1)} 伤害！`);
                }
            });
            
            Utils.showMessage(`${user.name} 使用了闪身击！`);
        }
    }),

    aim: new Skill({
        name: '瞄准',
        description: '提升下次远程普攻1格射程与25%伤害',
        mpCost: 15,
        apCost: 1,
        cooldown: 3,
        needsTarget: false,
        onUse: (user, targetCell) => {
            user.bonusNextRangedRange = 1;
            user.bonusNextRangedDamage = 0.25;
            Utils.showMessage(`${user.name} 使用了瞄准！`);
        }
    }),

    fireball: new Skill({
        name: '火球术',
        description: '对目标造成8+1.0法强的法术伤害',
        mpCost: 24,
        apCost: 1,
        cooldown: 2,
        range: 4,
        getTargetCells: (user, grid) => {
            return grid.getCellsInRange(user.cell, 4).filter(c => c.unit && c.unit.faction !== user.faction);
        },
        onUse: (user, targetCell) => {
            if (targetCell.unit) {
                const damage = 8 + user.spellPower * 1.0;
                const dealt = targetCell.unit.takeDamage(damage, 'spell');
                Utils.showMessage(`${user.name} 的火球术对 ${targetCell.unit.name} 造成了 ${Utils.round(dealt, 1)} 伤害！`);
            }
        }
    }),

    firestorm: new Skill({
        name: '炎爆术',
        description: '对目标格造成15+2.2法强伤害，周围造成0.5倍伤害',
        mpCost: 44,
        apCost: 2,
        cooldown: 7,
        range: 6,
        getTargetCells: (user, grid) => {
            return grid.getCellsInRange(user.cell, 6);
        },
        onUse: (user, targetCell) => {
            const mainDamage = 15 + user.spellPower * 2.2;
            const splashDamage = mainDamage * 0.5;
            
            if (targetCell.unit && targetCell.unit.faction !== user.faction) {
                const dealt = targetCell.unit.takeDamage(mainDamage, 'spell');
                Utils.showMessage(`${user.name} 的炎爆术对 ${targetCell.unit.name} 造成了 ${Utils.round(dealt, 1)} 伤害！`);
            }
            
            const neighbors = GameState.grid.getNeighbors(targetCell);
            neighbors.forEach(n => {
                if (n.unit && n.unit.faction !== user.faction) {
                    const dealt = n.unit.takeDamage(splashDamage, 'spell');
                    Utils.showMessage(`炎爆术溅射对 ${n.unit.name} 造成了 ${Utils.round(dealt, 1)} 伤害！`);
                }
            });
            
            Utils.showMessage(`${user.name} 使用了炎爆术！`);
        }
    })
};
