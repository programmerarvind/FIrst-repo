// Brain Streak Tracker - Simple Grid-Based Cells (Guaranteed to Work)
class BrainStreakTracker {
    constructor() {
        this.svg = document.getElementById('brain-svg');
        this.totalCells = 85;
        this.cells = [];
        this.completedCells = new Set();
        this.width = 800;
        this.height = 600;
        this.tooltip = document.getElementById('cell-tooltip');

        this.init();
    }

    init() {
        this.loadProgress();
        this.generateSimpleCells();
        this.renderBrain();
        this.updateStats();
        this.setupEventListeners();
    }

    // Generate simple grid-based irregular cells
    generateSimpleCells() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        const cells = [];
        const cols = 11;
        const rows = 9;
        const cellWidth = 50;
        const cellHeight = 46;

        let cellId = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (cellId >= this.totalCells) break;

                // Calculate center of this grid cell
                const x = 150 + col * cellWidth;
                const y = 130 + row * cellHeight;

                // Check if cell center is inside brain
                if (!this.isInsideBrainShape(x, y)) continue;

                // Create irregular hexagon-like shape around this point
                const vertices = this.createIrregularCell(x, y, cellWidth, cellHeight);

                // Clip to brain boundary
                const clipped = this.clipToBrain(vertices);

                if (clipped.length >= 3) {
                    const hemisphere = x < centerX ? 'left' : 'right';

                    cells.push({
                        id: cellId,
                        x: x,
                        y: y,
                        vertices: clipped,
                        hemisphere: hemisphere,
                        completed: this.completedCells.has(cellId),
                        color: this.getCellColor(x, y, hemisphere)
                    });

                    cellId++;
                }
            }
        }

        this.cells = cells;
        console.log(`✓ Generated ${this.cells.length} cells`);
    }

    // Create an irregular polygon around a center point
    createIrregularCell(cx, cy, width, height) {
        const vertices = [];
        const sides = 6; // Hexagon-like
        const angleStep = (Math.PI * 2) / sides;

        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep + Math.PI / 6;

            // Randomize radius for irregularity
            const radiusX = (width / 2) * (0.85 + Math.random() * 0.3);
            const radiusY = (height / 2) * (0.85 + Math.random() * 0.3);

            const x = cx + Math.cos(angle) * radiusX;
            const y = cy + Math.sin(angle) * radiusY;

            vertices.push({ x, y });
        }

        return vertices;
    }

    // Clip polygon to brain shape
    clipToBrain(vertices) {
        const clipped = [];

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];

            const inside1 = this.isInsideBrainShape(v1.x, v1.y);
            const inside2 = this.isInsideBrainShape(v2.x, v2.y);

            if (inside1) {
                clipped.push(v1);
            }

            // If edge crosses boundary, find intersection
            if (inside1 !== inside2) {
                let t0 = 0, t1 = 1;

                // Binary search for intersection point
                for (let j = 0; j < 10; j++) {
                    const t = (t0 + t1) / 2;
                    const x = v1.x + t * (v2.x - v1.x);
                    const y = v1.y + t * (v2.y - v1.y);

                    if (this.isInsideBrainShape(x, y) === inside1) {
                        t0 = t;
                    } else {
                        t1 = t;
                    }
                }

                const t = (t0 + t1) / 2;
                clipped.push({
                    x: v1.x + t * (v2.x - v1.x),
                    y: v1.y + t * (v2.y - v1.y)
                });
            }
        }

        return clipped;
    }

    // Check if point is inside brain shape
    isInsideBrainShape(x, y) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        const nx = (x - centerX) / 270;
        const ny = (y - centerY) / 200;

        const angle = Math.atan2(ny, nx);
        const brainFactor = 0.92 + Math.sin(angle * 3) * 0.10;
        const distance = Math.sqrt(nx * nx + ny * ny);

        return distance < brainFactor;
    }

    // Create brain outline path
    createBrainOutlinePath() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const w = 270;
        const h = 200;

        return `
            M ${cx},${cy - h}
            C ${cx + 15},${cy - h - 5} ${cx + 40},${cy - h + 10} ${cx + 60},${cy - h + 25}
            C ${cx + 75},${cy - h + 35} ${cx + 95},${cy - h + 50} ${cx + 115},${cy - h + 70}
            C ${cx + 135},${cy - h + 90} ${cx + 160},${cy - h + 115} ${cx + 180},${cy - h + 145}
            C ${cx + 195},${cy - h + 165} ${cx + 215},${cy - h + 190} ${cx + 235},${cy - h + 215}
            C ${cx + 250},${cy - h + 235} ${cx + 265},${cy - h + 260} ${cx + w},${cy}
            C ${cx + 265},${cy + 30} ${cx + 255},${cy + 60} ${cx + 240},${cy + 85}
            C ${cx + 225},${cy + 110} ${cx + 205},${cy + 135} ${cx + 180},${cy + 155}
            C ${cx + 155},${cy + 175} ${cx + 125},${cy + 185} ${cx + 95},${cy + 192}
            C ${cx + 70},${cy + 197} ${cx + 40},${cy + h - 5} ${cx + 15},${cy + h}
            C ${cx + 5},${cy + h + 2} ${cx - 5},${cy + h + 2} ${cx - 15},${cy + h}
            C ${cx - 40},${cy + h - 5} ${cx - 70},${cy + 197} ${cx - 95},${cy + 192}
            C ${cx - 125},${cy + 185} ${cx - 155},${cy + 175} ${cx - 180},${cy + 155}
            C ${cx - 205},${cy + 135} ${cx - 225},${cy + 110} ${cx - 240},${cy + 85}
            C ${cx - 255},${cy + 60} ${cx - 265},${cy + 30} ${cx - w},${cy}
            C ${cx - 265},${cy - h + 260} ${cx - 250},${cy - h + 235} ${cx - 235},${cy - h + 215}
            C ${cx - 215},${cy - h + 190} ${cx - 195},${cy - h + 165} ${cx - 180},${cy - h + 145}
            C ${cx - 160},${cy - h + 115} ${cx - 135},${cy - h + 90} ${cx - 115},${cy - h + 70}
            C ${cx - 95},${cy - h + 50} ${cx - 75},${cy - h + 35} ${cx - 60},${cy - h + 25}
            C ${cx - 40},${cy - h + 10} ${cx - 15},${cy - h - 5} ${cx},${cy - h}
            Z
        `;
    }

    // Get color for completed cells
    getCellColor(x, y, hemisphere) {
        const normalizedY = (y - 100) / 400;

        const colors = {
            left: [
                { r: 138, g: 43, b: 226 },   // Purple
                { r: 75, g: 0, b: 130 },      // Indigo
                { r: 72, g: 61, b: 139 }      // Dark slate blue
            ],
            right: [
                { r: 255, g: 20, b: 147 },    // Deep pink
                { r: 199, g: 21, b: 133 },    // Violet red
                { r: 138, g: 43, b: 226 }     // Purple
            ]
        };

        const palette = colors[hemisphere];
        const colorIndex = Math.max(0, Math.min(1.99, normalizedY * 2));
        const baseIdx = Math.floor(colorIndex);
        const nextIdx = Math.min(baseIdx + 1, palette.length - 1);
        const blend = colorIndex - baseIdx;

        const r = Math.round(palette[baseIdx].r * (1 - blend) + palette[nextIdx].r * blend);
        const g = Math.round(palette[baseIdx].g * (1 - blend) + palette[nextIdx].g * blend);
        const b = Math.round(palette[baseIdx].b * (1 - blend) + palette[nextIdx].b * blend);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Convert vertices to SVG path
    verticesToPath(vertices) {
        if (!vertices || vertices.length === 0) return '';

        let path = `M ${vertices[0].x.toFixed(2)} ${vertices[0].y.toFixed(2)}`;
        for (let i = 1; i < vertices.length; i++) {
            path += ` L ${vertices[i].x.toFixed(2)} ${vertices[i].y.toFixed(2)}`;
        }
        path += ' Z';

        return path;
    }

    // Render the brain
    renderBrain() {
        this.svg.innerHTML = '';
        const brainPath = this.createBrainOutlinePath();

        console.log(`✓ Rendering ${this.cells.length} cells...`);

        // 1. Light background inside brain
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bg.setAttribute('d', brainPath);
        bg.setAttribute('fill', '#fafafa');
        this.svg.appendChild(bg);

        // 2. Render each cell (THE PUZZLE PIECES!)
        let renderedCount = 0;

        this.cells.forEach((cell, index) => {
            const pathData = this.verticesToPath(cell.vertices);

            if (!pathData || pathData === 'M  L  Z') {
                console.warn(`⚠️ Cell ${cell.id} has invalid path`);
                return;
            }

            const cellElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            cellElement.setAttribute('d', pathData);

            // Color: gray when empty, vibrant when completed
            const fillColor = cell.completed ? cell.color : '#d4d4d4';
            cellElement.setAttribute('fill', fillColor);
            cellElement.setAttribute('stroke', '#1a1a1a');
            cellElement.setAttribute('stroke-width', '2');
            cellElement.setAttribute('stroke-linejoin', 'round');
            cellElement.setAttribute('data-cell-id', cell.id);
            cellElement.setAttribute('class', `brain-cell ${cell.completed ? 'completed' : 'uncompleted'}`);
            cellElement.style.cursor = 'pointer';

            // Click to toggle
            cellElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCell(cell.id);
            });

            cellElement.addEventListener('mouseenter', (e) => this.showTooltip(e, cell));
            cellElement.addEventListener('mouseleave', () => this.hideTooltip());
            cellElement.addEventListener('mousemove', (e) => this.moveTooltip(e));

            this.svg.appendChild(cellElement);
            renderedCount++;
        });

        console.log(`✓ Successfully rendered ${renderedCount} cells`);

        // 3. Midline divider
        const midline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        midline.setAttribute('x1', this.width / 2);
        midline.setAttribute('y1', 110);
        midline.setAttribute('x2', this.width / 2);
        midline.setAttribute('y2', 490);
        midline.setAttribute('stroke', '#1a1a1a');
        midline.setAttribute('stroke-width', '3');
        this.svg.appendChild(midline);

        // 4. Brain outline (on top)
        const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        outline.setAttribute('d', brainPath);
        outline.setAttribute('fill', 'none');
        outline.setAttribute('stroke', '#1a1a1a');
        outline.setAttribute('stroke-width', '4');
        outline.setAttribute('stroke-linejoin', 'round');
        this.svg.appendChild(outline);
    }

    // Toggle cell completion
    toggleCell(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;

        cell.completed = !cell.completed;

        if (cell.completed) {
            this.completedCells.add(cellId);
        } else {
            this.completedCells.delete(cellId);
        }

        this.saveProgress();
        this.updateCellVisual(cellId);
        this.updateStats();
    }

    // Update single cell visual
    updateCellVisual(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;

        const element = this.svg.querySelector(`[data-cell-id="${cellId}"]`);
        if (!element) return;

        const fillColor = cell.completed ? cell.color : '#d4d4d4';
        element.setAttribute('fill', fillColor);
        element.setAttribute('class', `brain-cell ${cell.completed ? 'completed' : 'uncompleted'}`);
    }

    // Calculate streak
    calculateStreak() {
        const sorted = Array.from(this.completedCells).sort((a, b) => a - b);
        if (sorted.length === 0) return 0;

        let maxStreak = 1, currentStreak = 1;

        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] === sorted[i - 1] + 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    // Update stats panel
    updateStats() {
        const streak = this.calculateStreak();
        const completed = this.completedCells.size;
        const percentage = this.cells.length > 0
            ? Math.round((completed / this.cells.length) * 100)
            : 0;

        document.getElementById('current-streak').textContent = streak;
        document.getElementById('total-completed').textContent = completed;
        document.getElementById('completion-percentage').textContent = percentage + '%';
    }

    // Tooltip
    showTooltip(event, cell) {
        const dayNum = cell.id + 1;
        const status = cell.completed ? '✅ Completed' : '⬜ Not completed';

        document.getElementById('tooltip-day-num').textContent = dayNum;
        document.getElementById('tooltip-status').textContent = status;
        document.getElementById('tooltip-date').textContent =
            cell.completed ? 'Click to unmark' : 'Click to mark complete';

        this.tooltip.classList.remove('hidden');
        this.moveTooltip(event);
    }

    moveTooltip(event) {
        this.tooltip.style.left = (event.pageX + 15) + 'px';
        this.tooltip.style.top = (event.pageY + 15) + 'px';
    }

    hideTooltip() {
        this.tooltip.classList.add('hidden');
    }

    // LocalStorage
    saveProgress() {
        const data = {
            completedCells: Array.from(this.completedCells),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('brainStreakTracker', JSON.stringify(data));
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('brainStreakTracker');
            if (saved) {
                const data = JSON.parse(saved);
                this.completedCells = new Set(data.completedCells || []);
            }
        } catch (e) {
            console.error('Failed to load progress:', e);
        }
    }

    // Reset
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            this.completedCells.clear();
            this.cells.forEach(cell => cell.completed = false);
            this.saveProgress();
            this.renderBrain();
            this.updateStats();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetProgress();
        });

        const modal = document.getElementById('info-modal');
        const infoBtn = document.getElementById('info-btn');
        const closeBtn = modal.querySelector('.close');

        infoBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧠 Brain Streak Tracker Loading...');
    new BrainStreakTracker();
});
