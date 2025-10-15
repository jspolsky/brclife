# Black Rock City Life - Event Visualizer

An interactive web application to visualize Burning Man events throughout the week on a map of Black Rock City.

## Features

- **Interactive Map**: View the Black Rock City 2025 map with event locations
- **Time Slider**: Scrub through the entire week of Burning Man (August 24 - September 1, 2025)
- **Event Visualization**: See events as colored lights on the map based on their type:
  - Pink: Music/Party
  - Cyan: Class/Workshop
  - Yellow: Food
  - Green: Beverages
  - Orange: Arts & Crafts
  - Red: Mature Audiences
  - White: Other
- **Playback Controls**: Play/pause the timeline, adjust speed (1x, 2x, 5x, 10x)
- **Event Details**: Click on any event marker to see details about the event
- **Live Event Count**: See how many events are happening at any given time

## How to Run

### Option 1: Using Python's Built-in Server (Recommended)

```bash
cd /Users/spolsky/Dropbox/src/brclife
python3 -m http.server 8000
```

Then open your browser to: http://localhost:8000

### Option 2: Using Node.js http-server

```bash
cd /Users/spolsky/Dropbox/src/brclife
npx http-server -p 8000
```

Then open your browser to: http://localhost:8000

### Option 3: Using VS Code Live Server

1. Open the `brclife` folder in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage

1. **Time Slider**: Drag the slider at the bottom to move through time
2. **Play Button**: Click to automatically advance time
3. **Speed Control**: Adjust how fast time moves during playback
4. **Reset**: Return to the beginning of the week
5. **Event Markers**: Click on any colored dot to see event details
6. **Legend**: Refer to the color legend to understand event types

## Data Structure

- `data/events.json` - Event data with times, locations, and descriptions
- `data/camps.json` - Camp data with locations on the playa
- `data/map.png` - Black Rock City 2025 map

## Technical Details

- Pure HTML/CSS/JavaScript (no frameworks required)
- Responsive design
- Event locations are mapped from camp addresses (e.g., "6:00 & F")
- Events pulse and glow based on their type
- Real-time filtering based on event occurrence times

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Enjoy exploring Black Rock City! 🔥✨
