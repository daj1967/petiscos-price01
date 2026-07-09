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
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/services/units-of-measure'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import type { UnitOfMeasure } from '@/types/system'

export function UnitsManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<UnitOfMeasure[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<UnitOfMeasure | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: '', base_conversion_factor: 1 })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      setItems(await getUnits())
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('units_of_measure', () => loadData())

  const openDialog = (item?: UnitOfMeasure) => {
    setErrors({})
    setEditing(item || null)
    setForm(
      item
        ? {
            name: item.name,
            type: item.type || '',
            base_conversion_factor: item.base_conversion_factor || 1,
          }
        : { name: '', type: '', base_conversion_factor: 1 },
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
        await updateUnit(editing.id, form)
        toast({ title: 'Unidade atualizada!' })
      } else {
        await createUnit({ ...form, user_id: user.id })
        toast({ title: 'Unidade criada!' })
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
      await deleteUnit(deleteId)
      toast({ title: 'Unidade excluída!' })
      setDeleteId(null)
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Unidades de medida e fatores de conversão.</p>
        <Button size="sm" onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nova
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Fator</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell>{u.type || '—'}</TableCell>
              <TableCell className="text-right">{u.base_conversion_factor || 1}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openDialog(u)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteId(u.id)}
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
            <DialogTitle>{editing ? 'Editar' : 'Nova'} Unidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <Input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="peso, volume..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Fator Conversão</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_conversion_factor}
                  onChange={(e) =>
                    setForm({ ...form, base_conversion_factor: parseFloat(e.target.value) || 1 })
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
        title="Excluir Unidade"
        description="Tem certeza?"
      />
    </div>
  )
}
