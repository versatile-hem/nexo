import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

type ScannerMode = "native" | "zxing" | "manual";

export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const zxingReaderRef = useRef<any>(null);
  const lastDetectedRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });

  const [mode, setMode] = useState<ScannerMode>("native");
  const [error, setError] = useState<string>("");
  const [continuous, setContinuous] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [lastScanned, setLastScanned] = useState("");

  const canUseCamera = useMemo(
    () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    [],
  );

  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    let active = true;

    const start = async () => {
      setError("");
      setManualBarcode("");

      if (!canUseCamera) {
        setMode("manual");
        setError("Camera not supported. Enter barcode manually");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (!active || !videoRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (supportsBarcodeDetector()) {
          setMode("native");
          startNativeDetector();
          return;
        }

        setMode("zxing");
        await startZxingDetector();
      } catch (scanError) {
        setMode("manual");
        if (scanError instanceof DOMException && scanError.name === "NotAllowedError") {
          setError("Camera permission denied. Enter barcode manually");
        } else {
          setError("Unable to access camera. Enter barcode manually");
        }
      }
    };

    start();

    return () => {
      active = false;
      stopScanner();
    };
  }, [open, canUseCamera]);

  const emitDetected = (value: string) => {
    const barcode = value.trim();
    if (!barcode) return;

    const now = Date.now();
    if (lastDetectedRef.current.value === barcode && now - lastDetectedRef.current.at < 1200) {
      return;
    }

    lastDetectedRef.current = { value: barcode, at: now };
    setLastScanned(barcode);

    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(80);
    }

    onDetected(barcode);
    if (!continuous) {
      onClose();
    }
  };

  const startNativeDetector = () => {
    const Detector = (window as Window & { BarcodeDetector?: new (config?: unknown) => { detect: (input: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
    if (!Detector || !videoRef.current) {
      setMode("manual");
      setError("Camera not supported. Enter barcode manually");
      return;
    }

    const detector = new Detector({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "itf", "qr_code"],
    });

    const loop = async () => {
      if (!videoRef.current) return;

      try {
        if (videoRef.current.readyState >= 2) {
          const detections = await detector.detect(videoRef.current);
          const value = detections[0]?.rawValue;
          if (value) {
            emitDetected(value);
          }
        }
      } catch {
        setMode("manual");
        setError("Scanner unavailable. Enter barcode manually");
        return;
      }

      rafRef.current = window.requestAnimationFrame(loop);
    };

    rafRef.current = window.requestAnimationFrame(loop);
  };

  const startZxingDetector = async () => {
    if (!videoRef.current) return;

    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      zxingReaderRef.current = reader;

      await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!result) return;
        emitDetected(result.getText());
      });
    } catch {
      setMode("manual");
      setError("Camera not supported. Enter barcode manually");
    }
  };

  const stopScanner = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (zxingReaderRef.current) {
      zxingReaderRef.current.stopContinuousDecode?.();
      zxingReaderRef.current.reset?.();
      zxingReaderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 text-white">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ScanLine size={18} />
            Barcode Scanner
          </div>
          <button
            type="button"
            className="rounded-md p-2 hover:bg-white/10"
            onClick={onClose}
            aria-label="Close scanner"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative flex-1 px-4 pb-4">
          {mode !== "manual" ? (
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/20">
              <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_33%,rgba(0,0,0,0.62)_72%)]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-72 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-nexo-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />

              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs">
                Align barcode within frame
              </p>
            </div>
          ) : (
            <div className="flex h-full flex-col justify-center rounded-2xl border border-white/20 bg-black/40 p-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                <Camera size={20} />
              </div>
              <p className="text-center text-sm text-white/85">
                {error || "Camera not supported. Enter barcode manually"}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-white/15 bg-black/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
            <span className="text-xs text-white/70">Continuous scan</span>
            <input
              type="checkbox"
              checked={continuous}
              onChange={(e) => setContinuous(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          {lastScanned ? (
            <div className="rounded-xl bg-nexo-accent/20 px-3 py-2 text-xs">
              Last scanned: <span className="font-semibold">{lastScanned}</span>
            </div>
          ) : null}

          {mode === "manual" ? (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
              <Button
                variant="secondary"
                onClick={() => emitDetected(manualBarcode)}
                disabled={!manualBarcode.trim()}
              >
                Apply
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function supportsBarcodeDetector() {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}
