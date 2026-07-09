import pb from '@/lib/pocketbase/client'
import type { Packaging } from '@/types/system'

export const getPackaging = () =>
  pb.collection('packaging').getFullList({ sort: '-created' }) as Promise<Packaging[]>

export const createPackaging = (data: Partial<Packaging>) => pb.collection('packaging').create(data)

export const updatePackaging = (id: string, data: Partial<Packaging>) =>
  pb.collection('packaging').update(id, data)

export const deletePackaging = (id: string) => pb.collection('packaging').delete(id)
