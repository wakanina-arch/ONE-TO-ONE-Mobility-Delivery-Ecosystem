'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { X } from 'lucide-react'

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onClose: () => void
}

export function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    )

    scanner.render(
      (decodedText) => {
        scanner.clear()
        onScanSuccess(decodedText)
      },
      () => {
        // Error de escaneo (normal mientras busca)
      }
    )

    scannerRef.current = scanner

    return () => {
      scanner.clear().catch((e) => console.error('Error limpiando escáner:', e))
    }
  }, [onScanSuccess])

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#101112] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-white">Escanear QR</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="mb-3 text-xs text-white/60">
          Apunta la cámara al código QR del comercio para reclamar el pedido.
        </p>

        <div id="qr-reader" className="overflow-hidden rounded-xl bg-black" />

        {error && (
          <p className="mt-2 text-center text-xs text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}