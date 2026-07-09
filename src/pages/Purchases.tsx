import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Pencil, Trash2, Loader2, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { useRealtime } from '@/hooks/use-realtime'
import { getPurchases, createPurchase, updatePurchase, deletePurchase } from '@/services/purchases'
import { getIngredients, type IngredientRecord } from '@/services/ingredients'
import { getSuppliers } from '@/services/suppliers'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDeleteDialog } from '@/components/settings/confirm-delete-dialog'
import type { Purchase, Supplier } from '@/types/system'

const emptyForm = { ingredient_id: '', supplier_id: '', price: 0, date: '', invoice_ref: '' }

export default function Purchases() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<Purchase[]>([])
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Purchase | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      const [purchases, ings, sups] = await Promise.all([
        getPurchases(),
        getIngredients(),
        getSuppliers(),
      ])
      setItems(purchases)
      setIngredients(ings)
      setSuppliers(sups)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('purchases', () => loadData())
  useRealtime('ingredients', () => loadData())
  useRealtime('suppliers', () => loadData())

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter((p) => {
      const ingName = p.expand?.ingredient_id?.name || ''
      const supName = p.expand?.supplier_id?.trade_name || p.expand?.supplier_id?.legal_name || ''
      return (
        ingName.toLowerCase().includes(q) ||
        supName.toLowerCase().includes(q) ||
        (p.invoice_ref || '').toLowerCase().includes(q)
      )
    })
  }, [items, search])

  const openDialog = (p?: Purchase) => {
    setErrors({})
    setEditing(p || null)
    setForm(
      p
        ? {
            ingredient_id: p.ingredient_id,
            supplier_id: p.supplier_id,
            price: p.price,
            date: p.date ? p.date.slice(0, 10) : '',
            invoice_ref: p.invoice_ref || '',
          }
        : emptyForm,
    )
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.ingredient_id) {
      setErrors({ ingredient_id: 'Selecione um insumo' })
      return
    }
    if (!form.supplier_id) {
      setErrors({ supplier_id: 'Selecione um fornecedor' })
      return
    }
    try {
      const data = { ...form, user_id: user.id }
      if (editing) {
        await updatePurchase(editing.id, data)
        toast({ title: 'Compra atualizada!' })
      } else {
        await createPurchase(data)
        toast({ title: 'Compra registrada!' })
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const fe = extractFieldErrors(err)
      setErrors(fe)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          Object.keys(fe).length > 0 ? Object.values(fe).join(' ') : getErrorMessage(err),
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deletePurchase(deleteId)
      toast({ title: 'Compra excluída!' })
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    }
  }

  const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString('pt-BR') : '—')

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
          <ShoppingCart className="h-6 w-6 text-primary" /> Compras
        </h2>
        <p className="text-muted-foreground">Histórico de compras e atualização de custos.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge variant="secondary">{items.length} registros</Badge>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar compra..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Nova Compra
            </Button>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {search ? 'Nenhuma compra encontrada.' : 'Nenhuma compra registrada.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Insumo</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead>NF</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDate(p.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {p.expand?.ingredient_id?.name || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.expand?.supplier_id?.trade_name ||
                          p.expand?.supplier_id?.legal_name ||
                          '—'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(p.price)}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-xs">
                        {p.invoice_ref || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDialog(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(p.id)}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Nova'} Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Insumo *</Label>
              <Select
                value={form.ingredient_id || undefined}
                onValueChange={(v) => setForm({ ...form, ingredient_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ingredient_id && (
                <p className="text-xs text-red-500">{errors.ingredient_id}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fornecedor *</Label>
              <Select
                value={form.supplier_id || undefined}
                onValueChange={(v) => setForm({ ...form, supplier_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.trade_name || s.legal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier_id && <p className="text-xs text-red-500">{errors.supplier_id}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Preço (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Referência NF</Label>
              <Input
                value={form.invoice_ref}
                onChange={(e) => setForm({ ...form, invoice_ref: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editing ? 'Atualizar' : 'Registrar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Compra"
        description="Tem certeza?"
      />
    </div>
  )
}
