@echo off
title MPLADS AI Surveillance Portal - Quick Launcher
echo ============================================================
echo   MPLADS AI Surveillance & Citizen Photo Proof Portal
echo   District Administration Ghaziabad, Uttar Pradesh
echo ============================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please download and install Python from: https://python.org/
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists, otherwise run npm install
if not exist "node_modules\" (
    echo [INFO] Installing required Node dependencies... Please wait a moment.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Starting Integrated Full-Stack Services:
echo        - FastAPI Backend API  : http://localhost:8000
echo        - Vite React Frontend  : http://localhost:5173
echo.
echo [INFO] Opening application in your default web browser...
echo.

REM Launch browser in background after 3 seconds
start "" http://localhost:5173

REM Start both Backend and Frontend concurrently
call npm run dev

pause
