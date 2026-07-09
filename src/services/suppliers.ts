import pb from '@/lib/pocketbase/client'
import type { Supplier } from '@/types/system'

export const getSuppliers = () =>
  pb.collection('suppliers').getFullList({ sort: '-created' }) as Promise<Supplier[]>

export const getSupplier = (id: string) =>
  pb.collection('suppliers').getOne(id) as Promise<Supplier>

export const createSupplier = (data: Partial<Supplier>) => pb.collection('suppliers').create(data)

export const updateSupplier = (id: string, data: Partial<Supplier>) =>
  pb.collection('suppliers').update(id, data)

export const deleteSupplier = (id: string) => pb.collection('suppliers').delete(id)
