export interface ProductPricing {
  id: string
  sku: string
  name: string
  weightGrams: number
  unitsPerPack: number
  tableCode: number
  fillingType: number
  fillingCost: number
  productCost: number
  hasPrimaryPackaging: boolean
  primaryPackagingCost: number
  hasSecondaryPackaging: boolean
  secondaryPackagingCost: number
  hasLabel: boolean
  labelCost: number
  hasTransportBox: boolean
  transportBoxCost: number
  indirectCostPct: number
  marketingPct: number
  commercialPct: number
  logisticsPct: number
  simplesNacionalPct: number
  icmsStPct: number
  promotoresPct: number
  contratoPct: number
  cdPct: number
  profitPct: number
  recipeId?: string
}

export interface RecipeIngredient {
  item: number
  name: string
  quantityKg: number
  unitPrice: number
  value: number
  percentKg: number
  percentValue: number
  qtyPerKg: number
  costPerKg: number
}

export interface RecipeTechnicalSheet {
  id: string
  productName: string
  unit: string
  ingredients: RecipeIngredient[]
  totalKg: number
  totalValue: number
  costPerKg: number
  yieldKg: number
  portionCount: number
  portionWeightGrams: number
}

export interface PricingResult {
  productionCost: number
  totalCost: number
  priceWithoutIcmsSt: number
  priceWithIcmsSt: number
  unitPrice: number
  suggestedPrice: number
  marketingVerba: number
  commercialVerba: number
  logisticsVerba: number
  simplesNacionalVerba: number
  icmsStVerba: number
  profitVerba: number
}

export interface PricingRecord {
  id: string
  user: string
  productName: string
  baseCost: number
  marginPct: number
  retailPrice: number
  taxPct: number
  notes: string
  created: string
  updated: string
}
