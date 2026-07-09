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
import { getTaxRules, createTaxRule, updateTaxRule, deleteTaxRule } from '@/services/tax-rules'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'
import type { TaxRule } from '@/types/system'

export function TaxRulesManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<TaxRule[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TaxRule | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({
    ncm: '',
    cest: '',
    iva_rate: 0,
    reduction_percentage: 0,
    tax_regime: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      setItems(await getTaxRules())
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('tax_rules', () => loadData())

  const openDialog = (item?: TaxRule) => {
    setErrors({})
    setEditing(item || null)
    setForm(
      item
        ? {
            ncm: item.ncm || '',
            cest: item.cest || '',
            iva_rate: item.iva_rate || 0,
            reduction_percentage: item.reduction_percentage || 0,
            tax_regime: item.tax_regime || '',
          }
        : { ncm: '', cest: '', iva_rate: 0, reduction_percentage: 0, tax_regime: '' },
    )
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.ncm.trim()) {
      setErrors({ ncm: 'NCM é obrigatório' })
      return
    }
    try {
      if (editing) {
        await updateTaxRule(editing.id, form)
        toast({ title: 'Regra fiscal atualizada!' })
      } else {
        await createTaxRule({ ...form, user_id: user.id })
        toast({ title: 'Regra fiscal criada!' })
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
      await deleteTaxRule(deleteId)
      toast({ title: 'Regra fiscal excluída!' })
      setDeleteId(null)
      loadData()
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(e) })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Regras fiscais (NCM, IVA, reduções).</p>
        <Button size="sm" onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Nova
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NCM</TableHead>
            <TableHead>CEST</TableHead>
            <TableHead className="text-right">IVA (%)</TableHead>
            <TableHead className="text-right">Redução (%)</TableHead>
            <TableHead>Regime</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs">{t.ncm || '—'}</TableCell>
              <TableCell className="font-mono text-xs">{t.cest || '—'}</TableCell>
              <TableCell className="text-right">{t.iva_rate || 0}%</TableCell>
              <TableCell className="text-right">{t.reduction_percentage || 0}%</TableCell>
              <TableCell className="text-sm">{t.tax_regime || '—'}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openDialog(t)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeleteId(t.id)}
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
            <DialogTitle>{editing ? 'Editar' : 'Nova'} Regra Fiscal</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">NCM *</Label>
                <Input
                  value={form.ncm}
                  onChange={(e) => setForm({ ...form, ncm: e.target.value })}
                />
                {errors.ncm && <p className="text-xs text-red-500">{errors.ncm}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CEST</Label>
                <Input
                  value={form.cest}
                  onChange={(e) => setForm({ ...form, cest: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">IVA (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.iva_rate}
                  onChange={(e) => setForm({ ...form, iva_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Redução (%)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.reduction_percentage}
                  onChange={(e) =>
                    setForm({ ...form, reduction_percentage: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Regime</Label>
              <Input
                value={form.tax_regime}
                onChange={(e) => setForm({ ...form, tax_regime: e.target.value })}
                placeholder="Simples Nacional, Lucro Real..."
              />
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
        title="Excluir Regra Fiscal"
        description="Tem certeza?"
      />
    </div>
  )
}
