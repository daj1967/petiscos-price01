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
  getPackaging,
  createPackaging,
  updatePackaging,
  deletePackaging,
} from '@/services/packaging'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import type { Packaging as PackagingType } from '@/types/system'

const emptyForm = { type: '', material: '', package_qty: 1, buy_price: 0 }

export function PackagingManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<PackagingType[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PackagingType | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const loadData = useCallback(async () => {
    try {
      setItems(await getPackaging())
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('packaging', () => loadData())

  const openDialog = (item?: PackagingType) => {
    setEditing(item || null)
    setForm(
      item
        ? {
            type: item.type,
            material: item.material || '',
            package_qty: item.package_qty || 1,
            buy_price: item.buy_price,
          }
        : emptyForm,
    )
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.type.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Tipo é obrigatório' })
      return
    }
    try {
      if (editing) {
        await updatePackaging(editing.id, form)
        toast({ title: 'Embalagem atualizada!' })
      } else {
        await createPackaging({ ...form, user_id: user.id })
        toast({ title: 'Embalagem criada!' })
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const fe = extractFieldErrors(err)
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
      await deletePackaging(deleteId)
      toast({ title: 'Embalagem excluída!' })
      setDeleteId(null)
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Embalagens e custos de aquisição.</p>
        <Button size="sm" onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nova
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Material</TableHead>
            <TableHead className="text-right">Qtd./Pacote</TableHead>
            <TableHead className="text-right">Preço Compra</TableHead>
            <TableHead className="text-right">Custo Unit.</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.type}</TableCell>
              <TableCell>{p.material || '—'}</TableCell>
              <TableCell className="text-right">{p.package_qty || 1}</TableCell>
              <TableCell className="text-right">{formatCurrency(p.buy_price)}</TableCell>
              <TableCell className="text-right font-medium text-primary">
                {formatCurrency(p.buy_price / (p.package_qty || 1))}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Nova'} Embalagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo *</Label>
              <Input
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="Ex: Sacola, Bandeja..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Material</Label>
              <Input
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                placeholder="Plástico, Papelão..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Qtd./Pacote</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={form.package_qty}
                  onChange={(e) => setForm({ ...form, package_qty: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Preço Compra (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.buy_price}
                  onChange={(e) => setForm({ ...form, buy_price: parseFloat(e.target.value) || 0 })}
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
        title="Excluir Embalagem"
        description="Tem certeza?"
      />
    </div>
  )
}
