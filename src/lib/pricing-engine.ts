import type { ProductPricing, PricingResult } from './pricing-types'

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
