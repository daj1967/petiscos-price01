import pb from '@/lib/pocketbase/client'
import type { ProductionAsset } from '@/types/system'

export const getProductionAssets = () =>
  pb.collection('production_assets').getFullList({ sort: 'name' }) as Promise<ProductionAsset[]>

export const createProductionAsset = (data: Partial<ProductionAsset>) =>
  pb.collection('production_assets').create(data)

export const updateProductionAsset = (id: string, data: Partial<ProductionAsset>) =>
  pb.collection('production_assets').update(id, data)

export const deleteProductionAsset = (id: string) => pb.collection('production_assets').delete(id)
