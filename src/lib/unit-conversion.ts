export function calculateUnitCost(
  buyPrice: number,
  packageQuantity: number,
  freightCost: number = 0,
  recoverableTaxes: number = 0,
  lossPercentage: number = 0,
): number {
  const netCost = buyPrice + freightCost - recoverableTaxes
  const effectiveQuantity = packageQuantity * (1 - lossPercentage / 100)
  if (effectiveQuantity === 0) return 0
  return netCost / effectiveQuantity
}

export function convertUnitCost(costPerBaseUnit: number, fromUnit: string, toUnit: string): number {
  const from = fromUnit.toLowerCase().trim()
  const to = toUnit.toLowerCase().trim()
  if (from === to) return costPerBaseUnit
  if (from === 'kg' && to === 'g') return costPerBaseUnit / 1000
  if (from === 'g' && to === 'kg') return costPerBaseUnit * 1000
  if (from === 'litro' && to === 'ml') return costPerBaseUnit / 1000
  if (from === 'ml' && to === 'litro') return costPerBaseUnit * 1000
  if (from === 'kg' && to === 'litro') return costPerBaseUnit
  if (from === 'litro' && to === 'kg') return costPerBaseUnit
  return costPerBaseUnit
}

export function getMovingAverage(prices: number[]): number {
  if (prices.length === 0) return 0
  return prices.reduce((sum, p) => sum + p, 0) / prices.length
}

export function getLastPrice(prices: number[]): number {
  if (prices.length === 0) return 0
  return prices[prices.length - 1]
}
