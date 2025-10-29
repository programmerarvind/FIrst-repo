# Brain Streak Tracker

A beautiful, interactive web application that visualizes your daily habit tracking as a colorful brain filled with mosaic cells.

## Features

### Visual Design
- **Brain-shaped container** divided into left and right hemispheres
- **95 irregular polygonal cells** created using Voronoi diagram algorithm
- **Stained-glass mosaic pattern** with unique colored cells
- **Smooth animations** when marking cells as complete
- **Responsive design** that works on desktop and mobile

### Tracking Features
- **Daily Progress**: Each cell represents one day of habit completion
- **Interactive Cells**: Click any cell to mark it complete and fill it with color
- **Streak Counter**: Automatically calculates your current streak
- **Progress Stats**: View total completed days and brain fill percentage
- **Persistent Storage**: Your progress is saved locally in the browser
- **Hover Tooltips**: See day number and completion status

### Color Scheme
- **Left Hemisphere**: Beautiful gradient from blue-violet to dark slate blue
- **Right Hemisphere**: Gradient from deep pink to violet
- **Uncompleted Cells**: Light gray
- **Visual Feedback**: Cells light up with vibrant colors when completed

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. You'll see a brain divided into 95 mosaic cells
3. Each cell starts as white/gray (uncompleted)

### Tracking Your Habit
1. **Click a cell** to mark a day as complete - it will fill with color
2. **Click again** to unmark it if needed
3. **Hover over cells** to see their day number and status
4. Watch your **streak counter** increase as you stay consistent!

### Stats Panel
- **Current Streak**: Longest sequence of consecutive completed days
- **Days Completed**: Total number of cells filled
- **Brain Filled**: Percentage of the brain that's complete

### Buttons
- **Reset Progress**: Clear all progress and start fresh
- **How It Works**: View detailed instructions

## Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **JavaScript (ES6+)**: Object-oriented programming with classes
- **D3-Delaunay**: Voronoi diagram generation for irregular polygons
- **SVG**: Scalable vector graphics for crisp visuals
- **LocalStorage**: Client-side data persistence

### Architecture
- `index.html`: Main HTML structure and layout
- `styles.css`: Complete styling including responsive design
- `app.js`: Core application logic with BrainStreakTracker class

### Key Algorithms
1. **Point Generation**: Random points generated within brain-shaped boundary
2. **Voronoi Diagram**: Creates irregular polygonal cells from points
3. **Color Gradients**: Position-based color calculation for each hemisphere
4. **Streak Calculation**: Finds longest sequence of consecutive completed cells

## Customization

### Change Number of Cells
Edit `app.js` line 6:
```javascript
this.totalCells = 95; // Change to desired number (90-100 recommended)
```

### Modify Colors
Edit the color palettes in `getCellColor()` method in `app.js`:
```javascript
const colors = {
    left: [
        { r: 138, g: 43, b: 226 },   // Your custom RGB values
        // ... add more color stops
    ],
    right: [
        { r: 255, g: 20, b: 147 },   // Your custom RGB values
        // ... add more color stops
    ]
};
```

### Adjust Brain Shape
Modify `isInsideBrainShape()` method in `app.js` to change the brain boundary.

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements
- [ ] Add date tracking for each cell
- [ ] Export progress as image
- [ ] Multiple habit trackers
- [ ] Dark mode toggle
- [ ] Notes/journal for each day
- [ ] Calendar view integration
- [ ] Share progress on social media

## License
MIT License - feel free to use and modify for your own projects!

## Author
Created with Claude Code

---

**Start tracking your habits today and watch your brain light up with progress!** 🧠✨
