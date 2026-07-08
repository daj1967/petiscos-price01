import { useState } from 'react'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import {
  type RecipeIngredientItem,
  calculateIngredientSubtotal,
  calculateRecipeTotalCost,
} from '@/lib/recipe-types'
import type { IngredientRecord } from '@/services/ingredients'

interface Props {
  items: RecipeIngredientItem[]
  ingredients: IngredientRecord[]
  onAdd: (item: RecipeIngredientItem) => void
  onQuantityChange: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onRefreshCosts: () => void
}

export function RecipeIngredientTable({
  items,
  ingredients,
  onAdd,
  onQuantityChange,
  onRemove,
  onRefreshCosts,
}: Props) {
  const [selectedId, setSelectedId] = useState('')
  const available = ingredients.filter((i) => !items.some((r) => r.ingredientId === i.id))
  const totalCost = calculateRecipeTotalCost(items)

  const handleAdd = () => {
    const ing = ingredients.find((i) => i.id === selectedId)
    if (!ing) return
    onAdd({
      ingredientId: ing.id,
      name: ing.name,
      unit: ing.unit || 'kg',
      unitCost: ing.cost,
      quantity: 1,
      subtotal: calculateIngredientSubtotal(ing.cost, 1),
    })
    setSelectedId('')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={selectedId || undefined} onValueChange={setSelectedId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione um ingrediente..." />
          </SelectTrigger>
          <SelectContent>
            {available.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Nenhum ingrediente disponível
              </div>
            ) : (
              available.map((ing) => (
                <SelectItem key={ing.id} value={ing.id}>
                  {ing.name} — {formatCurrency(ing.cost)}/{ing.unit || 'kg'}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={!selectedId}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar
        </Button>
        <Button variant="outline" onClick={onRefreshCosts}>
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
        </Button>
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Custo Unit.</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Sub-total</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.ingredientId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantityChange(item.ingredientId, parseFloat(e.target.value) || 0)
                      }
                      className="w-24 h-8 text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onRemove(item.ingredientId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 font-bold bg-muted/30">
                <TableCell colSpan={4}>CUSTO TOTAL</TableCell>
                <TableCell className="text-right text-primary">
                  {formatCurrency(totalCost)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
