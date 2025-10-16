# Black Rock City Life - Event Visualizer

Last night I was thinking about how placement tries to place camps with the goal of creating balanced neighborhoods where there's always something going on. I do remember as I hiked around black rock city having a sense that certain neighborhoods and time periods were much more active than others. Sometimes my whole block was fully dead; other times I walked down certain blocks and it seemed like every camp was fully lit up with activity.

I realized that with the data in the API it should be super easy just to make a visualizer that shows all scheduled events on a map with a slider that lets you set the time and see the events happening at that time, lit up. So I made one!

[See it running here!](https://brclife.vercel.app/)

## Features

- **Interactive Map**: View the Black Rock City 2025 map with event locations
- **Zoom & Pan**: Use mouse wheel to zoom in/out, click and drag to pan around the map, double-click to reset view
- **Time Slider**: Scrub through the entire week of Burning Man (August 24 - September 1, 2025)
- **Event Visualization**: See events as emoji markers on the map based on their type:
  - 🎵 Pink: Music/Party
  - 🎓 Cyan: Class/Workshop
  - 🍕 Yellow: Food
  - 🍹 Green: Beverages
  - 🎨 Orange: Arts & Crafts
  - 🔞 Red: Mature Audiences
  - ✨ White: Other
- **Playback Controls**: Play/pause the timeline, adjust speed (1x, 2x, 5x, 10x), default speed is 10x
- **Event Details**: Hover over any event marker to see details in the status bar at the bottom
- **Day/Night Cycle**: Visual darkening of the map during nighttime hours (with sunrise/sunset transitions)
- **Long Event Filter**: Toggle to hide/show events that are 6+ hours long
- **Live Event Count**: See how many events are happening at any given time
- **Pacific Time Display**: All times shown in Pacific Time (America/Los_Angeles)

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
2. **Play Button**: Click to automatically advance time (default 10x speed)
3. **Speed Control**: Adjust how fast time moves during playback (1x, 2x, 5x, 10x)
4. **Reset**: Return to the beginning of the week
5. **Event Markers**: Hover over any emoji marker to see event details in the status bar
6. **Zoom**: Use mouse wheel to zoom in/out on the map
7. **Pan**: Click and drag to move around the map
8. **Reset View**: Double-click anywhere on the map to reset zoom and pan
9. **Toggle Long Events**: Hide or show events that are 6+ hours long
10. **Legend**: Refer to the emoji legend to understand event types

## Data Structure

- `data/events.json` - Event data with times, locations, and descriptions
- `data/camps.json` - Camp data with locations on the playa
- `data/map.png` - Black Rock City 2025 map
- `data/dimensions` - Official BRC 2025 dimensions document for accurate street distances

## Technical Details

- Pure HTML/CSS/JavaScript (no frameworks required)
- Responsive design
- Event locations are mapped from camp addresses using structured location data (frontage, intersection, exact_location)
- Accurate polar coordinate system based on official BRC 2025 dimensions
- Events display as emoji markers with pulsing animations
- Real-time filtering based on event occurrence times
- CSS transforms for smooth zoom and pan interactions
- Day/night overlay with sunrise (6:00-6:30 AM) and sunset (7:30-8:00 PM) transitions
- All times displayed in Pacific Time (America/Los_Angeles timezone)

## Browser Compatibility

Works best in modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Enjoy exploring Black Rock City! 🔥✨
