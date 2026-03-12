const Utils = {
    cloneSkill(skill) {
        const cloned = new Skill({
            name: skill.name,
            description: skill.description,
            mpCost: skill.mpCost,
            apCost: skill.apCost,
            cooldown: skill.cooldown,
            range: skill.range,
            needsTarget: skill.needsTarget,
            targetEmptyCell: skill.targetEmptyCell,
            onUse: skill.onUse,
            getTargetCells: skill.getTargetCells
        });
        return cloned;
    },

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    round(value, decimals = 2) {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    },

    showMessage(text) {
        const log = document.getElementById('message-log');
        const msg = document.createElement('div');
        msg.className = 'message';
        msg.textContent = text;
        log.appendChild(msg);
        
        setTimeout(() => {
            msg.remove();
        }, 2500);
    },

    getHexPoints(size) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (60 * i - 30) * Math.PI / 180;
            points.push({
                x: size * 0.9 * Math.cos(angle),
                y: size * 0.9 * Math.sin(angle)
            });
        }
        return points.map(p => `${p.x},${p.y}`).join(' ');
    }
};
