import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCalculations, deleteCalculation, type CalculationRecord } from '@/services/calculations'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'

export function CalculationsManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState<CalculationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const data = await getCalculations(user.id)
      setRecords(data)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('calculations', () => {
    loadData()
  })

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteCalculation(deleteId)
      toast({ title: 'Ficha técnica excluída!' })
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    }
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <Badge variant="secondary">{records.length} fichas técnicas</Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Custo Total</TableHead>
                <TableHead className="text-right">Margem</TableHead>
                <TableHead className="text-right">Preço Final</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(r.created)}
                  </TableCell>
                  <TableCell className="font-medium">{r.product_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(r.total_cost)}</TableCell>
                  <TableCell className="text-right">{(r.markup * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(r.final_price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/calculator?edit=${r.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(r.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Ficha Técnica"
        description="Tem certeza? Esta ação não pode ser desfeita."
      />
    </Card>
  )
}
