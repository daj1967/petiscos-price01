import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProductPricing } from '@/lib/pricing-types'

interface Props {
  form: ProductPricing
  update: (field: keyof ProductPricing, value: string | number | boolean) => void
}

function PctInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={value * 100}
        onChange={(e) => onChange(parseFloat(e.target.value) / 100 || 0)}
      />
    </div>
  )
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  )
}

function PackRow({
  label,
  checked,
  onCheck,
  cost,
  onCost,
}: {
  label: string
  checked: boolean
  onCheck: (v: boolean) => void
  cost: number
  onCost: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox checked={checked} onCheckedChange={(v) => onCheck(v === true)} />
      <Label className="flex-1 text-sm">{label}</Label>
      <Input
        type="number"
        min="0"
        step="0.01"
        value={cost}
        disabled={!checked}
        onChange={(e) => onCost(parseFloat(e.target.value) || 0)}
        className="w-28"
      />
    </div>
  )
}

export function CalculatorForm({ form, update }: Props) {
  return (
    <Tabs defaultValue="ident" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ident">1. Identificação</TabsTrigger>
        <TabsTrigger value="costs">2. Custos</TabsTrigger>
        <TabsTrigger value="margins">3. Margens & Tributos</TabsTrigger>
      </TabsList>

      <TabsContent value="ident">
        <Card>
          <CardHeader>
            <CardTitle>Identificação do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nome do Produto</Label>
              <Input
                placeholder="Ex: Bolinho de Mandioca 300g"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">SKU</Label>
                <Input value={form.sku} onChange={(e) => update('sku', e.target.value)} />
              </div>
              <MoneyInput
                label="Peso (g)"
                value={form.weightGrams}
                onChange={(v) => update('weightGrams', v)}
              />
              <MoneyInput
                label="Unid./Fardo"
                value={form.unitsPerPack}
                onChange={(v) => update('unitsPerPack', v)}
              />
              <MoneyInput
                label="Tabela"
                value={form.tableCode}
                onChange={(v) => update('tableCode', v)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="costs">
        <Card>
          <CardHeader>
            <CardTitle>Custos Diretos e Embalagens</CardTitle>
            <CardDescription>
              Defina o custo base do produto e os custos de embalagem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MoneyInput
                label="Custo Produto (R$)"
                value={form.productCost}
                onChange={(v) => update('productCost', v)}
              />
              <MoneyInput
                label="Custo Recheio (R$)"
                value={form.fillingCost}
                onChange={(v) => update('fillingCost', v)}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Embalagens</Label>
              <PackRow
                label="Embalagem Primária"
                checked={form.hasPrimaryPackaging}
                onCheck={(v) => update('hasPrimaryPackaging', v)}
                cost={form.primaryPackagingCost}
                onCost={(v) => update('primaryPackagingCost', v)}
              />
              <PackRow
                label="Embalagem Secundária"
                checked={form.hasSecondaryPackaging}
                onCheck={(v) => update('hasSecondaryPackaging', v)}
                cost={form.secondaryPackagingCost}
                onCost={(v) => update('secondaryPackagingCost', v)}
              />
              <PackRow
                label="Rótulo"
                checked={form.hasLabel}
                onCheck={(v) => update('hasLabel', v)}
                cost={form.labelCost}
                onCost={(v) => update('labelCost', v)}
              />
              <PackRow
                label="Caixa de Transporte"
                checked={form.hasTransportBox}
                onCheck={(v) => update('hasTransportBox', v)}
                cost={form.transportBoxCost}
                onCost={(v) => update('transportBoxCost', v)}
              />
            </div>
            <PctInput
              label="% Custo Indireto"
              value={form.indirectCostPct}
              onChange={(v) => update('indirectCostPct', v)}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="margins">
        <Card>
          <CardHeader>
            <CardTitle>Margens e Tributos</CardTitle>
            <CardDescription>
              Configure percentuais comerciais, tributários e lucro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PctInput
                label="Marketing (%)"
                value={form.marketingPct}
                onChange={(v) => update('marketingPct', v)}
              />
              <PctInput
                label="Comercial (%)"
                value={form.commercialPct}
                onChange={(v) => update('commercialPct', v)}
              />
              <PctInput
                label="Logística (%)"
                value={form.logisticsPct}
                onChange={(v) => update('logisticsPct', v)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PctInput
                label="Simples Nacional (%)"
                value={form.simplesNacionalPct}
                onChange={(v) => update('simplesNacionalPct', v)}
              />
              <PctInput
                label="ICMS-ST (%)"
                value={form.icmsStPct}
                onChange={(v) => update('icmsStPct', v)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PctInput
                label="Promotores (%)"
                value={form.promotoresPct}
                onChange={(v) => update('promotoresPct', v)}
              />
              <PctInput
                label="Contrato (%)"
                value={form.contratoPct}
                onChange={(v) => update('contratoPct', v)}
              />
              <PctInput label="CD (%)" value={form.cdPct} onChange={(v) => update('cdPct', v)} />
            </div>
            <PctInput
              label="Lucro (%)"
              value={form.profitPct}
              onChange={(v) => update('profitPct', v)}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
