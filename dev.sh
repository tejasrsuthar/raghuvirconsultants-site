#!/bin/bash
# Raghuvir Consultants — Local Dev Startup
# Starts: backend (8000), frontend (5173), admin-dashboard (5174), node proxy (80)

WORKSPACE="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Starting Raghuvir Consultants local dev..."

# ── Kill anything holding required ports ──────────────────────────────────────
kill_port() {
  local PORT=$1
  local PIDS=$(sudo lsof -ti TCP:"$PORT" 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo "   ⚠️  Clearing port $PORT (pid: $PIDS)"
    echo "$PIDS" | xargs sudo kill -9 2>/dev/null || true
  fi
}

echo "🔧 Clearing ports 80, 5173, 5174, 8000..."
kill_port 80
kill_port 5173
kill_port 5174
kill_port 8000
sleep 1

# ── Start Node.js reverse proxy on port 80 ───────────────────────────────────
echo "📡 Starting reverse proxy on port 80..."
cd "$WORKSPACE"
sudo node proxy.mjs &
PROXY_PID=$!
sleep 0.5

# ── Start backend ─────────────────────────────────────────────────────────────
echo "⚙️  Starting backend API on port 8000..."
cd "$WORKSPACE/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# ── Start frontend ────────────────────────────────────────────────────────────
echo "🌐 Starting frontend on port 5173..."
cd "$WORKSPACE/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Main Site & Admin:  http://raghuvircons.local"
echo "  Admin Login Path:   http://raghuvircons.local/login"
echo "  API:                http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Press Ctrl+C to stop all services"
echo ""

# ── Cleanup on exit ───────────────────────────────────────────────────────────
cleanup() {
  echo "🛑 Stopping all services..."
  sudo kill $PROXY_PID 2>/dev/null
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Done."
}
trap cleanup EXIT INT TERM

wait
