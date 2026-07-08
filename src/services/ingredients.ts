import pb from '@/lib/pocketbase/client'

export interface IngredientRecord {
  id: string
  name: string
  unit: string
  cost: number
  user_id: string
  created: string
  updated: string
}

export interface CreateIngredientData {
  name: string
  unit: string
  cost: number
  user_id: string
}

export function getIngredients(userId: string) {
  return pb.collection('ingredients').getFullList<IngredientRecord>({
    filter: `user_id = "${userId}"`,
    sort: '-created',
  })
}

export function createIngredient(data: CreateIngredientData) {
  return pb.collection('ingredients').create<IngredientRecord>(data)
}

export function updateIngredient(id: string, data: Partial<CreateIngredientData>) {
  return pb.collection('ingredients').update<IngredientRecord>(id, data)
}

export function deleteIngredient(id: string) {
  return pb.collection('ingredients').delete(id)
}
