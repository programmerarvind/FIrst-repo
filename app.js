// Brain Streak Tracker - Main Application (No external dependencies)
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

    // Generate irregular mosaic cells without external libraries
    generateBrainCells() {
        const cells = [];
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Define brain shape boundaries
        const brainWidth = 550;
        const brainHeight = 400;
        const brainLeft = centerX - brainWidth / 2;
        const brainTop = centerY - brainHeight / 2;

        // Create irregular grid of cells
        const cols = 12;
        const rows = 8;
        const baseWidth = brainWidth / cols;
        const baseHeight = brainHeight / rows;

        let cellId = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (cellId >= this.totalCells) break;

                // Calculate base position with randomization
                const randomX = (Math.random() - 0.5) * baseWidth * 0.4;
                const randomY = (Math.random() - 0.5) * baseHeight * 0.4;

                const x = brainLeft + col * baseWidth + baseWidth / 2 + randomX;
                const y = brainTop + row * baseHeight + baseHeight / 2 + randomY;

                // Check if within brain shape
                if (this.isInsideBrainShape(x, y)) {
                    // Create irregular polygon points
                    const points = this.createIrregularPolygon(
                        x, y,
                        baseWidth * 0.9,
                        baseHeight * 0.9
                    );

                    const hemisphere = x < centerX ? 'left' : 'right';

                    cells.push({
                        id: cellId,
                        x: x,
                        y: y,
                        points: points,
                        hemisphere: hemisphere,
                        completed: this.completedCells.has(cellId),
                        color: this.getCellColor(x, y, hemisphere)
                    });

                    cellId++;
                }
            }
        }

        this.cells = cells;
    }

    // Create an irregular polygon around a center point
    createIrregularPolygon(cx, cy, width, height) {
        const points = [];
        const sides = 5 + Math.floor(Math.random() * 2); // 5 or 6 sides

        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;

            // Randomize radius for irregularity
            const radiusX = (width / 2) * (0.7 + Math.random() * 0.5);
            const radiusY = (height / 2) * (0.7 + Math.random() * 0.5);

            // Add some angular randomness
            const angleOffset = (Math.random() - 0.5) * 0.3;
            const finalAngle = angle + angleOffset;

            const x = cx + Math.cos(finalAngle) * radiusX;
            const y = cy + Math.sin(finalAngle) * radiusY;

            points.push({ x, y });
        }

        return points;
    }

    // Convert points array to SVG path string
    pointsToPath(points) {
        if (points.length === 0) return '';

        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`;
        }

        path += ' Z';
        return path;
    }

    // Define brain-like shape boundary
    isInsideBrainShape(x, y) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        // Normalized coordinates
        const nx = (x - centerX) / 280;
        const ny = (y - centerY) / 210;

        // Brain-like ellipse with some irregularity
        const angle = Math.atan2(ny, nx);
        const brainFactor = 1.0 + Math.sin(angle * 3) * 0.12;
        const distance = Math.sqrt(nx * nx + ny * ny);

        return distance < brainFactor;
    }

    // Create organic brain outline path with bumpy, wavy edges
    createBrainOutlinePath() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        // Brain dimensions
        const w = 270; // half width
        const h = 200; // half height

        // Create path with bezier curves for organic appearance
        // Starting from top center, going clockwise
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

    // Get color based on position in brain
    getCellColor(x, y, hemisphere) {
        // Create gradient from top to bottom
        const normalizedY = (y - 100) / 400;

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

        // Add brain background fill
        const brainBackground = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const brainPath = this.createBrainOutlinePath();
        brainBackground.setAttribute('d', brainPath);
        brainBackground.setAttribute('fill', '#f5f5f5');
        brainBackground.setAttribute('opacity', '0.3');
        this.svg.appendChild(brainBackground);

        // Add brain outline with organic, wavy edges
        const brainOutline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        brainOutline.setAttribute('d', brainPath);
        brainOutline.setAttribute('fill', 'none');
        brainOutline.setAttribute('stroke', '#2d3748');
        brainOutline.setAttribute('stroke-width', '4');
        brainOutline.setAttribute('stroke-linejoin', 'round');
        this.svg.appendChild(brainOutline);

        // Add midline separator (central dividing line)
        const midline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        midline.setAttribute('x1', this.width / 2);
        midline.setAttribute('y1', 105);
        midline.setAttribute('x2', this.width / 2);
        midline.setAttribute('y2', 495);
        midline.setAttribute('stroke', '#2d3748');
        midline.setAttribute('stroke-width', '4');
        this.svg.appendChild(midline);

        // Render each cell
        this.cells.forEach(cell => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const pathData = this.pointsToPath(cell.points);

            path.setAttribute('d', pathData);
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
