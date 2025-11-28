@echo off
REM ToteMaster Restart Batch File
REM This wrapper ensures PowerShell script runs properly when double-clicked

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0restart.ps1"
pause
