import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  type IngredientRecord,
} from '@/services/ingredients'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'

export function IngredientsManager() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<IngredientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [prevCost, setPrevCost] = useState(0)
  const [formData, setFormData] = useState({ name: '', unit: 'kg', cost: 0 })

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const data = await getIngredients(user.id)
      setItems(data)
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('ingredients', () => {
    loadData()
  })

  const openCreate = () => {
    setEditingId(null)
    setFormData({ name: '', unit: 'kg', cost: 0 })
    setDialogOpen(true)
  }

  const openEdit = (i: IngredientRecord) => {
    setEditingId(i.id)
    setPrevCost(i.cost)
    setFormData({ name: i.name, unit: i.unit || 'kg', cost: i.cost })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!user) return
    try {
      if (editingId) {
        await updateIngredient(editingId, { ...formData })
        if (formData.cost !== prevCost) {
          toast({
            title: 'Ingrediente atualizado!',
            description: 'Custo alterado. Verifique fichas técnicas relacionadas.',
          })
        } else {
          toast({ title: 'Ingrediente atualizado!' })
        }
      } else {
        await createIngredient({ ...formData, user_id: user.id })
        toast({ title: 'Ingrediente criado!' })
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
      await deleteIngredient(deleteId)
      toast({ title: 'Ingrediente excluído!' })
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
          <Badge variant="secondary">{items.length} ingredientes</Badge>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Ingrediente
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Custo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => (
                <TableRow key={i.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell>{i.unit}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(i.cost)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(i)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(i.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>{editingId ? 'Editar Ingrediente' : 'Novo Ingrediente'}</DialogTitle>
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
              <Label>Unidade</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg, g, L, un..."
              />
            </div>
            <div className="space-y-2">
              <Label>Custo (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                }
              />
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
        title="Excluir Ingrediente"
        description="Tem certeza? Esta ação não pode ser desfeita."
      />
    </Card>
  )
}
