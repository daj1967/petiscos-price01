import pb from '@/lib/pocketbase/client'
import type { BaseProduct, BaseProductItem } from '@/types/system'

export const getBaseProducts = () =>
  pb.collection('base_products').getFullList({ sort: '-created' }) as Promise<BaseProduct[]>

export const getBaseProduct = (id: string) =>
  pb.collection('base_products').getOne(id) as Promise<BaseProduct>

export const createBaseProduct = (data: Partial<BaseProduct>) =>
  pb.collection('base_products').create(data)

export const updateBaseProduct = (id: string, data: Partial<BaseProduct>) =>
  pb.collection('base_products').update(id, data)

export const deleteBaseProduct = (id: string) => pb.collection('base_products').delete(id)

export const getBaseProductItems = (baseProductId: string) =>
  pb.collection('base_product_items').getFullList({
    filter: `base_product_id = "${baseProductId}"`,
    expand: 'ingredient_id',
    sort: 'created',
  }) as Promise<BaseProductItem[]>

export const createBaseProductItem = (data: Partial<BaseProductItem>) =>
  pb.collection('base_product_items').create(data)

export const deleteBaseProductItem = (id: string) => pb.collection('base_product_items').delete(id)
