import type {
  ProductPricing,
  PricingResult,
  PricingSimulation,
  PricingSimulationResult,
} from './pricing-types'

export function calculateProductionCost(p: ProductPricing): number {
  const packaging =
    (p.hasPrimaryPackaging ? p.primaryPackagingCost : 0) +
    (p.hasSecondaryPackaging ? p.secondaryPackagingCost : 0) +
    (p.hasLabel ? p.labelCost : 0) +
    (p.hasTransportBox ? p.transportBoxCost : 0)
  return p.productCost + p.fillingCost + packaging
}

export function calculateTotalCost(p: ProductPricing): number {
  const productionCost = calculateProductionCost(p)
  const denom = 1 - p.indirectCostPct
  if (denom <= 0) return 0
  return productionCost / denom
}

export function calculatePriceWithIcmsSt(p: ProductPricing): number {
  const totalCost = calculateTotalCost(p)
  const sumPct =
    p.marketingPct +
    p.commercialPct +
    p.logisticsPct +
    p.simplesNacionalPct +
    p.icmsStPct +
    p.profitPct +
    p.promotoresPct +
    p.contratoPct +
    p.cdPct
  const denom = 1 - sumPct
  if (denom <= 0 || totalCost === 0) return 0
  return totalCost / denom
}

export function calculatePriceWithoutIcmsSt(priceWithIcmsSt: number, icmsStPct: number): number {
  if (priceWithIcmsSt === 0) return 0
  return priceWithIcmsSt / (1 + icmsStPct)
}

export function calculateUnitPrice(priceWithIcmsSt: number, unitsPerPack: number): number {
  if (unitsPerPack === 0) return 0
  return priceWithIcmsSt / unitsPerPack
}

export function calculateSuggestedPrice(unitPrice: number): number {
  return unitPrice / 0.65
}

export function calculateEffectiveIvaRate(ivaRate: number, reductionPct: number): number {
  return ivaRate * (1 - reductionPct)
}

export function calculateMarkupPrice(
  variableCost: number,
  fixedCostPct: number,
  taxPct: number,
  commissionPct: number,
  profitPct: number,
  otherPct: number,
): number {
  const sumPct = fixedCostPct + taxPct + commissionPct + profitPct + otherPct
  const denom = 1 - sumPct
  if (denom <= 0 || variableCost === 0) return 0
  return variableCost / denom
}

export function calculatePriceWithIvaPorFora(netPrice: number, effectiveIvaRate: number): number {
  return netPrice * (1 + effectiveIvaRate)
}

export function calculateBaseProductCost(
  ingredientCosts: number[],
  yieldWeight: number,
  lossPercentage: number,
): { totalCost: number; costPerKg: number; effectiveYield: number } {
  const totalCost = ingredientCosts.reduce((sum, c) => sum + c, 0)
  const effectiveYield = yieldWeight * (1 - lossPercentage / 100)
  const costPerKg = effectiveYield > 0 ? totalCost / effectiveYield : 0
  return { totalCost, costPerKg, effectiveYield }
}

export function calculateSimulation(s: PricingSimulation): PricingSimulationResult {
  const effectiveIvaRate = calculateEffectiveIvaRate(s.ivaRate / 100, s.reductionPct / 100)
  const priceWithoutIva = calculateMarkupPrice(
    s.variableCost,
    s.fixedCostPct / 100,
    s.taxPct / 100,
    s.commissionPct / 100,
    s.profitPct / 100,
    s.otherPct / 100,
  )
  const priceWithIva = calculatePriceWithIvaPorFora(priceWithoutIva, effectiveIvaRate)
  return {
    effectiveIvaRate,
    priceWithoutIva,
    priceWithIva,
    profitAmount: priceWithoutIva * (s.profitPct / 100),
    taxAmount: priceWithoutIva * (s.taxPct / 100),
    commissionAmount: priceWithoutIva * (s.commissionPct / 100),
    totalPercentages: s.fixedCostPct + s.taxPct + s.commissionPct + s.profitPct + s.otherPct,
  }
}

export function calculateAll(p: ProductPricing): PricingResult {
  const priceWithIcmsSt = calculatePriceWithIcmsSt(p)
  const unitPrice = calculateUnitPrice(priceWithIcmsSt, p.unitsPerPack)
  return {
    productionCost: calculateProductionCost(p),
    totalCost: calculateTotalCost(p),
    priceWithoutIcmsSt: calculatePriceWithoutIcmsSt(priceWithIcmsSt, p.icmsStPct),
    priceWithIcmsSt,
    unitPrice,
    suggestedPrice: calculateSuggestedPrice(unitPrice),
    marketingVerba: priceWithIcmsSt * p.marketingPct,
    commercialVerba: priceWithIcmsSt * p.commercialPct,
    logisticsVerba: priceWithIcmsSt * p.logisticsPct,
    simplesNacionalVerba: priceWithIcmsSt * p.simplesNacionalPct,
    icmsStVerba: priceWithIcmsSt * p.icmsStPct,
    profitVerba: priceWithIcmsSt * p.profitPct,
  }
}
