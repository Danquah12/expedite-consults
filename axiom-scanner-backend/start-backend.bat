@echo off
:: AXIOM Backend v4 — Persistent Launcher
:: Keeps the backend running; restarts if it crashes
:loop
echo [%time%] Starting AXIOM Scanner Backend v4...
node "d:\Anti-gravity\expedite-consults\axiom-scanner-backend\server.js"
echo [%time%] Backend exited — restarting in 3 seconds...
timeout /t 3 /nobreak
goto loop
