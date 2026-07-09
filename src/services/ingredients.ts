import pb from '@/lib/pocketbase/client'
import type { Ingredient } from '@/types/system'

export type IngredientRecord = Ingredient

export const getIngredients = () =>
  pb.collection('ingredients').getFullList({
    sort: '-created',
    expand: 'supplier_id',
  }) as Promise<Ingredient[]>

export const getIngredient = (id: string) =>
  pb.collection('ingredients').getOne(id, { expand: 'supplier_id' }) as Promise<Ingredient>

export const createIngredient = (data: Partial<Ingredient>) =>
  pb.collection('ingredients').create(data)

export const updateIngredient = (id: string, data: Partial<Ingredient>) =>
  pb.collection('ingredients').update(id, data)

export const deleteIngredient = (id: string) => pb.collection('ingredients').delete(id)
