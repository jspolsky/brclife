#!/bin/bash

# Black Rock City Life - Startup Script

echo "🔥 Starting Black Rock City Life Visualizer..."
echo ""
echo "Opening web server at http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Python HTTP server
cd "$(dirname "$0")"
python3 -m http.server 8000
