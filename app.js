// Brain Streak Tracker - Main Application
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

    // Generate points for Voronoi diagram within brain shape
    generateBrainPoints() {
        const points = [];
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Generate points within brain-like boundaries
        for (let i = 0; i < this.totalCells; i++) {
            let x, y;
            let isValid = false;

            // Keep trying until we get a point inside the brain shape
            while (!isValid) {
                // Generate random point
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 200 + 50;

                x = centerX + Math.cos(angle) * radius * 1.2;
                y = centerY + Math.sin(angle) * radius * 0.8;

                // Add some brain-like irregularity
                x += (Math.random() - 0.5) * 40;
                y += (Math.random() - 0.5) * 40;

                // Check if point is within brain bounds
                if (this.isInsideBrainShape(x, y)) {
                    isValid = true;
                }
            }

            points.push([x, y]);
        }

        return points;
    }

    // Define brain-like shape boundary
    isInsideBrainShape(x, y) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Normalized coordinates
        const nx = (x - centerX) / (this.width / 2);
        const ny = (y - centerY) / (this.height / 2);

        // Brain-like ellipse with some irregularity
        const brainFactor = 1.2 + Math.sin(Math.atan2(ny, nx) * 3) * 0.15;
        const distance = Math.sqrt(nx * nx * 0.7 + ny * ny * 1.2);

        return distance < brainFactor && x > 100 && x < 700 && y > 80 && y < 520;
    }

    // Generate Voronoi cells
    generateBrainCells() {
        const points = this.generateBrainPoints();

        // Create Voronoi diagram using d3-delaunay
        const delaunay = d3.Delaunay.from(points);
        const voronoi = delaunay.voronoi([0, 0, this.width, this.height]);

        // Create cell objects
        this.cells = points.map((point, i) => {
            const [x, y] = point;
            const cellPath = voronoi.renderCell(i);
            const hemisphere = x < this.width / 2 ? 'left' : 'right';

            return {
                id: i,
                x: x,
                y: y,
                path: cellPath,
                hemisphere: hemisphere,
                completed: this.completedCells.has(i),
                color: this.getCellColor(x, y, hemisphere)
            };
        });
    }

    // Get color based on position in brain
    getCellColor(x, y, hemisphere) {
        // Create gradient from top to bottom and left to right
        const normalizedX = x / this.width;
        const normalizedY = y / this.height;

        // Color palettes for different brain regions
        const colors = {
            left: [
                { r: 138, g: 43, b: 226 },   // Blue-violet (top)
                { r: 75, g: 0, b: 130 },      // Indigo (middle)
                { r: 72, g: 61, b: 139 }      // Dark slate blue (bottom)
            ],
            right: [
                { r: 255, g: 20, b: 147 },    // Deep pink (top)
                { r: 199, g: 21, b: 133 },    // Medium violet red (middle)
                { r: 138, g: 43, b: 226 }     // Blue violet (bottom)
            ]
        };

        const palette = colors[hemisphere];
        const colorIndex = normalizedY * 2;
        const baseColorIndex = Math.min(Math.floor(colorIndex), palette.length - 2);
        const nextColorIndex = baseColorIndex + 1;
        const blend = colorIndex - baseColorIndex;

        const r = Math.round(palette[baseColorIndex].r * (1 - blend) + palette[nextColorIndex].r * blend);
        const g = Math.round(palette[baseColorIndex].g * (1 - blend) + palette[nextColorIndex].g * blend);
        const b = Math.round(palette[baseColorIndex].b * (1 - blend) + palette[nextColorIndex].b * blend);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Render the brain SVG
    renderBrain() {
        this.svg.innerHTML = '';

        // Add midline separator
        const midline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        midline.setAttribute('x1', this.width / 2);
        midline.setAttribute('y1', 80);
        midline.setAttribute('x2', this.width / 2);
        midline.setAttribute('y2', 520);
        midline.setAttribute('stroke', '#2d3748');
        midline.setAttribute('stroke-width', '3');
        midline.setAttribute('stroke-dasharray', '5,5');
        this.svg.appendChild(midline);

        // Render each cell
        this.cells.forEach(cell => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', cell.path);
            path.setAttribute('class', `brain-cell ${cell.completed ? 'completed' : 'uncompleted'}`);
            path.setAttribute('fill', cell.completed ? cell.color : '#e2e8f0');
            path.setAttribute('data-cell-id', cell.id);

            // Add event listeners
            path.addEventListener('click', () => this.toggleCell(cell.id));
            path.addEventListener('mouseenter', (e) => this.showTooltip(e, cell));
            path.addEventListener('mouseleave', () => this.hideTooltip());
            path.addEventListener('mousemove', (e) => this.moveTooltip(e));

            this.svg.appendChild(path);
        });
    }

    // Toggle cell completion
    toggleCell(cellId) {
        const cell = this.cells[cellId];

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
        const cell = this.cells[cellId];
        const pathElement = this.svg.querySelector(`[data-cell-id="${cellId}"]`);

        if (cell.completed) {
            pathElement.classList.remove('uncompleted');
            pathElement.classList.add('completed');
            pathElement.setAttribute('fill', cell.color);
        } else {
            pathElement.classList.remove('completed');
            pathElement.classList.add('uncompleted');
            pathElement.setAttribute('fill', '#e2e8f0');
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
        const percentage = Math.round((totalCompleted / this.totalCells) * 100);

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
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetProgress();
        });

        // Info button and modal
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
