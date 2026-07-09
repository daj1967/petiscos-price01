import pb from '@/lib/pocketbase/client'
import type { LaborRate } from '@/types/system'

export const getLaborRates = () =>
  pb.collection('labor_rates').getFullList({ sort: 'role' }) as Promise<LaborRate[]>

export const createLaborRate = (data: Partial<LaborRate>) =>
  pb.collection('labor_rates').create(data)

export const updateLaborRate = (id: string, data: Partial<LaborRate>) =>
  pb.collection('labor_rates').update(id, data)

export const deleteLaborRate = (id: string) => pb.collection('labor_rates').delete(id)
