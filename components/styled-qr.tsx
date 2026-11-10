'use client'

import { useEffect, useRef, useState } from 'react'

interface StyledQRProps {
  value: string
  size?: number
  logoUrl?: string
}

export function StyledQR({ value, size = 200, logoUrl }: StyledQRProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const container = ref.current
    if (!container) return

    let cancelled = false
    container.replaceChildren()

    void import('qr-code-styling')
      .then(({ default: QRCodeStyling }) => {
        if (cancelled || !ref.current) return

        const qr = new QRCodeStyling({
          width: size,
          height: size,
          data: value,
          image: logoUrl || undefined,
          dotsOptions: {
            type: 'rounded',
            color: '#6B7280',
          },
          cornersSquareOptions: {
            type: 'extra-rounded',
            color: '#6B7280',
          },
          backgroundOptions: {
            color: '#FFFFFF',
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: 4,
            imageSize: 0.4,
          },
        })

        qr.append(ref.current)
        setError('')
      })
      .catch((cause: unknown) => {
        console.error('No se pudo generar el código QR.', cause)
        if (!cancelled) setError('No se pudo generar el código QR.')
      })

    return () => {
      cancelled = true
      container.replaceChildren()
    }
  }, [value, size, logoUrl])

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        role="img"
        aria-label={`Código QR para ${value}`}
        className="overflow-hidden rounded-lg"
        style={{ width: size, height: size }}
      />
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  )
}