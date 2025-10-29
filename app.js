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
        const cols = 9;  // Reduced since brain is narrower
        const rows = 11; // Increased since brain is taller
        const cellWidth = 48;
        const cellHeight = 48;

        let cellId = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (cellId >= this.totalCells) break;

                // Calculate center of this grid cell - adjusted for new brain dimensions
                const x = 185 + col * cellWidth;
                const y = 70 + row * cellHeight;

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

    // Check if point is inside brain shape (taller, narrower proportions)
    isInsideBrainShape(x, y) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // New proportions: narrower (240) and taller (300)
        const nx = (x - centerX) / 240;
        const ny = (y - centerY) / 300;

        const angle = Math.atan2(ny, nx);

        // More variation for organic brain-like shape
        const brainFactor = 0.90 + Math.sin(angle * 3) * 0.12 + Math.sin(angle * 5) * 0.05;
        const distance = Math.sqrt(nx * nx + ny * ny);

        return distance < brainFactor;
    }

    // Create brain outline path - Taller (1.25:1 ratio) with organic bumps
    createBrainOutlinePath() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const w = 240; // Half width (narrower)
        const h = 300; // Half height (much taller for 1.25:1 ratio)

        // Create organic brain shape with bumps and curves
        return `
            M ${cx},${cy - h}

            C ${cx + 10},${cy - h - 8} ${cx + 35},${cy - h + 5} ${cx + 55},${cy - h + 25}
            C ${cx + 70},${cy - h + 40} ${cx + 90},${cy - h + 65} ${cx + 105},${cy - h + 90}
            C ${cx + 115},${cy - h + 105} ${cx + 130},${cy - h + 125} ${cx + 145},${cy - h + 150}

            C ${cx + 160},${cy - h + 175} ${cx + 180},${cy - h + 205} ${cx + 195},${cy - h + 235}
            C ${cx + 210},${cy - h + 265} ${cx + 225},${cy - h + 295} ${cx + w},${cy - 20}

            C ${cx + 235},${cy + 20} ${cx + 230},${cy + 60} ${cx + 220},${cy + 100}
            C ${cx + 210},${cy + 135} ${cx + 195},${cy + 170} ${cx + 175},${cy + 200}

            C ${cx + 155},${cy + 230} ${cx + 130},${cy + 255} ${cx + 100},${cy + 275}
            C ${cx + 70},${cy + 290} ${cx + 35},${cy + 297} ${cx + 10},${cy + h - 5}

            C ${cx + 5},${cy + h} ${cx - 5},${cy + h} ${cx - 10},${cy + h - 5}

            C ${cx - 35},${cy + 297} ${cx - 70},${cy + 290} ${cx - 100},${cy + 275}
            C ${cx - 130},${cy + 255} ${cx - 155},${cy + 230} ${cx - 175},${cy + 200}

            C ${cx - 195},${cy + 170} ${cx - 210},${cy + 135} ${cx - 220},${cy + 100}
            C ${cx - 230},${cy + 60} ${cx - 235},${cy + 20} ${cx - w},${cy - 20}

            C ${cx - 225},${cy - h + 295} ${cx - 210},${cy - h + 265} ${cx - 195},${cy - h + 235}
            C ${cx - 180},${cy - h + 205} ${cx - 160},${cy - h + 175} ${cx - 145},${cy - h + 150}

            C ${cx - 130},${cy - h + 125} ${cx - 115},${cy - h + 105} ${cx - 105},${cy - h + 90}
            C ${cx - 90},${cy - h + 65} ${cx - 70},${cy - h + 40} ${cx - 55},${cy - h + 25}
            C ${cx - 35},${cy - h + 5} ${cx - 10},${cy - h - 8} ${cx},${cy - h}
            Z
        `;
    }

    // Get color for completed cells with progression gradient
    getCellColor(x, y, hemisphere) {
        // Calculate position in brain for base color
        const normalizedY = (y - 50) / 500;

        // Base color palettes by hemisphere
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

    // Get dynamic color based on completion order (streak progression)
    getCellColorWithProgress(cellId) {
        // Find position in completion order
        const completedArray = Array.from(this.completedCells).sort((a, b) => a - b);
        const position = completedArray.indexOf(cellId);

        if (position === -1) return null; // Not completed

        // Progression from cool (purple) to warm (orange/pink)
        const progress = completedArray.length > 1 ? position / (completedArray.length - 1) : 0;

        // Color gradient: Cool purple → Violet → Warm pink → Orange
        const colors = [
            { r: 138, g: 43, b: 226 },   // Purple (early)
            { r: 199, g: 21, b: 133 },   // Violet red (middle)
            { r: 255, g: 20, b: 147 },   // Deep pink (middle-late)
            { r: 255, g: 105, b: 180 }   // Hot pink (late)
        ];

        const colorPos = progress * (colors.length - 1);
        const baseIdx = Math.floor(colorPos);
        const nextIdx = Math.min(baseIdx + 1, colors.length - 1);
        const blend = colorPos - baseIdx;

        const r = Math.round(colors[baseIdx].r * (1 - blend) + colors[nextIdx].r * blend);
        const g = Math.round(colors[baseIdx].g * (1 - blend) + colors[nextIdx].g * blend);
        const b = Math.round(colors[baseIdx].b * (1 - blend) + colors[nextIdx].b * blend);

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

            // Color: gray when empty, progressive gradient when completed
            const fillColor = cell.completed
                ? this.getCellColorWithProgress(cell.id)
                : '#d4d4d4';
            cellElement.setAttribute('fill', fillColor);
            cellElement.setAttribute('stroke', '#1a1a1a');
            cellElement.setAttribute('stroke-width', '2');
            cellElement.setAttribute('stroke-linejoin', 'round');
            cellElement.setAttribute('data-cell-id', cell.id);
            cellElement.setAttribute('class', `brain-cell ${cell.completed ? 'completed' : 'uncompleted'}`);
            cellElement.style.cursor = 'pointer';
            cellElement.style.transition = 'all 0.3s ease';

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

        // 3. Midline divider (adjusted for taller brain)
        const midline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        midline.setAttribute('x1', this.width / 2);
        midline.setAttribute('y1', 60);  // Higher up for taller brain
        midline.setAttribute('x2', this.width / 2);
        midline.setAttribute('y2', 540); // Lower down for taller brain
        midline.setAttribute('stroke', '#1a1a1a');
        midline.setAttribute('stroke-width', '3');
        this.svg.appendChild(midline);

        // 4. Brain outline (on top) - thicker for better definition
        const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        outline.setAttribute('d', brainPath);
        outline.setAttribute('fill', 'none');
        outline.setAttribute('stroke', '#1a1a1a');
        outline.setAttribute('stroke-width', '5.5');
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

    // Update single cell visual with animation
    updateCellVisual(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;

        const element = this.svg.querySelector(`[data-cell-id="${cellId}"]`);
        if (!element) return;

        // Add click animation
        element.style.transform = 'scale(1.15)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);

        // Update color with progression gradient
        const fillColor = cell.completed
            ? this.getCellColorWithProgress(cellId)
            : '#d4d4d4';
        element.setAttribute('fill', fillColor);
        element.setAttribute('class', `brain-cell ${cell.completed ? 'completed' : 'uncompleted'}`);

        // When completing a cell, update ALL completed cells to recalculate colors
        // (since position in gradient changes)
        if (cell.completed) {
            setTimeout(() => this.updateAllCompletedColors(), 250);
        }
    }

    // Update all completed cell colors (for gradient progression)
    updateAllCompletedColors() {
        this.cells.forEach(cell => {
            if (cell.completed) {
                const element = this.svg.querySelector(`[data-cell-id="${cell.id}"]`);
                if (element) {
                    const color = this.getCellColorWithProgress(cell.id);
                    element.setAttribute('fill', color);
                }
            }
        });
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
