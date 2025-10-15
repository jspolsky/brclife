// Global state
let eventsData = [];
let campsData = [];
let campLocationMap = {};
let currentTime = new Date('2025-08-24T00:00:00-07:00');
let startTime = new Date('2025-08-24T00:00:00-07:00');
let endTime = new Date('2025-09-01T21:00:00-07:00');
let isPlaying = false;
let playbackSpeed = 1;
let playbackInterval = null;

// Initialize the application
async function init() {
    try {
        // Load data
        const [events, camps] = await Promise.all([
            fetch('data/events.json').then(r => r.json()),
            fetch('data/camps.json').then(r => r.json())
        ]);

        eventsData = events;
        campsData = camps;

        // Create camp location map
        createCampLocationMap();

        // Setup event listeners
        setupEventListeners();

        // Draw debug street overlay
        drawStreetOverlay();

        // Initial render
        updateVisualization();

        console.log(`Loaded ${eventsData.length} events and ${campsData.length} camps`);
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading event data. Please check that the data files exist.');
    }
}

// Create a map of camp IDs to their coordinates on the map
function createCampLocationMap() {
    let mappedCount = 0;
    campsData.forEach(camp => {
        if (camp.location) {
            const coords = parseCampLocation(camp.location, camp.name);
            if (coords) {
                campLocationMap[camp.uid] = coords;
                mappedCount++;
                // Debug: log first few mappings
                if (mappedCount <= 10) {
                    console.log(`${camp.name}: frontage=${camp.location.frontage}, intersection=${camp.location.intersection}, exact=${camp.location.exact_location} -> (${coords.x.toFixed(3)}, ${coords.y.toFixed(3)})`);
                }
            }
        }
    });
    console.log(`Mapped ${mappedCount} camps to coordinates`);
}

// Parse a camp location object into pixel coordinates
function parseCampLocation(location, campName) {
    if (!location) return null;

    // Handle special locations
    if (location.frontage && location.frontage.includes('Center Camp')) {
        return { x: 0.5, y: 0.58 }; // Center camp is slightly below center
    }

    const frontage = location.frontage;
    const intersection = location.intersection;
    const exactLocation = location.exact_location || '';

    if (!frontage || !intersection) return null;

    // Determine if frontage is a time (radial) or letter (arc street)
    const frontageIsTime = /^\d+:\d+/.test(frontage);
    const intersectionIsTime = /^\d+:\d+/.test(intersection);

    let radial, arcStreet;

    if (frontageIsTime) {
        radial = frontage;
        arcStreet = intersection;
    } else {
        radial = intersection;
        arcStreet = frontage;
    }

    // Parse the time (radial position)
    const timeMatch = radial.match(/(\d+):(\d+)/);
    if (!timeMatch) return null;

    const hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const totalHours = hours + minutes / 60;

    // Parse the street letter (arc position)
    const streetMatch = arcStreet.match(/([A-L])/i);
    if (!streetMatch) return null;
    const street = streetMatch[1].toUpperCase();

    // Convert time to angle in radians
    // 6:00 = π radians (straight down/south)
    // 12:00 = 0 radians (straight up/north)
    const angle = (totalHours / 12) * 2 * Math.PI;

    // Street distances from center (calibrated to match the map)
    // The city extends from about 0.08 to 0.52 of the image radius
    const streetDistances = {
        'A': 0.08,
        'B': 0.12,
        'C': 0.16,
        'D': 0.20,
        'E': 0.24,
        'F': 0.28,
        'G': 0.32,
        'H': 0.36,
        'I': 0.40,
        'J': 0.44,
        'K': 0.48,
        'L': 0.52
    };

    let radius = streetDistances[street] || 0.3;

    // Apply exact location offset
    // "facing man" means on the outer side (add offset outward)
    // "facing mountain" means on the inner side (subtract offset inward)
    const offsetAmount = 0.015; // Small offset for facing direction

    if (exactLocation.toLowerCase().includes('facing man')) {
        radius += offsetAmount; // Outer side of the street
    } else if (exactLocation.toLowerCase().includes('facing mountain')) {
        radius -= offsetAmount; // Inner side of the street
    }

    // Center of the Man in the image
    const centerX = 0.5;
    const centerY = 0.50;

    // Calculate position using polar to cartesian conversion
    // angle = 0 at 12:00 (top), π at 6:00 (bottom)
    const x = centerX + radius * Math.sin(angle);
    const y = centerY - radius * Math.cos(angle); // Subtract because y increases downward

    // Handle corner vs mid-block
    // Corners might need slight adjustments but the intersection point is already the corner
    // Mid-block would be between intersections, but our radial already handles that

    return { x, y };
}

// Draw street overlay for debugging
function drawStreetOverlay() {
    const canvas = document.getElementById('event-canvas');
    const mapImage = document.getElementById('map-image');

    // Wait for image to load
    if (mapImage.complete) {
        drawStreets(canvas, mapImage);
    } else {
        mapImage.addEventListener('load', () => drawStreets(canvas, mapImage));
    }
}

function drawStreets(canvas, mapImage) {
    canvas.width = mapImage.offsetWidth;
    canvas.height = mapImage.offsetHeight;

    const ctx = canvas.getContext('2d');

    const centerX = canvas.width * 0.5;
    const centerY = canvas.height * 0.50;

    // Street radii
    const streets = {
        'A': 0.08, 'B': 0.12, 'C': 0.16, 'D': 0.20,
        'E': 0.24, 'F': 0.28, 'G': 0.32, 'H': 0.36,
        'I': 0.40, 'J': 0.44, 'K': 0.48, 'L': 0.52
    };

    // Draw arcs for each street from 2:00 to 10:00
    const startAngle = (2 / 12) * 2 * Math.PI; // 2:00
    const endAngle = (10 / 12) * 2 * Math.PI;   // 10:00

    ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
    ctx.lineWidth = 2;

    Object.entries(streets).forEach(([letter, radiusRatio]) => {
        const radius = radiusRatio * Math.min(canvas.width, canvas.height);

        ctx.beginPath();
        // Canvas arc goes clockwise from 3:00 position (0 radians)
        // We need to convert our clock positions
        // Our angle: 0 = 12:00, π/2 = 3:00, π = 6:00
        // Canvas: 0 = 3:00, π/2 = 6:00, π = 9:00
        // Conversion: canvas_angle = our_angle - π/2
        ctx.arc(centerX, centerY, radius, startAngle - Math.PI / 2, endAngle - Math.PI / 2);
        ctx.stroke();

        // Label the street
        const labelAngle = (6 / 12) * 2 * Math.PI; // 6:00 position
        const labelX = centerX + radius * Math.sin(labelAngle);
        const labelY = centerY - radius * Math.cos(labelAngle);

        ctx.fillStyle = 'yellow';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(letter, labelX - 8, labelY + 5);
    });

    // Draw radial lines at each hour
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
    ctx.lineWidth = 1;

    for (let hour = 2; hour <= 10; hour += 0.5) {
        const angle = (hour / 12) * 2 * Math.PI;
        const innerRadius = streets['A'] * Math.min(canvas.width, canvas.height);
        const outerRadius = streets['L'] * Math.min(canvas.width, canvas.height);

        const x1 = centerX + innerRadius * Math.sin(angle);
        const y1 = centerY - innerRadius * Math.cos(angle);
        const x2 = centerX + outerRadius * Math.sin(angle);
        const y2 = centerY - outerRadius * Math.cos(angle);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Label whole hours
        if (hour % 1 === 0) {
            const labelRadius = outerRadius * 1.05;
            const labelX = centerX + labelRadius * Math.sin(angle);
            const labelY = centerY - labelRadius * Math.cos(angle);

            ctx.fillStyle = 'magenta';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`${hour}:00`, labelX - 20, labelY + 5);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    const slider = document.getElementById('time-slider');
    const playPauseBtn = document.getElementById('play-pause');
    const speedBtn = document.getElementById('speed-control');
    const resetBtn = document.getElementById('reset');
    const closeDetailsBtn = document.getElementById('close-details');

    slider.addEventListener('input', (e) => {
        const minutes = parseInt(e.target.value);
        currentTime = new Date(startTime.getTime() + minutes * 60000);
        updateVisualization();
    });

    playPauseBtn.addEventListener('click', togglePlayback);
    speedBtn.addEventListener('click', changeSpeed);
    resetBtn.addEventListener('click', reset);
    closeDetailsBtn.addEventListener('click', closeEventDetails);
}

// Toggle playback
function togglePlayback() {
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-pause');

    if (isPlaying) {
        btn.textContent = '⏸ Pause';
        startPlayback();
    } else {
        btn.textContent = '▶ Play';
        stopPlayback();
    }
}

// Start automatic playback
function startPlayback() {
    playbackInterval = setInterval(() => {
        const slider = document.getElementById('time-slider');
        let currentValue = parseInt(slider.value);
        currentValue += playbackSpeed;

        if (currentValue >= parseInt(slider.max)) {
            currentValue = 0;
        }

        slider.value = currentValue;
        currentTime = new Date(startTime.getTime() + currentValue * 60000);
        updateVisualization();
    }, 100); // Update every 100ms
}

// Stop playback
function stopPlayback() {
    if (playbackInterval) {
        clearInterval(playbackInterval);
        playbackInterval = null;
    }
}

// Change playback speed
function changeSpeed() {
    const speeds = [1, 2, 5, 10];
    const currentIndex = speeds.indexOf(playbackSpeed);
    playbackSpeed = speeds[(currentIndex + 1) % speeds.length];

    const btn = document.getElementById('speed-control');
    btn.textContent = `Speed: ${playbackSpeed}x`;

    // Restart playback if currently playing
    if (isPlaying) {
        stopPlayback();
        startPlayback();
    }
}

// Reset to beginning
function reset() {
    stopPlayback();
    isPlaying = false;
    document.getElementById('play-pause').textContent = '▶ Play';
    document.getElementById('time-slider').value = 0;
    currentTime = new Date(startTime.getTime());
    updateVisualization();
}

// Get events happening at current time
function getActiveEvents() {
    return eventsData.filter(event => {
        return event.occurrence_set.some(occurrence => {
            const start = new Date(occurrence.start_time);
            const end = new Date(occurrence.end_time);
            return currentTime >= start && currentTime <= end;
        });
    });
}

// Update visualization
function updateVisualization() {
    updateTimeDisplay();
    renderEventMarkers();
}

// Update time display
function updateTimeDisplay() {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };

    document.getElementById('current-time').textContent =
        currentTime.toLocaleString('en-US', options);

    const activeEvents = getActiveEvents();
    document.getElementById('event-count').textContent =
        `${activeEvents.length} event${activeEvents.length !== 1 ? 's' : ''} happening now`;
}

// Render event markers on the map
function renderEventMarkers() {
    const container = document.getElementById('event-markers');
    container.innerHTML = '';

    const mapImage = document.getElementById('map-image');
    const mapWidth = mapImage.offsetWidth;
    const mapHeight = mapImage.offsetHeight;

    const activeEvents = getActiveEvents();

    activeEvents.forEach(event => {
        const coords = getEventCoordinates(event);
        if (!coords) return;

        const marker = document.createElement('div');
        marker.className = `event-marker ${event.event_type?.abbr || 'othr'}`;
        marker.style.left = `${coords.x * mapWidth}px`;
        marker.style.top = `${coords.y * mapHeight}px`;

        marker.addEventListener('click', () => showEventDetails(event));

        container.appendChild(marker);
    });
}

// Get coordinates for an event
function getEventCoordinates(event) {
    // Only show events that are hosted by a camp with a known location
    if (event.hosted_by_camp && campLocationMap[event.hosted_by_camp]) {
        return campLocationMap[event.hosted_by_camp];
    }

    // Don't show events without a valid camp location
    return null;
}

// Show event details
function showEventDetails(event) {
    const detailsPanel = document.getElementById('event-details');

    document.getElementById('detail-title').textContent = event.title;

    const typeElement = document.getElementById('detail-type');
    typeElement.textContent = event.event_type?.label || 'Event';
    typeElement.className = `detail-type ${event.event_type?.abbr || 'othr'}`;

    // Find the current occurrence
    const currentOccurrence = event.occurrence_set.find(occ => {
        const start = new Date(occ.start_time);
        const end = new Date(occ.end_time);
        return currentTime >= start && currentTime <= end;
    });

    if (currentOccurrence) {
        const start = new Date(currentOccurrence.start_time);
        const end = new Date(currentOccurrence.end_time);
        const timeOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        };
        document.getElementById('detail-time').innerHTML =
            `<strong>Time:</strong> ${start.toLocaleString('en-US', timeOptions)} - ${end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    // Location info
    let locationText = '';
    if (event.hosted_by_camp) {
        const camp = campsData.find(c => c.uid === event.hosted_by_camp);
        if (camp) {
            locationText = `<strong>Location:</strong> ${camp.name} (${camp.location_string || 'Location TBD'})`;
            document.getElementById('detail-camp').innerHTML =
                `<strong>Hosted by:</strong> ${camp.name}${camp.description ? '<br><em>' + camp.description.substring(0, 200) + '...</em>' : ''}`;
        }
    } else if (event.other_location) {
        locationText = `<strong>Location:</strong> ${event.other_location}`;
    }
    document.getElementById('detail-location').innerHTML = locationText;

    document.getElementById('detail-description').innerHTML =
        `<strong>Description:</strong><br>${event.description || 'No description available.'}`;

    detailsPanel.classList.remove('hidden');
}

// Close event details
function closeEventDetails() {
    document.getElementById('event-details').classList.add('hidden');
}

// Initialize on page load
window.addEventListener('load', init);

// Handle window resize
window.addEventListener('resize', () => {
    updateVisualization();
});
