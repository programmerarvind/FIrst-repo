// Brain Streak Tracker - With Proper Voronoi Tessellation
class BrainStreakTracker {
    constructor() {
        this.svg = document.getElementById('brain-svg');
        this.totalCells = 95;
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

    // Generate Voronoi tessellation cells
    generateBrainCells() {
        // Generate random points within brain shape
        const points = this.generatePointsInBrain();

        // Create Voronoi diagram
        const voronoi = new SimpleVoronoi(
            points,
            [100, 100, 700, 500]
        );

        const voronoiCells = voronoi.generateCells();

        // Convert to our cell format
        this.cells = voronoiCells.map((cell, i) => {
            const site = cell.site;
            const vertices = this.clipCellToBrain(cell.vertices);

            if (vertices.length < 3) return null;

            const centerX = this.width / 2;
            const hemisphere = site.x < centerX ? 'left' : 'right';

            return {
                id: i,
                x: site.x,
                y: site.y,
                vertices: vertices,
                hemisphere: hemisphere,
                completed: this.completedCells.has(i),
                color: this.getCellColor(site.x, site.y, hemisphere)
            };
        }).filter(cell => cell !== null);

        // Limit to totalCells
        this.cells = this.cells.slice(0, this.totalCells);
    }

    // Generate random points within brain shape
    generatePointsInBrain() {
        const points = [];
        const maxAttempts = this.totalCells * 10;
        let attempts = 0;

        while (points.length < this.totalCells && attempts < maxAttempts) {
            const x = 100 + Math.random() * 600;
            const y = 100 + Math.random() * 400;

            if (this.isInsideBrainShape(x, y)) {
                // Check minimum distance from existing points
                let tooClose = false;
                for (const point of points) {
                    const dist = Math.sqrt(
                        Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
                    );
                    if (dist < 25) {
                        tooClose = true;
                        break;
                    }
                }

                if (!tooClose) {
                    points.push({ x, y });
                }
            }

            attempts++;
        }

        return points;
    }

    // Clip cell vertices to brain boundary
    clipCellToBrain(vertices) {
        // Simple approach: filter vertices outside brain and add edge intersections
        const clipped = [];

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];

            const inside1 = this.isInsideBrainShape(v1.x, v1.y);
            const inside2 = this.isInsideBrainShape(v2.x, v2.y);

            if (inside1) {
                clipped.push(v1);
            }

            // If edge crosses boundary, approximate intersection
            if (inside1 !== inside2) {
                // Binary search for intersection point
                let t0 = 0, t1 = 1;
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
        const brainFactor = 0.95 + Math.sin(angle * 3) * 0.12;
        const distance = Math.sqrt(nx * nx + ny * ny);

        return distance < brainFactor;
    }

    // Convert vertices to SVG path
    verticesToPath(vertices) {
        if (vertices.length === 0) return '';

        let path = `M ${vertices[0].x} ${vertices[0].y}`;
        for (let i = 1; i < vertices.length; i++) {
            path += ` L ${vertices[i].x} ${vertices[i].y}`;
        }
        path += ' Z';

        return path;
    }

    // Create organic brain outline path
    createBrainOutlinePath() {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const w = 270;
        const h = 200;

        const path = `
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

        return path;
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

    // Render the brain SVG
    renderBrain() {
        this.svg.innerHTML = '';

        // Add brain background
        const brainBackground = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const brainPath = this.createBrainOutlinePath();
        brainBackground.setAttribute('d', brainPath);
        brainBackground.setAttribute('fill', '#fafafa');
        this.svg.appendChild(brainBackground);

        // Render each Voronoi cell
        this.cells.forEach(cell => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = this.verticesToPath(cell.vertices);

            path.setAttribute('d', pathData);
            path.setAttribute('class', `brain-cell ${cell.completed ? 'completed' : 'uncompleted'}`);

            // IMPORTANT: Uncompleted cells are white/light gray, completed cells get color
            path.setAttribute('fill', cell.completed ? cell.color : '#ffffff');
            path.setAttribute('stroke', '#2d3748');
            path.setAttribute('stroke-width', '2.5');
            path.setAttribute('data-cell-id', cell.id);

            // Add event listeners
            path.addEventListener('click', () => this.toggleCell(cell.id));
            path.addEventListener('mouseenter', (e) => this.showTooltip(e, cell));
            path.addEventListener('mouseleave', () => this.hideTooltip());
            path.addEventListener('mousemove', (e) => this.moveTooltip(e));

            this.svg.appendChild(path);
        });

        // Add midline separator
        const midline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        midline.setAttribute('x1', this.width / 2);
        midline.setAttribute('y1', 105);
        midline.setAttribute('x2', this.width / 2);
        midline.setAttribute('y2', 495);
        midline.setAttribute('stroke', '#2d3748');
        midline.setAttribute('stroke-width', '4');
        this.svg.appendChild(midline);

        // Add brain outline
        const brainOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        brainOutline.setAttribute('d', brainPath);
        brainOutline.setAttribute('fill', 'none');
        brainOutline.setAttribute('stroke', '#2d3748');
        brainOutline.setAttribute('stroke-width', '4');
        brainOutline.setAttribute('stroke-linejoin', 'round');
        this.svg.appendChild(brainOutline);
    }

    // Toggle cell completion
    toggleCell(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;

        if (cell.completed) {
            cell.completed = false;
            this.completedCells.delete(cellId);
        } else {
            cell.completed = true;
            this.completedCells.add(cellId);
        }

        this.saveProgress();
        this.updateCellVisual(cellId);
        this.updateStats();
    }

    // Update individual cell visual
    updateCellVisual(cellId) {
        const cell = this.cells.find(c => c.id === cellId);
        if (!cell) return;

        const pathElement = this.svg.querySelector(`[data-cell-id="${cellId}"]`);

        if (cell.completed) {
            pathElement.classList.remove('uncompleted');
            pathElement.classList.add('completed');
            pathElement.setAttribute('fill', cell.color);
        } else {
            pathElement.classList.remove('completed');
            pathElement.classList.add('uncompleted');
            pathElement.setAttribute('fill', '#ffffff');
        }
    }

    // Calculate current streak
    calculateStreak() {
        const sortedCompleted = Array.from(this.completedCells).sort((a, b) => a - b);

        if (sortedCompleted.length === 0) return 0;

        let currentStreak = 1;
        let maxStreak = 1;

        for (let i = 1; i < sortedCompleted.length; i++) {
            if (sortedCompleted[i] === sortedCompleted[i - 1] + 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    // Update statistics display
    updateStats() {
        const streak = this.calculateStreak();
        const totalCompleted = this.completedCells.size;
        const percentage = Math.round((totalCompleted / this.cells.length) * 100);

        document.getElementById('current-streak').textContent = streak;
        document.getElementById('total-completed').textContent = totalCompleted;
        document.getElementById('completion-percentage').textContent = percentage + '%';
    }

    // Show tooltip
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

    // Move tooltip with cursor
    moveTooltip(event) {
        this.tooltip.style.left = (event.pageX + 15) + 'px';
        this.tooltip.style.top = (event.pageY + 15) + 'px';
    }

    // Hide tooltip
    hideTooltip() {
        this.tooltip.classList.add('hidden');
    }

    // Save progress to localStorage
    saveProgress() {
        const data = {
            completedCells: Array.from(this.completedCells),
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('brainStreakTracker', JSON.stringify(data));
    }

    // Load progress from localStorage
    loadProgress() {
        const saved = localStorage.getItem('brainStreakTracker');
        if (saved) {
            const data = JSON.parse(saved);
            this.completedCells = new Set(data.completedCells);
        }
    }

    // Reset all progress
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

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BrainStreakTracker();
});
