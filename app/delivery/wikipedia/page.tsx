'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function WikipediaPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/delivery')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-foreground">Wikipedia</span>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <Card className="p-8 bg-card border-border text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            En construcción
          </h3>
          <p className="text-sm text-muted-foreground">
            Aquí podrás consultar Wikipedia mientras esperas.
          </p>
        </Card>
      </main>
    </div>
  )
}