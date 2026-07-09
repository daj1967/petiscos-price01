import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Loader2, Search, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/suppliers'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { ConfirmDeleteDialog } from '@/components/settings/confirm-delete-dialog'
import type { Supplier } from '@/types/system'

const emptyForm = { legal_name: '', trade_name: '', cnpj: '', contact_info: '', payment_terms: '' }

export default function Suppliers() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [items, setItems] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      setItems(await getSuppliers())
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('suppliers', () => loadData())

  const filtered = search.trim()
    ? items.filter(
        (i) =>
          i.legal_name.toLowerCase().includes(search.toLowerCase().trim()) ||
          (i.trade_name || '').toLowerCase().includes(search.toLowerCase().trim()),
      )
    : items

  const openDialog = (s?: Supplier) => {
    setErrors({})
    setEditing(s || null)
    setForm(
      s
        ? {
            legal_name: s.legal_name,
            trade_name: s.trade_name || '',
            cnpj: s.cnpj || '',
            contact_info: s.contact_info || '',
            payment_terms: s.payment_terms || '',
          }
        : emptyForm,
    )
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!user) return
    if (!form.legal_name.trim()) {
      setErrors({ legal_name: 'Razão social é obrigatória' })
      return
    }
    try {
      if (editing) {
        await updateSupplier(editing.id, form)
        toast({ title: 'Fornecedor atualizado!' })
      } else {
        await createSupplier({ ...form, user_id: user.id })
        toast({ title: 'Fornecedor criado!' })
      }
      setDialogOpen(false)
      loadData()
    } catch (err) {
      const fe = extractFieldErrors(err)
      setErrors(fe)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description:
          Object.keys(fe).length > 0 ? Object.values(fe).join(' ') : getErrorMessage(err),
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteSupplier(deleteId)
      toast({ title: 'Fornecedor excluído!' })
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" /> Fornecedores
        </h2>
        <p className="text-muted-foreground">Cadastro de fornecedores e contatos.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Badge variant="secondary">{items.length} fornecedores</Badge>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar fornecedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
            </Button>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Truck className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {search ? 'Nenhum fornecedor encontrado.' : 'Nenhum fornecedor cadastrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cond. Pagamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{s.legal_name}</TableCell>
                      <TableCell>{s.trade_name || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{s.cnpj || '—'}</TableCell>
                      <TableCell className="text-sm">{s.contact_info || '—'}</TableCell>
                      <TableCell className="text-sm">{s.payment_terms || '—'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openDialog(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(s.id)}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Novo'} Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Razão Social *</Label>
              <Input
                value={form.legal_name}
                onChange={(e) => setForm({ ...form, legal_name: e.target.value })}
              />
              {errors.legal_name && <p className="text-xs text-red-500">{errors.legal_name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome Fantasia</Label>
                <Input
                  value={form.trade_name}
                  onChange={(e) => setForm({ ...form, trade_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CNPJ</Label>
                <Input
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contato</Label>
              <Input
                value={form.contact_info}
                onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Condições de Pagamento</Label>
              <Input
                value={form.payment_terms}
                onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editing ? 'Atualizar' : 'Criar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir Fornecedor"
        description="Tem certeza?"
      />
    </div>
  )
}
