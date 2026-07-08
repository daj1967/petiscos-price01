import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, Loader2, Search, Package, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ConfirmDeleteDialog } from '@/components/settings/confirm-delete-dialog'
import { TechnicalSheetDialog } from '@/components/settings/technical-sheet-dialog'

export default function Recipes() {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [records, setRecords] = useState<CalculationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewRecord, setViewRecord] = useState<CalculationRecord | null>(null)
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      setRecords(await getCalculations(user.id))
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

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    return records.filter((r) => r.product_name.toLowerCase().includes(search.toLowerCase().trim()))
  }, [records, search])

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
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          Fichas Técnicas
        </h2>
        <p className="text-muted-foreground">Gerencie suas fichas técnicas e precificação.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge variant="secondary">{records.length} fichas</Badge>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <Button onClick={() => navigate('/recipe/new')}>
              <Plus className="mr-2 h-4 w-4" /> Nova Ficha Técnica
            </Button>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {search ? 'Nenhuma ficha encontrada.' : 'Nenhuma ficha técnica cadastrada.'}
              </p>
              {!search && (
                <Button variant="outline" className="mt-3" onClick={() => navigate('/recipe/new')}>
                  <Plus className="mr-2 h-4 w-4" /> Criar primeira ficha
                </Button>
              )}
            </div>
          ) : (
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
                  {filtered.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDate(r.created)}
                      </TableCell>
                      <TableCell className="font-medium">{r.product_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(r.total_cost)}</TableCell>
                      <TableCell className="text-right">{r.markup.toFixed(1)}%</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(r.final_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewRecord(r)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/recipe/${r.id}`)}
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
          )}
        </CardContent>

        <ConfirmDeleteDialog
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
          onConfirm={handleDelete}
          title="Excluir Ficha Técnica"
          description="Tem certeza que deseja excluir esta ficha técnica? Esta ação não pode ser desfeita."
        />
        <TechnicalSheetDialog
          record={viewRecord}
          open={!!viewRecord}
          onOpenChange={(v) => !v && setViewRecord(null)}
        />
      </Card>
    </div>
  )
}
