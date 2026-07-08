import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getIngredients, type IngredientRecord } from '@/services/ingredients'
import {
  createCalculation,
  updateCalculation,
  type CalculationRecord,
} from '@/services/calculations'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import {
  type RecipeIngredientItem,
  type RecipeData,
  calculateIngredientSubtotal,
  calculateRecipeTotalCost,
  calculateRecipeFinalPrice,
} from '@/lib/recipe-types'
import { RecipeIngredientTable } from './recipe-ingredient-table'

interface Props {
  record?: CalculationRecord | null
}

export function RecipeEditor({ record }: Props) {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState<IngredientRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [productName, setProductName] = useState('')
  const [markup, setMarkup] = useState(50)
  const [items, setItems] = useState<RecipeIngredientItem[]>([])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      setIngredients(await getIngredients(user.id))
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

  useEffect(() => {
    if (record) {
      setProductName(record.product_name)
      setMarkup(record.markup)
      const data = record.ingredients_list as RecipeData | null
      if (data?.ingredients) setItems(data.ingredients)
    }
  }, [record])

  const totalCost = useMemo(() => calculateRecipeTotalCost(items), [items])
  const finalPrice = useMemo(
    () => calculateRecipeFinalPrice(totalCost, markup),
    [totalCost, markup],
  )

  const handleAdd = (item: RecipeIngredientItem) => setItems((prev) => [...prev, item])

  const handleQuantityChange = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.ingredientId === id
          ? {
              ...i,
              quantity: Math.max(0, qty),
              subtotal: calculateIngredientSubtotal(i.unitCost, Math.max(0, qty)),
            }
          : i,
      ),
    )

  const handleRemove = (id: string) => setItems((prev) => prev.filter((i) => i.ingredientId !== id))

  const handleRefreshCosts = () => {
    setItems((prev) =>
      prev.map((item) => {
        const ing = ingredients.find((i) => i.id === item.ingredientId)
        if (!ing) return item
        return {
          ...item,
          unitCost: ing.cost,
          subtotal: calculateIngredientSubtotal(ing.cost, item.quantity),
        }
      }),
    )
    toast({ title: 'Custos atualizados!' })
  }

  const handleSave = async () => {
    if (!user) return
    if (!productName.trim()) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Informe o nome do produto.' })
      return
    }
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Adicione pelo menos um ingrediente.',
      })
      return
    }
    setSaving(true)
    try {
      const payload = {
        product_name: productName.trim(),
        total_cost: totalCost,
        markup,
        final_price: finalPrice,
        ingredients_list: { ingredients: items } as RecipeData,
        user_id: user.id,
      }
      if (record) {
        await updateCalculation(record.id, payload)
        toast({ title: 'Ficha técnica atualizada!' })
      } else {
        await createCalculation(payload)
        toast({ title: 'Ficha técnica criada!' })
      }
      navigate('/recipes')
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro', description: getErrorMessage(err) })
    } finally {
      setSaving(false)
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/recipes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            {record ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
          </h2>
          <p className="text-muted-foreground">
            {record
              ? record.product_name
              : 'Crie uma ficha técnica com ingredientes do seu cadastro'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome do Produto</Label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: Coxinha de Frango"
            />
          </div>
          <div className="space-y-2">
            <Label>Margem de Lucro (%)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={markup}
              onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ingredientes</CardTitle>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground mb-3">Nenhum ingrediente cadastrado.</p>
              <Button variant="outline" onClick={() => navigate('/settings')}>
                Ir para cadastro de ingredientes
              </Button>
            </div>
          ) : (
            <RecipeIngredientTable
              items={items}
              ingredients={ingredients}
              onAdd={handleAdd}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemove}
              onRefreshCosts={handleRefreshCosts}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo de Precificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Margem</p>
              <p className="text-2xl font-bold">{markup.toFixed(1)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Preço Final</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(finalPrice)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/recipes')}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {record ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
