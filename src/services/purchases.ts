import pb from '@/lib/pocketbase/client'
import type { Purchase } from '@/types/system'

export const getPurchases = () =>
  pb.collection('purchases').getFullList({
    sort: '-date',
    expand: 'ingredient_id,supplier_id',
  }) as Promise<Purchase[]>

export const createPurchase = (data: Partial<Purchase>) => pb.collection('purchases').create(data)

export const updatePurchase = (id: string, data: Partial<Purchase>) =>
  pb.collection('purchases').update(id, data)

export const deletePurchase = (id: string) => pb.collection('purchases').delete(id)
