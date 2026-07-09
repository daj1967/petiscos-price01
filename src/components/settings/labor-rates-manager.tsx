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
  getLaborRates,
  createLaborRate,
  updateLaborRate,
  deleteLaborRate,
} from '@/services/labor-rates'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import type { LaborRate } from '@/types/system'

export function LaborRatesManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<LaborRate[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LaborRate | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ role: '', hourly_rate: 0, benefits_multiplier: 1 })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      setItems(await getLaborRates())
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('labor_rates', () => loadData())

  const openDialog = (item?: LaborRate) => {
    setErrors({})
    setEditing(item || null)
    setForm(
      item
        ? {
            role: item.role,
            hourly_rate: item.hourly_rate || 0,
            benefits_multiplier: item.benefits_multiplier || 1,
          }
        : { role: '', hourly_rate: 0, benefits_multiplier: 1 },
    )
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.role.trim()) {
      setErrors({ role: 'Função é obrigatória' })
      return
    }
    try {
      if (editing) {
        await updateLaborRate(editing.id, form)
        toast({ title: 'Taxa atualizada!' })
      } else {
        await createLaborRate({ ...form, user_id: user.id })
        toast({ title: 'Taxa criada!' })
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
      await deleteLaborRate(deleteId)
      toast({ title: 'Taxa excluída!' })
      setDeleteId(null)
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Custos horários por função.</p>
        <Button size="sm" onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nova
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Valor/h</TableHead>
            <TableHead className="text-right">Multiplicador</TableHead>
            <TableHead className="text-right">Custo c/ Encargos</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.role}</TableCell>
              <TableCell className="text-right">{formatCurrency(l.hourly_rate)}</TableCell>
              <TableCell className="text-right">{l.benefits_multiplier || 1}x</TableCell>
              <TableCell className="text-right font-medium text-primary">
                {formatCurrency(l.hourly_rate * (l.benefits_multiplier || 1))}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openDialog(l)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteId(l.id)}
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
            <DialogTitle>{editing ? 'Editar' : 'Nova'} Taxa de Mão de Obra</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Função *</Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Ex: Padeiro, Auxiliar..."
              />
              {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Valor/h (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourly_rate}
                  onChange={(e) =>
                    setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Multiplicador Encargos</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.benefits_multiplier}
                  onChange={(e) =>
                    setForm({ ...form, benefits_multiplier: parseFloat(e.target.value) || 1 })
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
        title="Excluir Taxa"
        description="Tem certeza?"
      />
    </div>
  )
}
