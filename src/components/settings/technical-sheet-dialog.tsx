import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { calculateAll } from '@/lib/pricing-engine'
import type { ProductPricing, PricingResult } from '@/lib/pricing-types'
import { type RecipeData, type RecipeIngredientItem, isRecipeData } from '@/lib/recipe-types'
import type { CalculationRecord } from '@/services/calculations'

interface Props {
  record: CalculationRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'font-bold text-slate-800' : 'font-medium'}>{value}</span>
    </div>
  )
}

export function TechnicalSheetDialog({ record, open, onOpenChange }: Props) {
  if (!record) return null
  const rawData = record.ingredients_list
  const recipeData = isRecipeData(rawData) ? (rawData as RecipeData) : null
  const productData = !recipeData && rawData ? (rawData as ProductPricing) : null
  const result: PricingResult | null = productData ? calculateAll(productData) : null
  const totalIngredientsCost = recipeData
    ? recipeData.ingredients.reduce((s, i) => s + i.subtotal, 0)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Ficha Técnica — {record.product_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {recipeData && (
            <>
              <div>
                <h4 className="text-sm font-semibold mb-2">Ingredientes</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingrediente</TableHead>
                        <TableHead className="text-right">Custo Unit.</TableHead>
                        <TableHead className="text-right">Qtde</TableHead>
                        <TableHead className="text-right">Sub-total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recipeData.ingredients.map((ing: RecipeIngredientItem) => (
                        <TableRow key={ing.ingredientId}>
                          <TableCell className="font-medium">{ing.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(ing.unitCost)}
                          </TableCell>
                          <TableCell className="text-right">
                            {ing.quantity} {ing.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(ing.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-bold bg-muted/30">
                        <TableCell colSpan={3}>CUSTO TOTAL</TableCell>
                        <TableCell className="text-right text-primary">
                          {formatCurrency(totalIngredientsCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <Separator />
            </>
          )}

          {productData && (
            <>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">SKU: </span>
                  {productData.sku || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Peso: </span>
                  {productData.weightGrams}g
                </div>
                <div>
                  <span className="text-muted-foreground">Unidades/Pacote: </span>
                  {productData.unitsPerPack}
                </div>
                <div>
                  <span className="text-muted-foreground">Rendimento: </span>
                  {productData.tableCode}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Composição de Custos</h4>
                <div className="space-y-0.5">
                  <DetailRow
                    label="Custo do Produto"
                    value={formatCurrency(productData.productCost)}
                  />
                  <DetailRow
                    label="Custo de Recheio"
                    value={formatCurrency(productData.fillingCost)}
                  />
                  {productData.hasPrimaryPackaging && (
                    <DetailRow
                      label="Embalagem Primária"
                      value={formatCurrency(productData.primaryPackagingCost)}
                    />
                  )}
                  {productData.hasSecondaryPackaging && (
                    <DetailRow
                      label="Embalagem Secundária"
                      value={formatCurrency(productData.secondaryPackagingCost)}
                    />
                  )}
                  {productData.hasLabel && (
                    <DetailRow label="Rótulo" value={formatCurrency(productData.labelCost)} />
                  )}
                  {productData.hasTransportBox && (
                    <DetailRow
                      label="Caixa de Transporte"
                      value={formatCurrency(productData.transportBoxCost)}
                    />
                  )}
                </div>
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
                      <DetailRow
                        label="Preço Sugerido"
                        value={formatCurrency(result.suggestedPrice)}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <Separator />
          <div>
            <h4 className="text-sm font-semibold mb-2">Resumo do Registro</h4>
            <div className="space-y-0.5">
              <DetailRow label="Margem" value={`${record.markup.toFixed(1)}%`} />
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
