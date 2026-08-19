// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer, WebSocket } = require("ws");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory store for active peers: clientId -> { ws, deviceInfo }
const clients = new Map();

// Helper function to broadcast active peer list to all connected clients
function broadcastPeerList() {
  const activePeers = Array.from(clients.entries()).map(([id, client]) => ({
    id,
    ...client.deviceInfo,
  }));

  const payload = JSON.stringify({
    type: "peers-updated",
    peers: activePeers,
  });

  for (const [id, client] of clients.entries()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    // Generate a unique ID for this client connection
    const clientId = Math.random().toString(36).substring(2, 9);

    // Register empty client entry
    clients.set(clientId, { ws, deviceInfo: {} });

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);

        // Handle device registration
        if (data.type === "register-peer") {
          clients.set(clientId, {
            ws,
            deviceInfo: data.deviceInfo || {},
          });
          broadcastPeerList();
        }

        // Relay signaling messages (offers, answers, ICE candidates)
        if (data.targetId && clients.has(data.targetId)) {
          const targetClient = clients.get(data.targetId);
          if (targetClient.ws.readyState === WebSocket.OPEN) {
            targetClient.ws.send(
              JSON.stringify({
                ...data,
                senderId: clientId,
              })
            );
          }
        }
      } catch (err) {
        console.error("Failed to parse incoming WebSocket message:", err);
      }
    });

    // CRITICAL: Cleanup client on disconnect or tab close
    ws.on("close", () => {
      clients.delete(clientId); // Remove client ID from map
      broadcastPeerList(); // Notify remaining devices to clear stale entry
    });

    ws.on("error", () => {
      clients.delete(clientId);
      broadcastPeerList();
    });
  });

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = parse(request.url);
    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000 (UI + WebSockets)");
  });
});