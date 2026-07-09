import pb from '@/lib/pocketbase/client'
import type { FinalProduct } from '@/types/system'

export const getFinalProducts = () =>
  pb.collection('final_products').getFullList({
    sort: '-created',
    expand: 'base_products,packaging_ids,tax_rule_id',
  }) as Promise<FinalProduct[]>

export const getFinalProduct = (id: string) =>
  pb.collection('final_products').getOne(id, {
    expand: 'base_products,packaging_ids,tax_rule_id',
  }) as Promise<FinalProduct>

export const createFinalProduct = (data: Partial<FinalProduct>) =>
  pb.collection('final_products').create(data)

export const updateFinalProduct = (id: string, data: Partial<FinalProduct>) =>
  pb.collection('final_products').update(id, data)

export const deleteFinalProduct = (id: string) => pb.collection('final_products').delete(id)
