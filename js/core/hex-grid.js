class HexGrid {
    constructor(width, height, hexSize = 30) {
        this.width = width;
        this.height = height;
        this.hexSize = hexSize;
        this.cells = [];
        this.init();
    }

    init() {
        for (let q = 0; q < this.width; q++) {
            for (let r = 0; r < this.height; r++) {
                const cell = {
                    q: q,
                    r: r,
                    s: -q - r,
                    unit: null
                };
                this.cells.push(cell);
            }
        }
    }

    getCell(q, r) {
        return this.cells.find(c => c.q === q && c.r === r);
    }

    getNeighbors(cell) {
        const directions = [
            { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
            { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
        ];
        return directions
            .map(d => this.getCell(cell.q + d.q, cell.r + d.r))
            .filter(c => c !== undefined);
    }

    getDistance(a, b) {
        return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
    }

    getCellsInRange(cell, range) {
        const results = [];
        for (let dq = -range; dq <= range; dq++) {
            for (let dr = Math.max(-range, -dq - range); dr <= Math.min(range, -dq + range); dr++) {
                const c = this.getCell(cell.q + dq, cell.r + dr);
                if (c) results.push(c);
            }
        }
        return results;
    }

    hexToPixel(q, r) {
        const x = this.hexSize * (3/2 * q);
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        return { x, y };
    }

    getGridDimensions() {
        const lastCell = this.getCell(this.width - 1, this.height - 1);
        const lastPixel = this.hexToPixel(lastCell.q, lastCell.r);
        return {
            width: lastPixel.x + this.hexSize * 2,
            height: lastPixel.y + this.hexSize * 2
        };
    }
}
