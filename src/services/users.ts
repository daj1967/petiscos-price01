import pb from '@/lib/pocketbase/client'

export interface UserRecord {
  id: string
  email: string
  name: string
  role: string
  created: string
  updated: string
}

export interface CreateUserData {
  email: string
  password: string
  passwordConfirm: string
  name?: string
  role?: string
}

export interface UpdateUserData {
  name?: string
  role?: string
  email?: string
  password?: string
  passwordConfirm?: string
}

export function getUsers() {
  return pb.collection('users').getFullList<UserRecord>({ sort: 'created' })
}

export function createUser(data: CreateUserData) {
  return pb.collection('users').create<UserRecord>(data)
}

export function updateUser(id: string, data: UpdateUserData) {
  return pb.collection('users').update<UserRecord>(id, data)
}

export function deleteUser(id: string) {
  return pb.collection('users').delete(id)
}
