import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Pencil, Trash2, Loader2, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { IngredientDialog } from '@/components/ingredients/ingredient-dialog'
import { ConfirmDeleteDialog } from '@/components/settings/confirm-delete-dialog'

export default function Ingredients() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<IngredientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<IngredientRecord | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setItems(await getIngredients())
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('ingredients', () => {
    loadData()
  })
  useRealtime('purchases', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase().trim()
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || (i.code || '').toLowerCase().includes(q),
    )
  }, [items, search])

  const handleSubmit = async (data: Partial<IngredientRecord>) => {
    if (!user) return
    try {
      if (editing) {
        await updateIngredient(editing.id, data)
        toast({ title: 'Insumo atualizado!' })
      } else {
        await createIngredient({ ...data, user_id: user.id })
        toast({ title: 'Insumo criado!' })
      }
      setEditing(null)
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
      toast({ title: 'Insumo excluído!' })
      setDeleteId(null)
      loadData()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Insumos</h2>
        <p className="text-muted-foreground">
          Cadastro de ingredientes com conversão automática de unidades.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge variant="secondary">{items.length} insumos</Badge>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar insumo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo Insumo
            </Button>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {search ? 'Nenhum insumo encontrado.' : 'Nenhum insumo cadastrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Preço Compra</TableHead>
                    <TableHead className="text-right">Embal.</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((i) => (
                    <TableRow key={i.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{i.code || '—'}</TableCell>
                      <TableCell className="font-medium">{i.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {i.brand || '—'}
                      </TableCell>
                      <TableCell>{i.unit}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(i.buy_price || 0)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {i.package_quantity || 1} {i.buy_unit}
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {formatCurrency(i.cost)}/{i.unit}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={i.status === 'inactive' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {i.status === 'inactive' ? 'Inativo' : 'Ativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditing(i)
                            setDialogOpen(true)
                          }}
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
          )}
        </CardContent>
      </Card>
      <IngredientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        editing={editing}
      />
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Insumo"
        description="Tem certeza? Esta ação não pode ser desfeita."
      />
    </div>
  )
}
