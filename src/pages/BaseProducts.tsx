import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Search, Boxes } from 'lucide-react'
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
import { getBaseProducts, deleteBaseProduct, getBaseProductItems } from '@/services/base-products'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { calculateBaseProductCost, type BaseProductItemCalc } from '@/lib/base-product-engine'
import { BaseProductEditor } from '@/components/base-products/base-product-editor'
import { ConfirmDeleteDialog } from '@/components/settings/confirm-delete-dialog'
import type { BaseProduct, BaseProductItem } from '@/types/system'

export default function BaseProducts() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<BaseProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BaseProduct | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [costs, setCosts] = useState<Record<string, number>>({})

  const loadData = useCallback(async () => {
    try {
      const data = await getBaseProducts()
      setItems(data)
      const costMap: Record<string, number> = {}
      for (const bp of data) {
        try {
          const bpItems = await getBaseProductItems(bp.id)
          const calcItems: BaseProductItemCalc[] = bpItems.map((item: BaseProductItem) => {
            const ing = item.expand?.ingredient_id
            const unitCost = ing?.cost || 0
            return {
              ingredientId: item.ingredient_id,
              name: ing?.name || '—',
              unit: item.unit,
              unitCost,
              quantity: item.quantity,
              subtotal: unitCost * item.quantity,
            }
          })
          const result = calculateBaseProductCost(
            calcItems,
            bp.yield_weight || 0,
            bp.loss_percentage || 0,
          )
          costMap[bp.id] = result.costPerKg
        } catch {
          costMap[bp.id] = 0
        }
      }
      setCosts(costMap)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('base_products', () => loadData())
  useRealtime('base_product_items', () => loadData())
  useRealtime('ingredients', () => loadData())

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase().trim()))
    : items

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteBaseProduct(deleteId)
      toast({ title: 'Produto base excluído!' })
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Boxes className="h-6 w-6 text-primary" />
          Produtos Base
        </h2>
        <p className="text-muted-foreground">Receitas base com cálculo de custo de produção.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge variant="secondary">{items.length} produtos</Badge>
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
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Produto Base
            </Button>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Boxes className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {search ? 'Nenhum produto encontrado.' : 'Nenhum produto base cadastrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Rend. (kg)</TableHead>
                    <TableHead className="text-right">Perda (%)</TableHead>
                    <TableHead className="text-right">Custo/kg</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((bp) => (
                    <TableRow key={bp.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{bp.code || '—'}</TableCell>
                      <TableCell className="font-medium">{bp.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {bp.category || '—'}
                      </TableCell>
                      <TableCell className="text-right">{bp.yield_weight || 0}</TableCell>
                      <TableCell className="text-right">{bp.loss_percentage || 0}%</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(costs[bp.id] || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditing(bp)
                            setDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(bp.id)}
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
      </Card>
      <BaseProductEditor
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={loadData}
      />
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Produto Base"
        description="Tem certeza? Esta ação não pode ser desfeita."
      />
    </div>
  )
}
