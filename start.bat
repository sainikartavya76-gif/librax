@echo off
title LibraX — Fullstack Library System
echo ====================================================
echo           LIBRAX FULLSTACK SYSTEM
echo ====================================================
echo Starting Unified Server on http://localhost:8000 ...
cd /d "%~dp0node-backend"
node src/server.js
pause
