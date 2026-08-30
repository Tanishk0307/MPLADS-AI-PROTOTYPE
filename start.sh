#!/usr/bin/env bash

echo "============================================================"
echo "  MPLADS AI Surveillance & Citizen Photo Proof Portal"
echo "  District Administration Ghaziabad, Uttar Pradesh"
echo "============================================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python is not installed!"
    echo "Please install Python 3.10+ from https://python.org/"
    exit 1
fi

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing dependencies..."
    npm install
fi

echo ""
echo "[INFO] Starting Integrated Full-Stack Services:"
echo "       - FastAPI Backend API : http://localhost:8000"
echo "       - Vite React Frontend : http://localhost:5173"
echo ""

# Open browser on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open http://localhost:5173) &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    (sleep 2 && xdg-open http://localhost:5173 &> /dev/null) &
fi

npm run dev
