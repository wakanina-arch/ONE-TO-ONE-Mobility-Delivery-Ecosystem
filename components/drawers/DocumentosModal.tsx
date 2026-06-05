'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, FileText, Download, Eye, Search, FolderOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Documento {
  nombre: string
  ruta: string
  tamaño?: string
}

export function DocumentosModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)

  // Lista de documentos reales de tu carpeta
  const documentos: Documento[] = [
    { nombre: 'A propósito de la Ley Rider', ruta: '/documentos/ApropósitoDeLa_ley_rider.pdf' },
    { nombre: 'BOE Real Decreto-ley 9/2021 - Ley Rider', ruta: '/documentos/BOE-Real Decreto-ley 9:2021-LeyRider.pdf' },
    { nombre: 'Libro Orígenes 2018', ruta: '/documentos/LIBRO_ORIGENES_2018.pdf' },
    { nombre: 'One To One', ruta: '/documentos/OneToOne .pdf' },
    { nombre: 'Manual de Usuario - ONE TO ONE', ruta: '/documentos/manual-usuario.pdf' },
  ]

  const documentosFiltrados = documentos.filter(doc =>
    doc.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-fade-in shadow-2xl border border-olive-500/30">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-olive-400" />
            <h2 className="text-lg font-bold text-white">Documentos ONE TO ONE</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
            />
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cargando ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Cargando documentos...
            </div>
          ) : documentosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No se encontraron documentos
            </div>
          ) : (
            documentosFiltrados.map((doc, idx) => (
              <Card key={idx} className="p-3 bg-gray-800/30 border-gray-700 hover:border-olive-500/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-8 w-8 text-olive-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{doc.nombre}</p>
                      <p className="text-xs text-gray-500 truncate max-w-md">{doc.ruta}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={doc.ruta}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-olive-400 transition-colors"
                      title="Ver PDF"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <a
                      href={doc.ruta}
                      download
                      className="p-2 text-gray-400 hover:text-olive-400 transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            📄 Documentos disponibles para consulta y descarga
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
