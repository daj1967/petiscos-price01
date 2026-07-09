import { useState, useEffect, useCallback } from 'react'
import { Trash2, Loader2, Search, Package } from 'lucide-react'
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
import { useRealtime } from '@/hooks/use-realtime'
import { getFinalProducts, deleteFinalProduct } from '@/services/final-products'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { ConfirmDeleteDialog } from '@/components/settings/confirm-delete-dialog'
import type { FinalProduct } from '@/types/system'

export default function FinalProducts() {
  const { toast } = useToast()
  const [items, setItems] = useState<FinalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setItems(await getFinalProducts())
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('final_products', () => loadData())

  const filtered = search.trim()
    ? items.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase().trim()) ||
          i.sku.toLowerCase().includes(search.toLowerCase().trim()),
      )
    : items

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteFinalProduct(deleteId)
      toast({ title: 'Produto final excluído!' })
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Produtos Finais</h2>
        <p className="text-muted-foreground">Catálogo de produtos acabados para venda.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge variant="secondary">{items.length} produtos</Badge>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {search ? 'Nenhum produto encontrado.' : 'Nenhum produto final cadastrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Peso Líq.</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((fp) => (
                    <TableRow key={fp.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{fp.sku}</TableCell>
                      <TableCell className="font-medium">{fp.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fp.category || '—'}
                      </TableCell>
                      <TableCell className="text-sm">{fp.sales_channel || '—'}</TableCell>
                      <TableCell className="text-right">{fp.net_weight || 0}g</TableCell>
                      <TableCell className="text-sm">{fp.shelf_life || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(fp.id)}
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
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Produto Final"
        description="Tem certeza? Esta ação não pode ser desfeita."
      />
    </div>
  )
}
