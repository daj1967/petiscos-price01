import { useState, useEffect } from 'react'
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
import { getSuppliers } from '@/services/suppliers'
import { calculateUnitCost } from '@/lib/unit-conversion'
import { formatCurrency } from '@/lib/utils'
import type { Supplier } from '@/types/system'
import type { IngredientRecord } from '@/services/ingredients'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (data: Partial<IngredientRecord>) => void
  editing?: IngredientRecord | null
}

const UNITS = ['kg', 'g', 'litro', 'ml', 'unidade', 'caixa', 'saco']

export function IngredientDialog({ open, onOpenChange, onSubmit, editing }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [form, setForm] = useState<Record<string, string | number>>({})

  useEffect(() => {
    getSuppliers()
      .then(setSuppliers)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        code: editing.code || '',
        brand: editing.brand || '',
        unit: editing.unit || 'kg',
        supplier_id: editing.supplier_id || '',
        status: editing.status || 'active',
        buy_unit: editing.buy_unit || 'kg',
        buy_price: editing.buy_price || 0,
        package_quantity: editing.package_quantity || 1,
        freight_cost: editing.freight_cost || 0,
        recoverable_taxes: editing.recoverable_taxes || 0,
        loss_percentage: editing.loss_percentage || 0,
      })
    } else {
      setForm({
        name: '',
        code: '',
        brand: '',
        unit: 'kg',
        supplier_id: '',
        status: 'active',
        buy_unit: 'kg',
        buy_price: 0,
        package_quantity: 1,
        freight_cost: 0,
        recoverable_taxes: 0,
        loss_percentage: 0,
      })
    }
  }, [editing, open])

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }))
  const num = (k: string) => Number(form[k]) || 0
  const unitCost = calculateUnitCost(
    num('buy_price'),
    num('package_quantity') || 1,
    num('freight_cost'),
    num('recoverable_taxes'),
    num('loss_percentage'),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar' : 'Novo'} Insumo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome *</Label>
            <Input value={form.name || ''} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Código</Label>
              <Input value={form.code || ''} onChange={(e) => set('code', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Marca</Label>
              <Input value={form.brand || ''} onChange={(e) => set('brand', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status as string} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Unidade de Uso</Label>
              <Select value={form.unit as string} onValueChange={(v) => set('unit', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fornecedor</Label>
              <Select
                value={form.supplier_id as string}
                onValueChange={(v) => set('supplier_id', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.trade_name || s.legal_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border-t pt-3 space-y-3">
            <Label className="text-xs font-semibold">Dados de Compra</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Un. Compra</Label>
                <Select value={form.buy_unit as string} onValueChange={(v) => set('buy_unit', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Qtd. Embalagem</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.package_quantity || ''}
                  onChange={(e) => set('package_quantity', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Preço Compra (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.buy_price || ''}
                  onChange={(e) => set('buy_price', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Frete (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.freight_cost || ''}
                  onChange={(e) => set('freight_cost', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Imp. Recuperáveis (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.recoverable_taxes || ''}
                  onChange={(e) => set('recoverable_taxes', parseFloat(e.target.value) || 0)}
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
                  onChange={(e) => set('loss_percentage', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 text-sm flex justify-between items-center">
            <span className="text-muted-foreground">Custo unitário calculado:</span>
            <span className="font-bold text-primary">
              {formatCurrency(unitCost)}/{form.buy_unit || 'kg'}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSubmit({ ...form, cost: unitCost } as Partial<IngredientRecord>)
              onOpenChange(false)
            }}
          >
            {editing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
