import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Trash2, Loader2, Save } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
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
import { getIngredients, type IngredientRecord } from '@/services/ingredients'
import {
  createBaseProduct,
  updateBaseProduct,
  getBaseProductItems,
  createBaseProductItem,
  deleteBaseProductItem,
  type BaseProductItem,
} from '@/services/base-products'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { calculateBaseProductCost, type BaseProductItemCalc } from '@/lib/base-product-engine'
import type { BaseProduct } from '@/types/system'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: BaseProduct | null
  onSaved: () => void
}

export function BaseProductEditor({ open, onOpenChange, editing, onSaved }: Props) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    category: '',
    yield_weight: 0,
    loss_percentage: 0,
    shelf_life: '',
  })
  const [items, setItems] = useState<BaseProductItemCalc[]>([])
  const [selectedId, setSelectedId] = useState('')

  const loadIngredients = useCallback(async () => {
    try {
      setIngredients(await getIngredients())
    } catch {
      /* intentionally ignored */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIngredients()
  }, [loadIngredients])

  useEffect(() => {
    if (editing) {
      setForm({
        code: editing.code || '',
        name: editing.name,
        category: editing.category || '',
        yield_weight: editing.yield_weight || 0,
        loss_percentage: editing.loss_percentage || 0,
        shelf_life: editing.shelf_life || '',
      })
      getBaseProductItems(editing.id)
        .then((data: BaseProductItem[]) => {
          setItems(
            data.map((item) => {
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
            }),
          )
        })
        .catch(() => {})
    } else {
      setForm({
        code: '',
        name: '',
        category: '',
        yield_weight: 0,
        loss_percentage: 0,
        shelf_life: '',
      })
      setItems([])
    }
  }, [editing, open])

  const cost = useMemo(
    () => calculateBaseProductCost(items, form.yield_weight, form.loss_percentage),
    [items, form.yield_weight, form.loss_percentage],
  )
  const available = ingredients.filter((i) => !items.some((r) => r.ingredientId === i.id))

  const handleAdd = () => {
    const ing = ingredients.find((i) => i.id === selectedId)
    if (!ing) return
    setItems((prev) => [
      ...prev,
      {
        ingredientId: ing.id,
        name: ing.name,
        unit: ing.unit || 'kg',
        unitCost: ing.cost,
        quantity: 1,
        subtotal: ing.cost,
      },
    ])
    setSelectedId('')
  }

  const handleQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.ingredientId === id ? { ...i, quantity: qty, subtotal: i.unitCost * qty } : i,
      ),
    )
  const handleRemove = (id: string) => setItems((prev) => prev.filter((i) => i.ingredientId !== id))

  const handleSave = async () => {
    if (!user || !form.name.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Informe o nome.' })
      return
    }
    setSaving(true)
    try {
      const bpData = { ...form, user_id: user.id }
      let bpId: string
      if (editing) {
        await updateBaseProduct(editing.id, bpData)
        bpId = editing.id
        const oldItems = await getBaseProductItems(bpId)
        for (const oi of oldItems) await deleteBaseProductItem(oi.id)
      } else {
        const created = (await createBaseProduct(bpData)) as { id: string }
        bpId = created.id
      }
      for (const item of items) {
        await createBaseProductItem({
          base_product_id: bpId,
          ingredient_id: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
          user_id: user.id,
        })
      }
      toast({ title: editing ? 'Produto base atualizado!' : 'Produto base criado!' })
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar' : 'Novo'} Produto Base</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Código</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rendimento (kg)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.yield_weight || ''}
                onChange={(e) =>
                  setForm({ ...form, yield_weight: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Perda (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.loss_percentage || ''}
                onChange={(e) =>
                  setForm({ ...form, loss_percentage: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Validade</Label>
              <Input
                value={form.shelf_life}
                onChange={(e) => setForm({ ...form, shelf_life: e.target.value })}
                placeholder="Ex: 90 dias"
              />
            </div>
          </div>
          <div className="border-t pt-3">
            <Label className="text-xs font-semibold mb-2 block">Ingredientes</Label>
            <div className="flex gap-2 mb-3">
              <Select value={selectedId || undefined} onValueChange={setSelectedId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {available.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {ing.name} — {formatCurrency(ing.cost)}/{ing.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={!selectedId}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {items.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingrediente</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-right">Qtde</TableHead>
                      <TableHead className="text-right">Sub-total</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.ingredientId}>
                        <TableCell className="font-medium text-sm">{item.name}</TableCell>
                        <TableCell className="text-right text-sm">
                          {formatCurrency(item.unitCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQty(item.ingredientId, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 h-8 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemove(item.ingredientId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold bg-muted/30">
                      <TableCell colSpan={3}>
                        CUSTO / KG (rend. líq: {cost.effectiveYield.toFixed(2)}kg)
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        {formatCurrency(cost.costPerKg)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {editing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
