import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Shield, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type UserRecord,
  type UpdateUserData,
} from '@/services/users'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'

export function UsersManager() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'User' })

  const loadData = useCallback(async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('users', () => {
    loadData()
  })

  const openCreate = () => {
    setEditingId(null)
    setFormData({ name: '', email: '', password: '', role: 'User' })
    setDialogOpen(true)
  }

  const openEdit = (u: UserRecord) => {
    setEditingId(u.id)
    setFormData({ name: u.name || '', email: u.email, password: '', role: u.role || 'User' })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const data: UpdateUserData = {
          name: formData.name,
          role: formData.role,
          email: formData.email,
        }
        if (formData.password) {
          data.password = formData.password
          data.passwordConfirm = formData.password
        }
        await updateUser(editingId, data)
        toast({ title: 'Usuário atualizado!' })
      } else {
        await createUser({ ...formData, passwordConfirm: formData.password })
        toast({ title: 'Usuário criado!' })
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const errors = extractFieldErrors(err)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          Object.keys(errors).length > 0 ? Object.values(errors).join(' ') : getErrorMessage(err),
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteUser(deleteId)
      toast({ title: 'Usuário excluído!' })
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <Badge variant="secondary">{users.length} usuários</Badge>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{u.name || '-'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'Admin' ? 'default' : 'secondary'}>
                      {u.role === 'Admin' ? (
                        <Shield className="mr-1 h-3 w-3" />
                      ) : (
                        <UserIcon className="mr-1 h-3 w-3" />
                      )}
                      {u.role || 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(u)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {u.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{editingId ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingId ? '••••••••' : 'Mínimo 8 caracteres'}
              />
            </div>
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{editingId ? 'Atualizar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Usuário"
        description="Tem certeza? Esta ação não pode ser desfeita."
      />
    </Card>
  )
}
