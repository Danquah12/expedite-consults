@echo off
title Stop All Expedite Dev Servers
echo Stopping all node.js and next.js processes...
taskkill /F /IM node.exe /T
echo Done!
pause
