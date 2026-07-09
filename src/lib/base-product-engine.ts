export interface BaseProductItemCalc {
  ingredientId: string
  name: string
  unit: string
  quantity: number
  unitCost: number
  subtotal: number
}

export interface BaseProductCostResult {
  ingredientsTotal: number
  totalCost: number
  effectiveYield: number
  costPerKg: number
}

export function calculateBaseProductCost(
  items: BaseProductItemCalc[],
  yieldWeight: number,
  lossPercentage: number,
  productionCost: number = 0,
  laborCost: number = 0,
): BaseProductCostResult {
  const ingredientsTotal = items.reduce((sum, i) => sum + i.subtotal, 0)
  const effectiveYield = yieldWeight * (1 - lossPercentage / 100)
  const totalCost = ingredientsTotal + productionCost + laborCost
  const costPerKg = effectiveYield > 0 ? totalCost / effectiveYield : 0
  return { ingredientsTotal, totalCost, effectiveYield, costPerKg }
}
