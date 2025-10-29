// Brain Streak Tracker - Simplified Working Version
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
        this.generateBrainCells();
        this.renderBrain();
        this.updateStats();
        this.setupEventListeners();
    }

    // Generate cells using grid-based Voronoi-like pattern
    generateBrainCells() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Generate seed points in a grid pattern within brain
        const points = [];
        const cols = 10;
        const rows = 9;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = 150 + col * 50 + (Math.random() - 0.5) * 25;
                const y = 130 + row * 45 + (Math.random() - 0.5) * 20;

                if (this.isInsideBrainShape(x, y)) {
                    points.push({ x, y, id: points.length });
                }
            }
        }

        // Limit to target number
        const limitedPoints = points.slice(0, this.totalCells);

        // Create Voronoi diagram
        const voronoi = new SimpleVoronoi(limitedPoints, [100, 100, 700, 500]);
        const voronoiCells = voronoi.generateCells();

        // Convert to cell objects
        this.cells = voronoiCells.map((vcell, i) => {
            if (i >= limitedPoints.length) return null;

            const site = limitedPoints[i];
            let vertices = vcell.vertices;

            // Clip to brain shape
            vertices = this.clipPolygonToBrain(vertices);

            if (vertices.length < 3) return null;

            const hemisphere = site.x < centerX ? 'left' : 'right';

            return {
                id: site.id,
                x: site.x,
                y: site.y,
                vertices: vertices,
                hemisphere: hemisphere,
                completed: this.completedCells.has(site.id),
                color: this.getCellColor(site.x, site.y, hemisphere)
            };
        }).filter(cell => cell !== null);

        console.log(`Generated ${this.cells.length} cells`);
    }

    // More robust clipping to brain boundary
    clipPolygonToBrain(vertices) {
        const clipped = [];

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];

            const inside1 = this.isInsideBrainShape(v1.x, v1.y);
            const inside2 = this.isInsideBrainShape(v2.x, v2.y);

            if (inside1) {
                clipped.push(v1);
            }

            // Edge crosses boundary
            if (inside1 !== inside2) {
                // Binary search for intersection
                let t0 = 0, t1 = 1;
                for (let j = 0; j < 15; j++) {
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

    // Check if point is inside brain
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
                { r: 138, g: 43, b: 226 },
                { r: 75, g: 0, b: 130 },
                { r: 72, g: 61, b: 139 }
            ],
            right: [
                { r: 255, g: 20, b: 147 },
                { r: 199, g: 21, b: 133 },
                { r: 138, g: 43, b: 226 }
            ]
        };

        const palette = colors[hemisphere];
        const colorIndex = Math.max(0, Math.min(1.99, normalizedY * 2));
        const baseColorIndex = Math.floor(colorIndex);
        const nextColorIndex = Math.min(baseColorIndex + 1, palette.length - 1);
        const blend = colorIndex - baseColorIndex;

        const r = Math.round(palette[baseColorIndex].r * (1 - blend) + palette[nextColorIndex].r * blend);
        const g = Math.round(palette[baseColorIndex].g * (1 - blend) + palette[nextColorIndex].g * blend);
        const b = Math.round(palette[baseColorIndex].b * (1 - blend) + palette[nextColorIndex].b * blend);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Convert vertices to path
    verticesToPath(vertices) {
        if (!vertices || vertices.length === 0) return '';

        let path = `M ${vertices[0].x} ${vertices[0].y}`;
        for (let i = 1; i < vertices.length; i++) {
            path += ` L ${vertices[i].x} ${vertices[i].y}`;
        }
        path += ' Z';

        return path;
    }

    // Render the brain
    renderBrain() {
        this.svg.innerHTML = '';
        const brainPath = this.createBrainOutlinePath();

        // 1. Brain background (light color so we can see cells)
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        background.setAttribute('d', brainPath);
        background.setAttribute('fill', '#f0f0f0');
        this.svg.appendChild(background);

        console.log(`Rendering ${this.cells.length} cells`);

        // 2. Render each cell (THE PUZZLE PIECES)
        this.cells.forEach(cell => {
            const cellPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = this.verticesToPath(cell.vertices);

            if (!pathData) {
                console.warn(`Cell ${cell.id} has no path data`);
                return;
            }

            cellPath.setAttribute('d', pathData);
            cellPath.setAttribute('class', `brain-cell ${cell.completed ? 'completed' : 'uncompleted'}`);

            // Empty cells: light gray, Completed cells: vibrant color
            const fillColor = cell.completed ? cell.color : '#e8e8e8';
            cellPath.setAttribute('fill', fillColor);
            cellPath.setAttribute('stroke', '#2d3748');
            cellPath.setAttribute('stroke-width', '2.5');
            cellPath.setAttribute('stroke-linejoin', 'round');
            cellPath.setAttribute('data-cell-id', cell.id);

            // Click handler
            cellPath.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCell(cell.id);
            });

            cellPath.addEventListener('mouseenter', (e) => this.showTooltip(e, cell));
            cellPath.addEventListener('mouseleave', () => this.hideTooltip());
            cellPath.addEventListener('mousemove', (e) => this.moveTooltip(e));

            this.svg.appendChild(cellPath);
        });

        // 3. Midline separator
        const midline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        midline.setAttribute('x1', this.width / 2);
        midline.setAttribute('y1', 110);
        midline.setAttribute('x2', this.width / 2);
        midline.setAttribute('y2', 490);
        midline.setAttribute('stroke', '#2d3748');
        midline.setAttribute('stroke-width', '3');
        this.svg.appendChild(midline);

        // 4. Brain outline (on top for clear boundary)
        const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        outline.setAttribute('d', brainPath);
        outline.setAttribute('fill', 'none');
        outline.setAttribute('stroke', '#2d3748');
        outline.setAttribute('stroke-width', '4');
        outline.setAttribute('stroke-linejoin', 'round');
        this.svg.appendChild(outline);
    }

    // Toggle cell
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

    // Update cell visual
    updateCellVisual(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;

        const pathElement = this.svg.querySelector(`[data-cell-id="${cellId}"]`);
        if (!pathElement) return;

        const fillColor = cell.completed ? cell.color : '#e8e8e8';
        pathElement.setAttribute('fill', fillColor);

        if (cell.completed) {
            pathElement.classList.add('completed');
            pathElement.classList.remove('uncompleted');
        } else {
            pathElement.classList.add('uncompleted');
            pathElement.classList.remove('completed');
        }
    }

    // Calculate streak
    calculateStreak() {
        const sorted = Array.from(this.completedCells).sort((a, b) => a - b);
        if (sorted.length === 0) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

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

    // Update stats
    updateStats() {
        const streak = this.calculateStreak();
        const completed = this.completedCells.size;
        const percentage = Math.round((completed / this.cells.length) * 100);

        document.getElementById('current-streak').textContent = streak;
        document.getElementById('total-completed').textContent = completed;
        document.getElementById('completion-percentage').textContent = percentage + '%';
    }

    // Tooltip methods
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

    // Storage
    saveProgress() {
        const data = {
            completedCells: Array.from(this.completedCells),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('brainStreakTracker', JSON.stringify(data));
    }

    loadProgress() {
        const saved = localStorage.getItem('brainStreakTracker');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.completedCells = new Set(data.completedCells);
            } catch (e) {
                console.error('Failed to load progress', e);
            }
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

    // Event listeners
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
    new BrainStreakTracker();
});
