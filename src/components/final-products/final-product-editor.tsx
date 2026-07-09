import { useState, useEffect, useMemo } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getBaseProducts } from '@/services/base-products'
import { getPackaging } from '@/services/packaging'
import { getTaxRules } from '@/services/tax-rules'
import { createFinalProduct, updateFinalProduct } from '@/services/final-products'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import type { BaseProduct, Packaging, TaxRule, FinalProduct } from '@/types/system'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing?: FinalProduct | null
  onSaved: () => void
}

const toArray = (val: unknown): string[] => {
  if (Array.isArray(val)) return val as string[]
  if (typeof val === 'string' && val) return [val]
  return []
}

const emptyForm = {
  sku: '',
  name: '',
  category: '',
  sales_channel: '',
  net_weight: 0,
  gross_weight: 0,
  shelf_life: '',
  base_products: [] as string[],
  packaging_ids: [] as string[],
  tax_rule_id: '',
  markup: 30,
}

export function FinalProductEditor({ open, onOpenChange, editing, onSaved }: Props) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([])
  const [packaging, setPackaging] = useState<Packaging[]>([])
  const [taxRules, setTaxRules] = useState<TaxRule[]>([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getBaseProducts(), getPackaging(), getTaxRules()])
      .then(([bps, pks, trs]) => {
        setBaseProducts(bps)
        setPackaging(pks)
        setTaxRules(trs)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (editing) {
      setForm({
        sku: editing.sku,
        name: editing.name,
        category: editing.category || '',
        sales_channel: editing.sales_channel || '',
        net_weight: editing.net_weight || 0,
        gross_weight: editing.gross_weight || 0,
        shelf_life: editing.shelf_life || '',
        base_products: toArray(editing.base_products),
        packaging_ids: toArray(editing.packaging_ids),
        tax_rule_id: editing.tax_rule_id || '',
        markup: 30,
      })
    } else {
      setForm(emptyForm)
    }
  }, [editing, open])

  const simulation = useMemo(() => {
    const pkgCost = form.packaging_ids.reduce((sum, id) => {
      const pk = packaging.find((p) => p.id === id)
      return sum + (pk?.buy_price || 0) / (pk?.package_qty || 1)
    }, 0)
    const taxRate = taxRules.find((t) => t.id === form.tax_rule_id)?.iva_rate || 0
    const taxAmount = pkgCost * (taxRate / 100)
    const finalPrice = (pkgCost + taxAmount) * (1 + form.markup / 100)
    return { pkgCost, taxAmount, finalPrice }
  }, [form, packaging, taxRules])

  const toggleId = (field: 'base_products' | 'packaging_ids', id: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((x) => x !== id)
        : [...prev[field], id],
    }))
  }

  const handleSave = async () => {
    if (!user || !form.name.trim() || !form.sku.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'SKU e Nome são obrigatórios.' })
      return
    }
    setSaving(true)
    try {
      const { markup, ...apiData } = form
      const data = { ...apiData, user_id: user.id, needs_recalculation: false }
      if (editing) {
        await updateFinalProduct(editing.id, data)
        toast({ title: 'Produto final atualizado!' })
      } else {
        await createFinalProduct(data)
        toast({ title: 'Produto final criado!' })
      }
      onOpenChange(false)
      onSaved()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar' : 'Novo'} Produto Final</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">SKU *</Label>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Canal de Venda</Label>
              <Input
                value={form.sales_channel}
                onChange={(e) => setForm({ ...form, sales_channel: e.target.value })}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Peso Líquido (g)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.net_weight || ''}
                onChange={(e) => setForm({ ...form, net_weight: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Peso Bruto (g)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.gross_weight || ''}
                onChange={(e) =>
                  setForm({ ...form, gross_weight: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="border-t pt-3 space-y-2">
            <Label className="text-xs font-semibold">Produtos Base</Label>
            <div className="flex flex-wrap gap-2">
              {baseProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto base cadastrado.</p>
              ) : (
                baseProducts.map((bp) => (
                  <Button
                    key={bp.id}
                    variant={form.base_products.includes(bp.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleId('base_products', bp.id)}
                  >
                    {bp.name}
                  </Button>
                ))
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Embalagens</Label>
            <div className="flex flex-wrap gap-2">
              {packaging.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma embalagem cadastrada.</p>
              ) : (
                packaging.map((pk) => (
                  <Button
                    key={pk.id}
                    variant={form.packaging_ids.includes(pk.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleId('packaging_ids', pk.id)}
                  >
                    {pk.type} — {formatCurrency(pk.buy_price)}
                  </Button>
                ))
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Regra Fiscal</Label>
            <Select
              value={form.tax_rule_id || undefined}
              onValueChange={(v) => setForm({ ...form, tax_rule_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {taxRules.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    NCM: {t.ncm || '—'} — IVA: {t.iva_rate || 0}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 space-y-2">
            <Label className="text-xs font-semibold">Simulação de Margem</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                step="0.1"
                value={form.markup}
                onChange={(e) => setForm({ ...form, markup: parseFloat(e.target.value) || 0 })}
                className="w-28"
              />
              <span className="text-sm text-muted-foreground">% de markup</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Custo Embalagens:</span>
              <span className="font-medium">{formatCurrency(simulation.pkgCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Imposto Estimado:</span>
              <span className="font-medium">{formatCurrency(simulation.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Preço Simulado:</span>
              <span className="font-bold text-primary">
                {formatCurrency(simulation.finalPrice)}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {editing ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
