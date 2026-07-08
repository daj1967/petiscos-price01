import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { calculateAll } from '@/lib/pricing-engine'
import type { ProductPricing, PricingResult } from '@/lib/pricing-types'
import type { CalculationRecord } from '@/services/calculations'

interface Props {
  record: CalculationRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface RowProps {
  label: string
  value: string
  highlight?: boolean
}

function DetailRow({ label, value, highlight }: RowProps) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'font-bold text-slate-800' : 'font-medium'}>{value}</span>
    </div>
  )
}

export function TechnicalSheetDialog({ record, open, onOpenChange }: Props) {
  if (!record) return null
  const data = record.ingredients_list as ProductPricing | null
  const result: PricingResult | null = data ? calculateAll(data) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Ficha Técnica — {record.product_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {data && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">SKU: </span>
                {data.sku || '—'}
              </div>
              <div>
                <span className="text-muted-foreground">Peso: </span>
                {data.weightGrams}g
              </div>
              <div>
                <span className="text-muted-foreground">Unidades/Pacote: </span>
                {data.unitsPerPack}
              </div>
              <div>
                <span className="text-muted-foreground">Rendimento: </span>
                {data.tableCode}
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Composição de Custos</h4>
            {data ? (
              <div className="space-y-0.5">
                <DetailRow label="Custo do Produto" value={formatCurrency(data.productCost)} />
                <DetailRow label="Custo de Recheio" value={formatCurrency(data.fillingCost)} />
                {data.hasPrimaryPackaging && (
                  <DetailRow
                    label="Embalagem Primária"
                    value={formatCurrency(data.primaryPackagingCost)}
                  />
                )}
                {data.hasSecondaryPackaging && (
                  <DetailRow
                    label="Embalagem Secundária"
                    value={formatCurrency(data.secondaryPackagingCost)}
                  />
                )}
                {data.hasLabel && (
                  <DetailRow label="Rótulo" value={formatCurrency(data.labelCost)} />
                )}
                {data.hasTransportBox && (
                  <DetailRow
                    label="Caixa de Transporte"
                    value={formatCurrency(data.transportBoxCost)}
                  />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Dados de composição não disponíveis.</p>
            )}
          </div>

          {result && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Resultado de Precificação</h4>
                <div className="space-y-0.5">
                  <DetailRow
                    label="Custo de Produção"
                    value={formatCurrency(result.productionCost)}
                  />
                  <DetailRow label="Custo Total" value={formatCurrency(result.totalCost)} />
                  <DetailRow
                    label="Preço s/ ICMS-ST"
                    value={formatCurrency(result.priceWithoutIcmsSt)}
                  />
                  <DetailRow
                    label="Preço c/ ICMS-ST"
                    value={formatCurrency(result.priceWithIcmsSt)}
                    highlight
                  />
                  <DetailRow label="Preço Unitário" value={formatCurrency(result.unitPrice)} />
                  <DetailRow label="Preço Sugerido" value={formatCurrency(result.suggestedPrice)} />
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Resumo do Registro</h4>
            <div className="space-y-0.5">
              <DetailRow label="Margem" value={`${(record.markup * 100).toFixed(1)}%`} />
              <DetailRow label="Custo Total Salvo" value={formatCurrency(record.total_cost)} />
              <DetailRow
                label="Preço Final Salvo"
                value={formatCurrency(record.final_price)}
                highlight
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
