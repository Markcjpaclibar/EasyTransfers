"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Download, CheckCircle, ShieldAlert } from "lucide-react";
import { EasyTransferSocket } from "@/lib/websocket";

type TransferRequest = {
  senderId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  totalFiles: number;
  code: string;
};

export default function ReceivePanel() {
  const [transferRequest, setTransferRequest] = useState<TransferRequest | null>(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [transferProgress, setTransferProgress] = useState<number | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);

  const socketRef = useRef<EasyTransferSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const currentFileMetaRef = useRef<{ name: string; size: number; fileType: string } | null>(null);
  const receivedBytesRef = useRef<number>(0);

  const resetAllState = useCallback(() => {
    setTransferRequest(null);
    setPin(["", "", "", ""]);
    setErrorMsg("");
    setTransferProgress(null);
    setCurrentFileName("");
    setIsCompleted(false);
    receivedChunksRef.current = [];
    currentFileMetaRef.current = null;
    receivedBytesRef.current = 0;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const setupWebRTC = useCallback((senderId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.sendSignal(senderId, {
          type: "candidate",
          candidate: event.candidate,
        });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      channel.binaryType = "arraybuffer";

      channel.onmessage = (e) => {
        if (typeof e.data === "string") {
          const msg = JSON.parse(e.data);

          if (msg.type === "file-start") {
            currentFileMetaRef.current = { name: msg.name, size: msg.size, fileType: msg.fileType };
            setCurrentFileName(msg.name);
            receivedChunksRef.current = [];
            receivedBytesRef.current = 0;
            setTransferProgress(0);
          } else if (msg.type === "file-end") {
            const blob = new Blob(receivedChunksRef.current, {
              type: currentFileMetaRef.current?.fileType || "application/octet-stream",
            });
            triggerDownload(blob, currentFileMetaRef.current?.name || "downloaded-file");
          } else if (msg.type === "transfer-complete") {
            setIsCompleted(true);
          }
        } else if (e.data instanceof ArrayBuffer) {
          receivedChunksRef.current.push(e.data);
          receivedBytesRef.current += e.data.byteLength;

          if (currentFileMetaRef.current && currentFileMetaRef.current.size > 0) {
            const pct = Math.min(
              100,
              Math.round((receivedBytesRef.current / currentFileMetaRef.current.size) * 100)
            );
            setTransferProgress(pct);
          }
        }
      };
    };
  }, []);

  useEffect(() => {
    const socket = new EasyTransferSocket({
      onConnected: (id) => console.log("Receiver Socket Connected:", id),
      onTransferRequest: (senderId, requestData) => {
        setTransferRequest({ senderId, ...requestData });
      },
      onSignal: async (senderId, signalData: any) => {
        if (!pcRef.current) return;

        if (signalData.type === "offer") {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socketRef.current?.sendSignal(senderId, answer);
        } else if (signalData.type === "candidate") {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(signalData.candidate));
        }
      },
      onError: (err) => console.error("Receiver Socket Error:", err),
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
      // Disconnecting the socket immediately purges the mobile device from "Nearby Devices"
      socket.disconnect();
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyAndAccept = () => {
    if (!transferRequest) return;

    const enteredCode = pin.join("");
    if (enteredCode !== transferRequest.code) {
      setErrorMsg("Incorrect security code");
      return;
    }

    setErrorMsg("");
    setupWebRTC(transferRequest.senderId);
    socketRef.current?.sendTransferResponse(transferRequest.senderId, true);
    setTransferProgress(0);
  };

  const declineTransfer = () => {
    if (transferRequest) {
      socketRef.current?.sendTransferResponse(transferRequest.senderId, false);
    }
    resetAllState();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  if (isCompleted) {
    return (
      <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-16 text-center">
        <CheckCircle className="mx-auto text-[#34D399]" size={56} />
        <h2 className="mt-4 text-[24px] font-semibold text-white">Files Received!</h2>
        <p className="mt-2 text-[14px] text-[#94A3B8]">
          The file transfers are complete and downloaded to your device.
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

  if (transferProgress !== null) {
    return (
      <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-16 text-center">
        <h2 className="text-[25px] font-semibold text-white">Receiving File...</h2>
        <div className="mt-8 mx-auto max-w-[450px] rounded-[10px] bg-[#15303D] p-6 text-left">
          <p className="truncate text-sm font-semibold text-white">
            {currentFileName || "Preparing file..."}
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
      </div>
    );
  }

  if (transferRequest) {
    return (
      <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-12 text-center sm:px-12">
        <h2 className="text-[25px] font-semibold text-white">Incoming Transfer</h2>
        <p className="mt-2 text-[14px] text-[#94A3B8]">
          {transferRequest.totalFiles} file(s) · {formatFileSize(transferRequest.fileSize)}
        </p>

        <div className="mt-8">
          <p className="text-xs text-[#94A3B8]">Enter Security PIN from sender screen:</p>
          <div className="mt-4 flex justify-center gap-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                className="h-12 w-12 rounded-md bg-[#15303D] text-center text-xl font-bold text-[#34D399] border border-[#34D399]/30 focus:border-[#34D399] focus:outline-none"
              />
            ))}
          </div>
          {errorMsg && <p className="mt-3 text-xs text-[#EF4444]">{errorMsg}</p>}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={declineTransfer}
            className="rounded-[6px] border border-[#EF4444]/50 bg-[#15303D] px-6 py-2.5 text-xs text-[#EF4444] hover:bg-[#1f2430]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={verifyAndAccept}
            className="rounded-[6px] bg-[#34D399] px-6 py-2.5 text-xs font-semibold text-[#111A2E] hover:bg-[#2eb885]"
          >
            Accept & Download
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[12px] border border-[#34D399]/70 bg-[#111A2E] px-8 py-20 text-center">
      <Download size={42} className="mx-auto text-[#34D399]" />
      <h2 className="mt-6 text-[25px] font-semibold text-white">Ready to Receive</h2>
      <p className="mt-2 text-xs text-[#94A3B8]">
        Keep this tab open. Select this device on the sending phone or computer to begin.
      </p>
    </div>
  );
}