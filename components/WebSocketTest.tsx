"use client";

import { useEffect, useState } from "react";
import {
  EasyTransferSocket,
  type Device,
} from "@/lib/websocket";

export default function WebSocketTest() {
  const [connected, setConnected] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const socket = new EasyTransferSocket({
      onConnected: (id) => {
        console.log("My device ID:", id);

        setDeviceId(id);
        setConnected(true);
      },

      onRegistered: (device) => {
        console.log("Registered as:", device);
      },

      onDevicesUpdated: (updatedDevices) => {
        console.log("Nearby devices:", updatedDevices);

        setDevices(updatedDevices);
      },

      onError: (error) => {
        console.error("Socket error:", error);
        setConnected(false);
      },

      onClose: () => {
        setConnected(false);
      },
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-black p-4 text-xs text-white shadow-xl">
      <p>
        WebSocket:{" "}
        <span className={connected ? "text-green-400" : "text-red-400"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </p>

      {deviceId && (
        <p className="mt-1 text-gray-400">
          ID: {deviceId.slice(0, 8)}...
        </p>
      )}

      <p className="mt-1 text-gray-400">
        Devices found: {devices.length}
      </p>
    </div>
  );
}