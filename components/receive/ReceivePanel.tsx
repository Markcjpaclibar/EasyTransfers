"use client";

import { useEffect, useRef, useState } from "react";
import { EasyTransferSocket, Device } from "@/lib/websocket";
import { MonitorSmartphone, CheckCircle } from "lucide-react";

type IncomingMetadata = {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  totalFiles?: number;
  senderName?: string;
  code?: string;
};

type ActiveFile = {
  name: string;
  size: number;
  type: string;
};

export default function ReceivePanel() {
  const [me, setMe] = useState<Device | null>(null);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [requestMeta, setRequestMeta] = useState<IncomingMetadata | null>(null);

  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [expectedCode, setExpectedCode] = useState<string | null>(null);
  const [pinError, setPinError] = useState(false);

  const [isTransferring, setIsTransferring] = useState(false);
  const [currentFile, setCurrentFile] = useState<ActiveFile | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const socketRef = useRef<EasyTransferSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const activeFileRef = useRef<ActiveFile | null>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef<number>(0);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const iceCandidatesQueueRef = useRef<RTCIceCandidateInit[]>([]);

  const downloadCurrentFile = () => {
    const file = activeFileRef.current;
    if (!file || receivedChunksRef.current.length === 0) return;

    const blob = new Blob(receivedChunksRef.current, {
      type: file.type || "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || "downloaded-file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    receivedChunksRef.current = [];
    receivedSizeRef.current = 0;
    activeFileRef.current = null;
  };

  useEffect(() => {
    const socket = new EasyTransferSocket({
      onConnected: (id) => console.log("Receiver Socket Connected:", id),
      onRegistered: (device) => setMe(device),
      onTransferRequest: (fromId, metadata: any) => {
        setSenderId(fromId);
        setRequestMeta({
          fileName: metadata.fileName || "File",
          fileSize: metadata.fileSize || 0,
          fileType: metadata.fileType || "application/octet-stream",
          totalFiles: metadata.totalFiles || 1,
          senderName: metadata.senderName || "Sender Device",
        });

        if (metadata.code) {
          setExpectedCode(String(metadata.code));
        }
      },
      onSignal: async (fromId, signalData: any) => {
        if (signalData.type === "offer") {
          pendingOfferRef.current = signalData;
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(signalData));
            processBufferedCandidates();
          }
        } else if (signalData.type === "candidate") {
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(signalData.candidate));
          } else {
            iceCandidatesQueueRef.current.push(signalData.candidate);
          }
        }
      },
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
      if (pcRef.current) pcRef.current.close();
    };
  }, []);

  const processBufferedCandidates = async () => {
    if (!pcRef.current) return;
    while (iceCandidatesQueueRef.current.length > 0) {
      const candidate = iceCandidatesQueueRef.current.shift();
      if (candidate) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }
  };

  const startWebRTCAndAccept = async (targetSenderId: string) => {
    socketRef.current?.sendTransferResponse(targetSenderId, true);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.sendSignal(targetSenderId, {
          type: "candidate",
          candidate: event.candidate,
        });
      }
    };

    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      receiveChannel.binaryType = "arraybuffer";

      receiveChannel.onmessage = (e) => {
        if (typeof e.data === "string") {
          try {
            const frame = JSON.parse(e.data);

            if (frame.type === "file-start") {
              const fileData = {
                name: frame.name,
                size: frame.size,
                type: frame.fileType,
              };
              activeFileRef.current = fileData;
              setCurrentFile(fileData);
              receivedChunksRef.current = [];
              receivedSizeRef.current = 0;
              setProgress(0);
            } else if (frame.type === "file-end") {
              downloadCurrentFile();
            } else if (frame.type === "transfer-complete") {
              setIsTransferring(false);
              setIsCompleted(true);
            }
          } catch (err) {
            console.error("Frame parse error:", err);
          }
          return;
        }

        const chunk = e.data as ArrayBuffer;
        receivedChunksRef.current.push(chunk);
        receivedSizeRef.current += chunk.byteLength;

        const totalSize = activeFileRef.current?.size || 1;
        const currentProgress = Math.min(
          100,
          Math.round((receivedSizeRef.current / totalSize) * 100)
        );
        setProgress(currentProgress);
      };
    };

    if (pendingOfferRef.current) {
      await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
      await processBufferedCandidates();
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.sendSignal(targetSenderId, answer);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPinError(false);

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAccept = async () => {
    const enteredPin = pin.join("");
    if (enteredPin.length < 4 || (expectedCode && enteredPin !== expectedCode)) {
      setPinError(true);
      return;
    }

    setIsTransferring(true);
    if (senderId) {
      await startWebRTCAndAccept(senderId);
    }
  };

  const handleDecline = () => {
    if (senderId) {
      socketRef.current?.sendTransferResponse(senderId, false);
    }
    resetAllState();
  };

  const resetAllState = () => {
    setRequestMeta(null);
    setSenderId(null);
    setPin(["", "", "", ""]);
    setIsTransferring(false);
    setProgress(0);
    setIsCompleted(false);
    setCurrentFile(null);

    receivedChunksRef.current = [];
    receivedSizeRef.current = 0;
    activeFileRef.current = null;
    pendingOfferRef.current = null;
    iceCandidatesQueueRef.current = [];

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, unitIndex)).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  return (
    <div className="flex w-full flex-col items-center justify-center font-sans">
      <div className="relative flex min-h-[480px] w-full max-w-[850px] flex-col items-center justify-center rounded-[16px] border border-[#00B4D8]/30 bg-[#070D1B] p-8 shadow-2xl">
        <div className="absolute top-8 flex flex-col items-center text-center">
          <span className="text-[11px] font-semibold tracking-wider text-[#4E627B] uppercase">
            YOUR DEVICE ID
          </span>
          <span className="mt-1 text-[22px] font-bold text-[#00E5FF]">
            {me?.name || "Desktop PC"}
          </span>
        </div>

        {requestMeta && !isCompleted && (
          <div className="mt-16 w-full max-w-[600px] rounded-[16px] border border-[#00B4D8]/50 bg-[#0A1628] p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center text-[#00E5FF]">
                <MonitorSmartphone size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-[22px] font-bold leading-none text-white">
                  {requestMeta.senderName || "Sender Device"}
                </h2>
                <p className="mt-1 text-[12px] text-[#8EA0B5]">Wants to send you files</p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-[12px] bg-[#112238] py-4 text-center">
                <span className="text-[11px] font-medium text-[#8EA0B5]">Total Files</span>
                <span className="mt-1 text-[20px] font-bold text-white">
                  {requestMeta.totalFiles || 1}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-[12px] bg-[#112238] py-4 text-center">
                <span className="text-[11px] font-medium text-[#8EA0B5]">Total Size</span>
                <span className="mt-1 text-[20px] font-bold text-white">
                  {formatFileSize(requestMeta.fileSize || 0)}
                </span>
              </div>
            </div>

            {!isTransferring ? (
              <div className="mt-7 text-center">
                <p className="text-[12px] text-[#8EA0B5]">
                  Enter the 4-digit PIN shown on the sender's device:
                </p>

                <div className="mx-auto mt-4 flex max-w-[460px] items-center justify-center rounded-[12px] bg-[#112238] px-6 py-3">
                  <div className="flex gap-4">
                    {pin.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          pinInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`h-10 w-10 text-center text-[20px] font-bold text-[#00E5FF] bg-[#070D1B] border rounded-[8px] focus:outline-none transition-all ${
                          pinError
                            ? "border-[#FF5252]"
                            : "border-[#00B4D8]/40 focus:border-[#00E5FF]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {pinError && (
                  <p className="mt-2 text-[11px] text-[#FF5252]">
                    Invalid Security PIN. Please check sender's screen.
                  </p>
                )}

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleDecline}
                    className="rounded-[10px] border border-[#721C24] bg-[#220B13] py-3 text-[14px] font-medium text-[#FF6B6B] transition-all hover:bg-[#34111D]"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="rounded-[10px] border border-[#00B4D8] bg-[#0E3342] py-3 text-[14px] font-medium text-[#00E5FF] transition-all hover:bg-[#124256]"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <p className="truncate text-xs font-semibold text-white">
                  {currentFile?.name || "Receiving file..."}
                </p>
                <div className="mt-3 flex justify-between text-[13px] font-medium text-[#8EA0B5]">
                  <span>Progress</span>
                  <span className="text-[#00E5FF]">{progress}%</span>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#112238]">
                  <div
                    className="h-full bg-[#00E5FF] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {isCompleted && (
          <div className="mt-16 flex w-full max-w-[420px] flex-col items-center rounded-[16px] border border-[#00B4D8]/50 bg-[#0A1628] p-8 text-center shadow-2xl">
            <CheckCircle className="text-[#00E5FF]" size={52} />
            <h2 className="mt-3 text-[20px] font-bold text-white">Transfer Complete!</h2>
            <p className="mt-1 text-[13px] text-[#8EA0B5]">
              All files have been saved to your downloads.
            </p>
            <button
              type="button"
              onClick={resetAllState}
              className="mt-6 w-full rounded-[10px] border border-[#00B4D8] bg-[#0E3342] py-2.5 text-[14px] font-medium text-[#00E5FF] hover:bg-[#124256]"
            >
              Done
            </button>
          </div>
        )}

        {!requestMeta && !isCompleted && (
          <div className="mt-20 text-center text-[13px] text-[#4E627B]">
            Waiting for incoming transfer requests on your network...
          </div>
        )}
      </div>
    </div>
  );
}