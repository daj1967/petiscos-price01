import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { RecipeEditor } from '@/components/recipe-editor'
import { getCalculation, type CalculationRecord } from '@/services/calculations'
import { useAuth } from '@/hooks/use-auth'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [record, setRecord] = useState<CalculationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const isCreate = id === 'new'

  useEffect(() => {
    if (isCreate || !user || !id) {
      setLoading(false)
      return
    }
    getCalculation(id)
      .then((data) => setRecord(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, isCreate, user])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notFound) {
    return <Navigate to="/recipes" replace />
  }

  return <RecipeEditor record={isCreate ? null : record} />
}
