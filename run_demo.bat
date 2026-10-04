@echo off
title NexusMatch AI - AI Resume & Job Matching System
echo ===================================================================
echo           NexusMatch AI - AI Resume & Job Matching System
echo               Algothon '26  |  Problem ID: ALG-AI-01
echo ===================================================================
echo.

set PYTHON_CMD=python
if exist ".venv\Scripts\python.exe" (
    set PYTHON_CMD=.venv\Scripts\python.exe
)

echo Starting NexusMatch AI unified server on http://localhost:8000 ...
start "" http://localhost:8000
%PYTHON_CMD% -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

pause
