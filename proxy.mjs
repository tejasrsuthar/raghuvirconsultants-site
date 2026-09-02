#!/usr/bin/env node
/**
 * Local Dev Reverse Proxy — Raghuvir Consultants
 * Routes http://raghuvircons.local       → http://127.0.0.1:5173 (frontend)
 * Routes http://app.raghuvircons.local   → http://127.0.0.1:5174 (admin-dashboard)
 *
 * Uses only Node.js built-ins (no extra dependencies).
 * Run with: node proxy.mjs  (no sudo needed if port 80 requires it use port 8080)
 * Or:       sudo node proxy.mjs   (for port 80)
 */

import http from 'http';
import net from 'net';

const ROUTES = {
  'raghuvircons.local':      { target: '127.0.0.1', port: 5173 },
};

const PROXY_PORT = 80;

function getRoute(req) {
  // If it's an API request, we could route to backend, but usually Vite proxies that.
  // We'll just route all subdomains to 5173 for local dev since frontend is unified.
  return { target: '127.0.0.1', port: 5173 };
}

// HTTP proxy (including Vite HMR upgrade)
const server = http.createServer((req, res) => {
  const route = getRoute(req);
  if (!route) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`No route for host: ${req.headers.host}`);
    return;
  }

  const options = {
    hostname: route.target,
    port: route.port,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: req.headers.host },
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end(`Proxy error: ${err.message}`);
  });

  req.pipe(proxy, { end: true });
});

// WebSocket upgrade (Vite HMR)
server.on('upgrade', (req, socket, head) => {
  const route = getRoute(req);
  if (!route) { socket.destroy(); return; }

  const upstream = net.connect(route.port, route.target, () => {
    upstream.write(
      `GET ${req.url} HTTP/1.1\r\nHost: ${req.headers.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n` +
      Object.entries(req.headers)
        .filter(([k]) => !['host','upgrade','connection'].includes(k.toLowerCase()))
        .map(([k,v]) => `${k}: ${v}`)
        .join('\r\n') + '\r\n\r\n'
    );
    upstream.pipe(socket, { end: true });
    socket.pipe(upstream, { end: true });
  });

  upstream.on('error', () => socket.destroy());
  socket.on('error', () => upstream.destroy());
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`\n🔀 Dev Proxy listening on port ${PROXY_PORT}`);
  console.log(`   raghuvircons.local      → localhost:5173 (frontend)`);
  console.log(`   app.raghuvircons.local  → localhost:5174 (admin-dashboard)\n`);
});

server.on('error', (err) => {
  if (err.code === 'EACCES') {
    console.error(`\n❌ Port ${PROXY_PORT} requires sudo. Run: sudo node proxy.mjs\n`);
  } else if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PROXY_PORT} already in use. Kill it first.\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
