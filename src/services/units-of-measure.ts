import pb from '@/lib/pocketbase/client'
import type { UnitOfMeasure } from '@/types/system'

export const getUnits = () =>
  pb.collection('units_of_measure').getFullList({ sort: 'name' }) as Promise<UnitOfMeasure[]>

export const createUnit = (data: Partial<UnitOfMeasure>) =>
  pb.collection('units_of_measure').create(data)

export const updateUnit = (id: string, data: Partial<UnitOfMeasure>) =>
  pb.collection('units_of_measure').update(id, data)

export const deleteUnit = (id: string) => pb.collection('units_of_measure').delete(id)
