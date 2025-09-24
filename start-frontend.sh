#!/bin/bash

# Boganto Blog Frontend Startup Script
# This script builds and starts the Next.js production server

echo "Starting Boganto Blog Frontend (Next.js)..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Installing dependencies..."
    npm install
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please ensure frontend files are properly set up."
    exit 1
fi

# Kill any existing Node servers
echo "Checking for existing Node servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Build the Next.js application
echo "Building Next.js application..."
npm run build

if [ $? -eq 0 ]; then
    echo "Build successful! Starting production server..."
    echo "Frontend will be available at: http://localhost:3000"
    echo "Make sure the backend is running on http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "-----------------------------------"
    
    # Start production server
    npm run start
else
    echo "Build failed! Starting development server instead..."
    echo "Frontend will be available at: http://localhost:5173"
    echo "Make sure the backend is running on http://localhost:8000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "-----------------------------------"
    
    # Fallback to development server
    npm run dev
fi