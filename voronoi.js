// Simple Voronoi Diagram Implementation
// Creates tessellated cells that fit together like puzzle pieces

class SimpleVoronoi {
    constructor(points, bbox) {
        this.points = points;
        this.bbox = bbox; // [minX, minY, maxX, maxY]
    }

    // Generate Voronoi cells for all points
    generateCells() {
        const cells = [];

        for (let i = 0; i < this.points.length; i++) {
            const cell = this.computeCell(i);
            if (cell && cell.length > 0) {
                cells.push({
                    site: this.points[i],
                    vertices: cell
                });
            }
        }

        return cells;
    }

    // Compute Voronoi cell for a specific point
    computeCell(index) {
        const site = this.points[index];
        const [minX, minY, maxX, maxY] = this.bbox;

        // Start with bounding box corners
        let vertices = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY }
        ];

        // For each other point, clip the cell
        for (let i = 0; i < this.points.length; i++) {
            if (i === index) continue;

            const other = this.points[i];
            vertices = this.clipByBisector(vertices, site, other);

            if (vertices.length === 0) break;
        }

        return vertices;
    }

    // Clip polygon by perpendicular bisector between two points
    clipByBisector(vertices, site, other) {
        if (vertices.length === 0) return [];

        const midX = (site.x + other.x) / 2;
        const midY = (site.y + other.y) / 2;

        const dx = other.x - site.x;
        const dy = other.y - site.y;

        // Perpendicular vector (normal to the bisector)
        const nx = -dy;
        const ny = dx;

        // Clip polygon
        const newVertices = [];

        for (let i = 0; i < vertices.length; i++) {
            const v1 = vertices[i];
            const v2 = vertices[(i + 1) % vertices.length];

            const d1 = (v1.x - midX) * nx + (v1.y - midY) * ny;
            const d2 = (v2.x - midX) * nx + (v2.y - midY) * ny;

            if (d1 >= 0) {
                newVertices.push(v1);
            }

            // If edge crosses the bisector, add intersection point
            if ((d1 >= 0 && d2 < 0) || (d1 < 0 && d2 >= 0)) {
                const t = d1 / (d1 - d2);
                newVertices.push({
                    x: v1.x + t * (v2.x - v1.x),
                    y: v1.y + t * (v2.y - v1.y)
                });
            }
        }

        return newVertices;
    }

    // Sutherland-Hodgman polygon clipping against a convex boundary
    static clipPolygonToBoundary(vertices, boundaryPath) {
        // For simplicity, we'll use a different approach in the main code
        return vertices;
    }
}
