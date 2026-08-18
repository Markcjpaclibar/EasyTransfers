"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  MonitorSmartphone,
  WifiOff,
  RefreshCw,
  Upload,
  File as FileIcon,
  FolderOpen,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { EasyTransferSocket } from "@/lib/websocket";

type Device = {
  id: string;
  name: string;
  platform: string;
  browser: string;
};

const CHUNK_SIZE = 64 * 1024; // 64KB optimal chunk size
const MAX_BUFFERED_AMOUNT = 8 * 1024 * 1024; // 8MB backpressure limit

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  {
    urls: "turn:openrelay.metered.ca:443",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

export default function SendPanel() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [transferProgress, setTransferProgress] = useState<number | null>(null);
  const [currentSendingFile, setCurrentSendingFile] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showDeclinedModal, setShowDeclinedModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const socketRef = useRef<EasyTransferSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const filesRef = useRef<File[]>([]);
  const connectedDeviceRef = useRef<Device | null>(null);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    connectedDeviceRef.current = connectedDevice;
  }, [connectedDevice]);

  const resetAllState = useCallback(() => {
    setVerificationCode(null);
    setTransferProgress(null);
    setConnectedDevice(null);
    setFiles([]);
    setIsCompleted(false);
    setCurrentSendingFile("");
    setShowDeclinedModal(false);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    dataChannelRef.current = null;
  }, []);

  const sendFileWithBackpressure = useCallback(
    async (file: File, channel: RTCDataChannel) => {
      setCurrentSendingFile(file.name);

      channel.send(
        JSON.stringify({
          type: "file-start",
          name: file.name,
          size: file.size,
          fileType: file.type,
        })
      );

      const arrayBuffer = await file.arrayBuffer();
      let offset = 0;

      while (offset < arrayBuffer.byteLength) {
        while (channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
        channel.send(chunk);
        offset += chunk.byteLength;

        const progress = Math.min(
          100,
          Math.round((offset / arrayBuffer.byteLength) * 100)
        );
        setTransferProgress(progress);
      }

      channel.send(JSON.stringify({ type: "file-end", name: file.name }));
    },
    []
  );

  const startFileTransfer = useCallback(
    async (channel: RTCDataChannel) => {
      const currentFiles = filesRef.current;
      if (currentFiles.length === 0) return;

      for (const file of currentFiles) {
        await sendFileWithBackpressure(file, channel);
      }

      channel.send(JSON.stringify({ type: "transfer-complete" }));
      setIsCompleted(true);
    },
    [sendFileWithBackpressure]
  );

  const initializeWebRTC = useCallback(
    async (targetDeviceId: string) => {
      if (pcRef.current) {
        pcRef.current.close();
      }

      console.log("[SENDER] Creating Peer Connection...");
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        console.log("[SENDER WebRTC State]:", pc.iceConnectionState);
      };

      const dataChannel = pc.createDataChannel("fileTransfer", { ordered: true });
      dataChannel.binaryType = "arraybuffer";
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log("[SENDER] Data Channel Open. Sending files...");
        startFileTransfer(dataChannel);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.sendSignal(targetDeviceId, {
            type: "candidate",
            candidate: event.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.sendSignal(targetDeviceId, offer);
    },
    [startFileTransfer]
  );

  useEffect(() => {
    const socket = new EasyTransferSocket({
      onConnected: (id) => console.log("Sender Socket Connected:", id),
      onDevicesUpdated: (updatedDevices: Device[]) => {
        setDevices(updatedDevices);
        if (
          connectedDeviceRef.current &&
          !updatedDevices.some((d) => d.id === connectedDeviceRef.current?.id)
        ) {
          resetAllState();
        }
      },
      onTransferResponse: (senderId, accepted) => {
        const activeDevice = connectedDeviceRef.current;
        if (accepted && activeDevice) {
          initializeWebRTC(activeDevice.id);
        } else {
          if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
          }
          dataChannelRef.current = null;
          setVerificationCode(null);
          setTransferProgress(null);
          setShowDeclinedModal(true);
        }
      },
      onSignal: async (senderId, signalData: any) => {
        if (!pcRef.current) return;

        try {
          if (signalData.type === "answer") {
            await pcRef.current.setRemoteDescription(
              new RTCSessionDescription(signalData)
            );
          } else if (signalData.type === "candidate" || signalData.candidate) {
            const cand = signalData.candidate || signalData;
            await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch (err) {
          console.error("Signaling error:", err);
        }
      },
      onError: (err) => console.error("Signaling socket error:", err),
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
      if (pcRef.current) pcRef.current.close();
    };
  }, [initializeWebRTC, resetAllState]);

  const generateVerificationCode = () => {
    if (!connectedDevice || files.length === 0) return;

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setTransferProgress(0);

    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

    socketRef.current?.sendTransferRequest(connectedDevice.id, {
      fileName: files[0].name,
      fileSize: totalBytes,
      fileType: files[0].type,
      totalFiles: files.length,
      code: code,
    });
  };

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles = Array.from(selectedFiles);

    setFiles((currentFiles) => {
      const existingKeys = new Set(
        currentFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );
      const uniqueFiles = newFiles.filter(
        (file) => !existingKeys.has(`${file.name}-${file.size}-${file.lastModified}`)
      );
      return [...currentFiles, ...uniqueFiles];
    });
  };

  const removeFile = (index: number) => {
    setFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  if (showDeclinedModal) {
    return (
      <div className="w-full rounded-[12px] border border-[#EF4444]/70 bg-[#111A2E] px-8 py-16 text-center">
        <XCircle className="mx-auto text-[#EF4444]" size={56} />
        <h2 className="mt-4 text-[24px] font-semibold text-white">Transfer Declined</h2>
        <p className="mt-2 text-[14px] text-[#94A3B8]">
          The transfer request was declined by the receiver.
        </p>
        <button
          type="button"
          onClick={resetAllState}
          className="mt-8 rounded-[6px] bg-[#EF4444] px-8 py-3 text-[14px] font-semibold text-white hover:bg-[#dc2626]"
        >
          OK
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-16 text-center">
        <CheckCircle className="mx-auto text-[#34D399]" size={56} />
        <h2 className="mt-4 text-[24px] font-semibold text-white">Transfer Completed!</h2>
        <p className="mt-2 text-[14px] text-[#94A3B8]">
          All files have been successfully sent to {connectedDevice?.name}.
        </p>
        <button
          type="button"
          onClick={resetAllState}
          className="mt-8 rounded-[6px] bg-[#34D399] px-8 py-3 text-[14px] font-semibold text-[#111A2E] hover:bg-[#2eb885]"
        >
          Done
        </button>
      </div>
    );
  }

  if (verificationCode) {
    return (
      <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-16 text-center">
        <h2 className="text-[25px] font-semibold text-white">
          {transferProgress !== null && transferProgress > 0
            ? "Sending Files..."
            : "Waiting for Verification"}
        </h2>

        {transferProgress === 0 && (
          <div className="mt-8">
            <p className="text-[16px] font-semibold text-[#94A3B8]">Security Code</p>
            <p className="mt-4 text-[32px] font-bold tracking-[0.35em] text-[#34D399]">
              {verificationCode}
            </p>
            <p className="mt-4 text-[14px] text-[#94A3B8]">
              Enter this code on {connectedDevice?.name} to authorize transfer
            </p>
          </div>
        )}

        {transferProgress !== null && (
          <div className="mx-auto mt-8 max-w-[450px] rounded-[10px] bg-[#15303D] p-6 text-left">
            <p className="truncate text-sm font-semibold text-white">
              {currentSendingFile || "Preparing transfer..."}
            </p>
            <div className="mt-3 flex justify-between text-xs text-[#94A3B8]">
              <span>Progress</span>
              <span className="font-bold text-[#34D399]">{transferProgress}%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#111A2E]">
              <div
                className="h-full bg-[#34D399] transition-all duration-150"
                style={{ width: `${transferProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={resetAllState}
          className="mt-10 rounded-[6px] border border-[#34D399]/70 bg-[#15303D] px-7 py-3 text-[14px] font-semibold text-white hover:bg-[#19404A]"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (connectedDevice) {
    return (
      <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-10 sm:px-12 sm:py-12">
        <div className="text-center">
          <h2 className="text-[25px] font-semibold text-white">Connected</h2>
          <div className="mt-2">
            <p className="text-[15px] font-semibold text-white">{connectedDevice.name}</p>
            <p className="text-[11px] text-[#64748B]">
              {connectedDevice.platform} · {connectedDevice.browser}
            </p>
          </div>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="mx-auto mt-8 flex min-h-[195px] max-w-[720px] flex-col items-center justify-center rounded-[11px] bg-[#15303D] px-6 py-8"
        >
          <Upload size={24} className="text-[#34D399]" />
          <h3 className="mt-4 text-[15px] font-semibold text-white">Drag & Drop Files Here</h3>
          <div className="mt-6 flex items-center gap-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs text-white hover:text-[#34D399]"
            >
              <FileIcon size={15} /> Select Files
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-2 text-xs text-white hover:text-[#34D399]"
            >
              <FolderOpen size={15} /> Select Folder
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            multiple
            className="hidden"
            {...({
              webkitdirectory: "",
              directory: "",
            } as React.InputHTMLAttributes<HTMLInputElement>)}
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {files.length > 0 && (
          <div className="mx-auto mt-9 max-w-[720px]">
            <h3 className="text-[15px] font-semibold text-white">
              Selected Files ({files.length})
            </h3>
            <div className="mt-3 rounded-[11px] bg-[#15303D] px-6 py-5">
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center gap-3 rounded-[10px] bg-[#19404A] px-4 py-3"
                  >
                    <FileIcon size={18} className="text-[#34D399]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{file.name}</p>
                      <p className="text-[10px] text-[#64748B]">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-[#EF4444]/70 hover:text-[#EF4444]"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 rounded-[5px] bg-[#194C52] py-2.5 text-xs text-white hover:bg-[#206069]"
                >
                  Add More
                </button>
                <button
                  type="button"
                  onClick={generateVerificationCode}
                  className="flex-1 rounded-[5px] bg-[#34D399] py-2.5 text-xs font-semibold text-[#111A2E] hover:bg-[#2eb885]"
                >
                  Send Files
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-16 text-center">
      <h2 className="text-[29px] font-semibold text-white">Nearby Devices</h2>
      {devices.length > 0 ? (
        <div className="mx-auto mt-7 max-w-[800px] space-y-4">
          {devices.map((device) => (
            <button
              key={device.id}
              type="button"
              onClick={() => setConnectedDevice(device)}
              className="flex w-full items-center gap-5 rounded-[13px] bg-[#15303D] px-8 py-6 text-left hover:border-[#34D399]/40 hover:bg-[#173844]"
            >
              <MonitorSmartphone size={37} className="text-[#34D399]" />
              <div>
                <p className="text-[15px] font-semibold text-white">{device.name}</p>
                <p className="text-[11px] text-[#64748B]">
                  {device.platform} · {device.browser}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-10 flex max-w-[520px] flex-col items-center">
          <WifiOff size={36} className="text-[#34D399]" />
          <h3 className="mt-6 text-[20px] font-semibold text-white">No Devices Found</h3>
          <p className="mt-3 text-xs text-[#94A3B8]">
            Ensure both devices are active on the same local network.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 1000);
            }}
            disabled={isRefreshing}
            className="mt-7 flex items-center gap-2 rounded-lg border border-[#34D399]/30 bg-[#34D399]/10 px-5 py-3 text-xs font-medium text-[#34D399]"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Searching..." : "Refresh Devices"}
          </button>
        </div>
      )}
    </div>
  );
}