export interface Supplier {
  id: string
  legal_name: string
  trade_name: string
  cnpj: string
  contact_info: string
  payment_terms: string
  user_id: string
  created: string
  updated: string
}

export interface UnitOfMeasure {
  id: string
  name: string
  type: string
  base_conversion_factor: number
  user_id: string
  created: string
  updated: string
}

export interface Purchase {
  id: string
  ingredient_id: string
  supplier_id: string
  price: number
  date: string
  invoice_ref: string
  user_id: string
  created: string
  updated: string
  expand?: {
    ingredient_id?: Ingredient
    supplier_id?: Supplier
  }
}

export interface Ingredient {
  id: string
  name: string
  unit: string
  cost: number
  code?: string
  brand?: string
  supplier_id?: string
  status?: string
  buy_unit?: string
  buy_price?: number
  package_quantity?: number
  freight_cost?: number
  recoverable_taxes?: number
  loss_percentage?: number
  user_id: string
  created: string
  updated: string
  expand?: {
    supplier_id?: Supplier
  }
}

export interface BaseProduct {
  id: string
  code: string
  name: string
  category: string
  yield_weight: number
  loss_percentage: number
  shelf_life: string
  needs_recalculation: boolean
  user_id: string
  created: string
  updated: string
}

export interface BaseProductItem {
  id: string
  base_product_id: string
  ingredient_id: string
  quantity: number
  unit: string
  user_id: string
  created: string
  updated: string
  expand?: {
    ingredient_id?: Ingredient
  }
}

export interface ProductionAsset {
  id: string
  name: string
  power_kw: number
  consumption_per_hour: number
  cost_per_hour: number
  user_id: string
  created: string
  updated: string
}

export interface LaborRate {
  id: string
  role: string
  hourly_rate: number
  benefits_multiplier: number
  user_id: string
  created: string
  updated: string
}

export interface Packaging {
  id: string
  type: string
  material: string
  package_qty: number
  buy_price: number
  user_id: string
  created: string
  updated: string
}

export interface FinalProduct {
  id: string
  sku: string
  name: string
  category: string
  sales_channel: string
  net_weight: number
  gross_weight: number
  shelf_life: string
  base_products: string
  packaging_ids: string
  tax_rule_id: string
  needs_recalculation: boolean
  user_id: string
  created: string
  updated: string
  expand?: {
    base_products?: BaseProduct[]
    packaging_ids?: Packaging[]
    tax_rule_id?: TaxRule
  }
}

export interface TaxRule {
  id: string
  ncm: string
  cest: string
  iva_rate: number
  reduction_percentage: number
  tax_regime: string
  user_id: string
  created: string
  updated: string
}

export interface AuditLog {
  id: string
  action: string
  collection_name: string
  record_id: string
  old_value: string
  new_value: string
  user_id: string
  created: string
  updated: string
  expand?: {
    user_id?: { id: string; name: string; email: string }
  }
}
