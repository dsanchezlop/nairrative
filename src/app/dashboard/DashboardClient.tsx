'use client'

import { useState } from 'react'
import GenerationForm from '@/components/GenerationForm'
import GenerationList from '@/components/GenerationList'

export default function DashboardClient() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna izquierda: formulario */}
      <div>
        <GenerationForm onGenerated={() => setRefreshKey((k) => k + 1)} />
      </div>

      {/* Columna derecha: historial */}
      <div>
        <h2 className="text-lg font-semibold text-purple-200 mb-4">Historial</h2>
        <GenerationList refreshKey={refreshKey} />
      </div>
    </div>
  )
}
