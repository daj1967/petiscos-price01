import pb from '@/lib/pocketbase/client'
import type { TaxRule } from '@/types/system'

export const getTaxRules = () =>
  pb.collection('tax_rules').getFullList({ sort: '-created' }) as Promise<TaxRule[]>

export const getTaxRule = (id: string) => pb.collection('tax_rules').getOne(id) as Promise<TaxRule>

export const createTaxRule = (data: Partial<TaxRule>) => pb.collection('tax_rules').create(data)

export const updateTaxRule = (id: string, data: Partial<TaxRule>) =>
  pb.collection('tax_rules').update(id, data)

export const deleteTaxRule = (id: string) => pb.collection('tax_rules').delete(id)
