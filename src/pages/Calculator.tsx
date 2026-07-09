import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  createCalculation,
  updateCalculation,
  getCalculation,
  getCalculations,
  type CalculationRecord,
} from '@/services/calculations'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { formatCurrency } from '@/lib/utils'
import { CalculatorForm } from '@/components/calculator-form'
import { CalculatorSummary } from '@/components/calculator-summary'
import { defaultProduct } from '@/data/mock-products'
import { calculateAll } from '@/lib/pricing-engine'
import type { ProductPricing } from '@/lib/pricing-types'

export default function Calculator() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [form, setForm] = useState<ProductPricing>(defaultProduct)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savedCalculations, setSavedCalculations] = useState<CalculationRecord[]>([])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const result = useMemo(() => calculateAll(form), [form])

  useEffect(() => {
    if (!user) return
    getCalculations(user.id)
      .then(setSavedCalculations)
      .catch(() => {})
  }, [user])

  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId) return
    getCalculation(editId)
      .then((record) => {
        const data = record.ingredients_list as ProductPricing | null
        if (data) {
          setForm({ ...data })
          setEditingId(record.id)
        }
      })
      .catch(() => {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar o cálculo.',
        })
      })
  }, [searchParams, toast])

  const update = (field: keyof ProductPricing, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const loadProduct = (calcId: string) => {
    const calc = savedCalculations.find((c) => c.id === calcId)
    if (calc) {
      const data = calc.ingredients_list as ProductPricing | null
      if (data) {
        setForm({ ...data })
        setEditingId(calc.id)
      }
    }
  }

  const handleNew = () => {
    setForm({ ...defaultProduct })
    setEditingId(null)
    navigate('/calculator')
  }

  const handleSave = async () => {
    if (!form.name) {
      toast({
        variant: 'destructive',
        title: 'Nome obrigatório',
        description: 'Insira o nome do produto.',
      })
      return
    }
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Não autenticado',
        description: 'Faça login para salvar dados de precificação.',
      })
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        product_name: form.name,
        total_cost: result.totalCost,
        markup: form.profitPct,
        final_price: result.priceWithIcmsSt,
        ingredients_list: { ...form },
        user_id: user.id,
      }
      if (editingId) {
        await updateCalculation(editingId, payload)
        toast({
          title: 'Preço Atualizado!',
          description: `${form.name}: ${formatCurrency(result.priceWithIcmsSt)} (c/ ICMS-ST)`,
        })
      } else {
        const created = await createCalculation(payload)
        setEditingId(created.id)
        toast({
          title: 'Preço Salvo!',
          description: `${form.name}: ${formatCurrency(result.priceWithIcmsSt)} (c/ ICMS-ST)`,
        })
      }
    } catch (err) {
      const errors = extractFieldErrors(err)
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description:
          Object.keys(errors).length > 0 ? Object.values(errors).join(' ') : getErrorMessage(err),
      })
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Calculadora de Preços
          </h2>
          <p className="text-muted-foreground">Simule custos, margens e tributos para o varejo.</p>
        </div>
        {editingId && (
          <Button variant="outline" onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Carregar Cálculo Salvo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Selecione um cálculo salvo para editar
            </Label>
            <Select onValueChange={loadProduct}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Produto..." />
              </SelectTrigger>
              <SelectContent>
                {savedCalculations.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <CalculatorForm form={form} update={update} />
        </div>
        <div className="md:col-span-4">
          <CalculatorSummary
            result={result}
            form={form}
            onSave={handleSave}
            isSaving={isSaving}
            isEditing={!!editingId}
          />
        </div>
      </div>

      <div className="flex justify-center md:hidden">
        <Button asChild variant="outline">
          <Link to="/products">Voltar para Produtos</Link>
        </Button>
      </div>
    </div>
  )
}
