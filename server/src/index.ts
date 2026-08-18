import { WebSocketServer, WebSocket } from "ws";

// Read the port dynamically injected by hosting platforms (e.g., Render) or fall back to 3001 locally
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Extend standard WebSocket to track health checks
interface ExtWebSocket extends WebSocket {
  isAlive?: boolean;
}

export type Device = {
  id: string;
  name: string;
  platform: string;
  browser: string;
  socket: ExtWebSocket;
};

const devices = new Map<string, Device>();

const vegetableNames = [
  "Banana",
  "Tomato",
  "Garlic",
  "Carrot",
  "Potato",
  "Onion",
  "Broccoli",
  "Cabbage",
  "Pumpkin",
  "Pepper",
  "Radish",
];

const server = new WebSocketServer({
  host: "0.0.0.0",
  port: PORT,
});

console.log(`EasyTransfer signaling server running on port ${PORT}`);

function generateDeviceId(): string {
  return crypto.randomUUID();
}

function generateVegetableName(): string {
  const randomIndex = Math.floor(Math.random() * vegetableNames.length);
  return vegetableNames[randomIndex];
}

function getPublicDevices() {
  return Array.from(devices.values()).map((device) => ({
    id: device.id,
    name: device.name,
    platform: device.platform,
    browser: device.browser,
  }));
}

function broadcastDevices() {
  const deviceList = getPublicDevices();

  devices.forEach((device) => {
    if (device.socket.readyState === WebSocket.OPEN) {
      device.socket.send(
        JSON.stringify({
          type: "devices",
          devices: deviceList.filter(
            (otherDevice) => otherDevice.id !== device.id
          ),
        })
      );
    }
  });
}

server.on("connection", (socket: ExtWebSocket) => {
  const deviceId = generateDeviceId();
  console.log(`New device socket connected assigned temp ID: ${deviceId}`);

  // Mark connection alive initially
  socket.isAlive = true;

  // Track native WebSocket pong responses
  socket.on("pong", () => {
    socket.isAlive = true;
  });

  // Transmit assigned ID back to peer on connect
  socket.send(
    JSON.stringify({
      type: "connected",
      deviceId,
    })
  );

  socket.on("message", (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      /*
       * 1. REGISTER DEVICE
       */
      if (data.type === "register") {
        const device: Device = {
          id: deviceId,
          name: data.device?.name || generateVegetableName(),
          platform: data.device?.platform || "Unknown",
          browser: data.device?.browser || "Unknown",
          socket,
        };

        devices.set(deviceId, device);

        console.log(
          `Registered: ${device.name} [ID: ${device.id}] (${device.platform} · ${device.browser})`
        );

        socket.send(
          JSON.stringify({
            type: "registered",
            device: {
              id: device.id,
              name: device.name,
              platform: device.platform,
              browser: device.browser,
            },
          })
        );

        broadcastDevices();
      }

      /*
       * 2. WEBRTC SIGNALING RELAY (Offer / Answer / ICE Candidates)
       */
      if (data.type === "signal") {
        const targetDevice = devices.get(data.targetDeviceId);

        if (targetDevice && targetDevice.socket.readyState === WebSocket.OPEN) {
          targetDevice.socket.send(
            JSON.stringify({
              type: "signal",
              senderId: deviceId,
              signalData: data.signalData,
            })
          );
        } else {
          console.warn(`Signal delivery failed: Target ID ${data.targetDeviceId} unreachable.`);
        }
      }

      /*
       * 3. TRANSFER REQUEST RELAY
       */
      if (data.type === "transfer-request") {
        const targetDevice = devices.get(data.targetDeviceId);
        const senderDevice = devices.get(deviceId);

        if (targetDevice && targetDevice.socket.readyState === WebSocket.OPEN) {
          console.log(`Relaying transfer-request from ${deviceId} (${senderDevice?.name}) -> ${data.targetDeviceId}`);
          
          targetDevice.socket.send(
            JSON.stringify({
              type: "transfer-request",
              senderId: deviceId,
              metadata: {
                ...data.metadata,
                senderName: senderDevice?.name || "Banana",
              },
            })
          );
        } else {
          console.warn(`Transfer request failed: Target device ${data.targetDeviceId} non-existent.`);
        }
      }

      /*
       * 4. TRANSFER RESPONSE RELAY (Accept / Decline Notification)
       */
      if (data.type === "transfer-response") {
        const targetDevice = devices.get(data.targetDeviceId);

        if (targetDevice && targetDevice.socket.readyState === WebSocket.OPEN) {
          targetDevice.socket.send(
            JSON.stringify({
              type: "transfer-response",
              senderId: deviceId,
              accepted: data.accepted,
            })
          );
        }
      }

      /*
       * 5. KEEP-ALIVE PING
       */
      if (data.type === "ping") {
        socket.send(
          JSON.stringify({
            type: "pong",
          })
        );
      }
    } catch (error) {
      console.error("Failed to parse incoming WebSocket message:", error);
    }
  });

  /*
   * DISCONNECT & CLEANUP
   */
  const handleCleanup = () => {
    const device = devices.get(deviceId);
    if (device) {
      console.log(`Device disconnected: ${device.name} (${deviceId})`);
      devices.delete(deviceId);
      broadcastDevices();
    }
  };

  socket.on("close", handleCleanup);
  socket.on("error", (error) => {
    console.error(`Socket error on device ${deviceId}:`, error);
    handleCleanup();
  });
});


const interval = setInterval(() => {
  server.clients.forEach((ws: ExtWebSocket) => {
    if (ws.isAlive === false) {
      // Find associated device and clean up before terminating
      for (const [id, device] of devices.entries()) {
        if (device.socket === ws) {
          console.log(`Pruned ghost device: ${device.name} (${id})`);
          devices.delete(id);
          break;
        }
      }
      broadcastDevices();
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 3000);

server.on("close", () => {
  clearInterval(interval);
});