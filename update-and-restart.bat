@echo off
REM ToteMaster Update and Restart Batch File
REM This wrapper ensures PowerShell script runs properly when double-clicked

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-and-restart.ps1"
pause
