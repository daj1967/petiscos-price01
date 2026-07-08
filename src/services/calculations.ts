import pb from '@/lib/pocketbase/client'

export interface CalculationRecord {
  id: string
  product_name: string
  total_cost: number
  markup: number
  final_price: number
  ingredients_list: unknown
  user_id: string
  created: string
  updated: string
}

export interface CreateCalculationData {
  product_name: string
  total_cost: number
  markup: number
  final_price: number
  ingredients_list: unknown
  user_id: string
}

export function getCalculations(userId: string) {
  return pb.collection('calculations').getFullList<CalculationRecord>({
    filter: `user_id = "${userId}"`,
    sort: '-created',
  })
}

export function createCalculation(data: CreateCalculationData) {
  return pb.collection('calculations').create<CalculationRecord>(data)
}

export function getCalculation(id: string) {
  return pb.collection('calculations').getOne<CalculationRecord>(id)
}

export function updateCalculation(id: string, data: Partial<CreateCalculationData>) {
  return pb.collection('calculations').update<CalculationRecord>(id, data)
}

export function deleteCalculation(id: string) {
  return pb.collection('calculations').delete(id)
}
