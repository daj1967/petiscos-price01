import { Calculator as CalcIcon, Save, Download } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import type { PricingResult, ProductPricing } from '@/lib/pricing-types'

interface Props {
  result: PricingResult
  form: ProductPricing
  onSave: () => void
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'font-bold text-primary' : 'font-medium'}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

function VerbaRow({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">
        {label} ({(pct * 100).toFixed(1)}%)
      </span>
      <span className="font-medium">{formatCurrency(value)}</span>
    </div>
  )
}

export function CalculatorSummary({ result, form, onSave }: Props) {
  const isValid = result.priceWithIcmsSt > 0
  return (
    <Card className="sticky top-24 border-primary/20 shadow-elevation overflow-hidden">
      <div className="bg-primary p-4 text-primary-foreground">
        <h3 className="font-semibold flex items-center gap-2">
          <CalcIcon className="w-5 h-5" />
          Resumo da Precificação
        </h3>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">Preço com ICMS-ST</p>
          {isValid ? (
            <p className="text-4xl font-bold text-primary">
              {formatCurrency(result.priceWithIcmsSt)}
            </p>
          ) : (
            <p className="text-lg font-bold text-destructive">Margens/Impostos inválidos</p>
          )}
        </div>
        <Separator />
        <div className="space-y-2">
          <Row label="Custo Produção" value={result.productionCost} />
          <Row label="Custo Total" value={result.totalCost} />
          <Row label="Preço s/ ICMS-ST" value={result.priceWithoutIcmsSt} />
          <Row label="Preço da Unidade" value={result.unitPrice} />
          <Row label="Preço Sugerido" value={result.suggestedPrice} highlight />
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Verbas (sobre preço c/ ICMS-ST)
          </p>
          <VerbaRow label="Marketing" value={result.marketingVerba} pct={form.marketingPct} />
          <VerbaRow label="Comercial" value={result.commercialVerba} pct={form.commercialPct} />
          <VerbaRow label="Logística" value={result.logisticsVerba} pct={form.logisticsPct} />
          <VerbaRow
            label="Simples Nacional"
            value={result.simplesNacionalVerba}
            pct={form.simplesNacionalPct}
          />
          <VerbaRow label="ICMS-ST" value={result.icmsStVerba} pct={form.icmsStPct} />
          <VerbaRow label="Lucro" value={result.profitVerba} pct={form.profitPct} />
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 p-4 gap-2 flex-col sm:flex-row border-t">
        <Button variant="outline" className="w-full" onClick={() => {}}>
          <Download className="mr-2 h-4 w-4" /> PDF
        </Button>
        <Button className="w-full" onClick={onSave} disabled={!isValid}>
          <Save className="mr-2 h-4 w-4" /> Salvar
        </Button>
      </CardFooter>
    </Card>
  )
}
