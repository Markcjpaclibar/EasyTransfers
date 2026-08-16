export type Device = {
  id: string;
  name: string;
  platform: string;
  browser: string;
};

// Extended types for WebRTC Signaling Messages
type WebSocketMessage =
  | { type: "connected"; deviceId: string }
  | { type: "registered"; device: Device }
  | { type: "devices"; devices: Device[] }
  | { type: "signal"; senderId: string; signalData: unknown }
  | { type: "transfer-request"; senderId: string; metadata: unknown }
  | { type: "transfer-response"; senderId: string; accepted: boolean }
  | { type: "pong" };

type DeviceInfo = {
  name: string;
  platform: string;
  browser: string;
};

type EasyTransferSocketOptions = {
  onConnected?: (deviceId: string) => void;
  onRegistered?: (device: Device) => void;
  onDevicesUpdated?: (devices: Device[]) => void;
  onSignal?: (senderId: string, signalData: unknown) => void;
  onTransferRequest?: (senderId: string, metadata: unknown) => void;
  onTransferResponse?: (senderId: string, accepted: boolean) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  url?: string;
};

export class EasyTransferSocket {
  private socket: WebSocket | null = null;
  private options: EasyTransferSocketOptions;
  private messageQueue: string[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isManuallyClosed = false;

  constructor(options: EasyTransferSocketOptions = {}) {
    this.options = options;
  }

  connect() {
    if (typeof window === "undefined") return;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.isManuallyClosed = false;

    // Resolve URL with fallback dynamically
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host =
      window.location.hostname === "0.0.0.0"
        ? "localhost"
        : window.location.hostname || "localhost";
    const port = process.env.NEXT_PUBLIC_WS_PORT || "3001";
    const defaultUrl = `${protocol}//${host}:${port}`;

    const serverUrl =
      this.options.url || process.env.NEXT_PUBLIC_WS_URL || defaultUrl;

    console.log("[EasyTransfer] Connecting to WebSocket server:", serverUrl);

    try {
      this.socket = new WebSocket(serverUrl);
    } catch (err) {
      console.error(
        "[EasyTransfer] Failed to construct WebSocket instance:",
        err
      );
      return;
    }

    this.socket.onopen = () => {
      console.log("[EasyTransfer] Connected to signaling server");

      // Register device details
      const deviceInfo: DeviceInfo = {
        name: navigator.userAgent.includes("Mobile")
          ? "Mobile Device"
          : "Desktop PC",
        platform: navigator.platform || "Unknown OS",
        browser: this.detectBrowser(),
      };

      this.register(deviceInfo);

      // Flush queued messages if any exist
      while (this.messageQueue.length > 0) {
        const queuedPayload = this.messageQueue.shift();
        if (queuedPayload && this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(queuedPayload);
        }
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case "connected":
            this.options.onConnected?.(message.deviceId);
            break;

          case "registered":
            this.options.onRegistered?.(message.device);
            break;

          case "devices":
            this.options.onDevicesUpdated?.(message.devices);
            break;

          case "signal":
            this.options.onSignal?.(message.senderId, message.signalData);
            break;

          case "transfer-request":
            this.options.onTransferRequest?.(
              message.senderId,
              message.metadata
            );
            break;

          case "transfer-response":
            this.options.onTransferResponse?.(
              message.senderId,
              message.accepted
            );
            break;

          case "pong":
            break;

          default:
            console.warn(
              "[EasyTransfer] Unknown WebSocket message type:",
              message
            );
        }
      } catch (error) {
        console.error(
          "[EasyTransfer] Error parsing inbound WebSocket message:",
          error
        );
      }
    };

    this.socket.onerror = (error) => {
      console.error("[EasyTransfer] WebSocket connection error target:", {
        url: serverUrl,
        readyState: this.socket?.readyState,
      });
      this.options.onError?.(error);
    };

    this.socket.onclose = (event) => {
      console.log(
        `[EasyTransfer] Connection closed (Code: ${event.code}, Clean: ${event.wasClean})`
      );
      this.options.onClose?.();
      this.socket = null;

      // Attempt automatic reconnection if disconnected unexpectedly
      if (!this.isManuallyClosed) {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          console.log("[EasyTransfer] Attempting reconnect...");
          this.connect();
        }, 3000);
      }
    };
  }

  // Device Registration
  register(device: DeviceInfo) {
    this.sendPayload({
      type: "register",
      device,
    });
  }

  // Send WebRTC Signaling Data (Offer, Answer, ICE Candidates)
  sendSignal(targetDeviceId: string, signalData: unknown) {
    this.sendPayload({
      type: "signal",
      targetDeviceId,
      signalData,
    });
  }

  // Initiate Transfer Request to Target Receiver
  sendTransferRequest(targetDeviceId: string, metadata: unknown) {
    this.sendPayload({
      type: "transfer-request",
      targetDeviceId,
      metadata,
    });
  }

  // Respond to incoming Transfer Request (Accept / Reject)
  sendTransferResponse(targetDeviceId: string, accepted: boolean) {
    this.sendPayload({
      type: "transfer-response",
      targetDeviceId,
      accepted,
    });
  }

  ping() {
    this.sendPayload({ type: "ping" });
  }

  disconnect() {
    this.isManuallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  }

  // Helper method to format and reliably transmit WebSocket payloads
  private sendPayload(data: unknown) {
    const payloadStr = JSON.stringify(data);

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(payloadStr);
    } else {
      console.warn(
        "[EasyTransfer] Socket not OPEN. Queueing message payload."
      );
      this.messageQueue.push(payloadStr);
    }
  }

  // Helper to detect current browser
  private detectBrowser(): string {
    if (typeof navigator === "undefined") return "Unknown";
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Edg")) return "Edge";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Safari";
    return "Unknown Browser";
  }
}