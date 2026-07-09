import pb from '@/lib/pocketbase/client'
import type { AuditLog } from '@/types/system'

export const getAuditLogs = (limit: number = 50) =>
  pb.collection('audit_logs').getFullList({
    sort: '-created',
    expand: 'user_id',
    perPage: limit,
  }) as Promise<AuditLog[]>
