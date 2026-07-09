import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getProductionAssets,
  createProductionAsset,
  updateProductionAsset,
  deleteProductionAsset,
} from '@/services/production-assets'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import type { ProductionAsset } from '@/types/system'

export function ProductionAssetsManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<ProductionAsset[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductionAsset | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    power_kw: 0,
    consumption_per_hour: 0,
    cost_per_hour: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      setItems(await getProductionAssets())
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('production_assets', () => loadData())

  const openDialog = (item?: ProductionAsset) => {
    setErrors({})
    setEditing(item || null)
    setForm(
      item
        ? {
            name: item.name,
            power_kw: item.power_kw || 0,
            consumption_per_hour: item.consumption_per_hour || 0,
            cost_per_hour: item.cost_per_hour || 0,
          }
        : { name: '', power_kw: 0, consumption_per_hour: 0, cost_per_hour: 0 },
    )
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.name.trim()) {
      setErrors({ name: 'Nome é obrigatório' })
      return
    }
    try {
      if (editing) {
        await updateProductionAsset(editing.id, form)
        toast({ title: 'Ativo atualizado!' })
      } else {
        await createProductionAsset({ ...form, user_id: user.id })
        toast({ title: 'Ativo criado!' })
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
      await deleteProductionAsset(deleteId)
      toast({ title: 'Ativo excluído!' })
      setDeleteId(null)
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Equipamentos e custos de produção.</p>
        <Button size="sm" onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="text-right">Potência (kW)</TableHead>
            <TableHead className="text-right">Consumo/h</TableHead>
            <TableHead className="text-right">Custo/h</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.name}</TableCell>
              <TableCell className="text-right">{a.power_kw || 0}</TableCell>
              <TableCell className="text-right">{a.consumption_per_hour || 0}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(a.cost_per_hour || 0)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openDialog(a)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteId(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} Ativo de Produção</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Forno Industrial"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Potência (kW)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.power_kw}
                  onChange={(e) => setForm({ ...form, power_kw: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Consumo/h</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.consumption_per_hour}
                  onChange={(e) =>
                    setForm({ ...form, consumption_per_hour: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Custo/h (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost_per_hour}
                  onChange={(e) =>
                    setForm({ ...form, cost_per_hour: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editing ? 'Atualizar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Ativo"
        description="Tem certeza?"
      />
    </div>
  )
}
