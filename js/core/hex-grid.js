class HexGrid {
    constructor(width, height, hexSize = 30) {
        this.width = width;
        this.height = height;
        this.hexSize = hexSize;
        this.cells = [];
        this.init();
    }

    init() {
        for (let col = 0; col < this.width; col++) {
            for (let row = 0; row < this.height; row++) {
                const q = col;
                const r = row - Math.floor(col / 2);
                const cell = {
                    q: q,
                    r: r,
                    s: -q - r,
                    col: col,
                    row: row,
                    unit: null
                };
                this.cells.push(cell);
            }
        }
    }

    getCell(q, r) {
        return this.cells.find(c => c.q === q && c.r === r);
    }

    getCellByColRow(col, row) {
        return this.cells.find(c => c.col === col && c.row === row);
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

    hexToPixel(col, row) {
        const size = this.hexSize;
        const x = size * 1.732 * (col + 0.5 * (row % 2));
        const y = size * 1.5 * row;
        return { x, y };
    }

    getGridDimensions() {
        const maxX = this.hexSize * 1.732 * (this.width + 0.5);
        const maxY = this.hexSize * 1.5 * this.height;
        return {
            width: maxX + this.hexSize,
            height: maxY + this.hexSize
        };
    }
}
