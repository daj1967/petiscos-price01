import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
import { formatCurrency } from '@/lib/utils'
import { CalculatorForm } from '@/components/calculator-form'
import { CalculatorSummary } from '@/components/calculator-summary'
import { mockProducts, defaultProduct } from '@/data/mock-products'
import { calculateAll } from '@/lib/pricing-engine'
import type { ProductPricing } from '@/lib/pricing-types'

export default function Calculator() {
  const { toast } = useToast()
  const [form, setForm] = useState<ProductPricing>(defaultProduct)
  const result = useMemo(() => calculateAll(form), [form])

  const update = (field: keyof ProductPricing, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const loadProduct = (productId: string) => {
    const product = mockProducts.find((p) => p.id === productId)
    if (product) setForm({ ...product })
  }

  const handleSave = () => {
    if (!form.name) {
      toast({
        variant: 'destructive',
        title: 'Nome obrigatório',
        description: 'Insira o nome do produto.',
      })
      return
    }
    toast({
      title: 'Preço Salvo!',
      description: `${form.name}: ${formatCurrency(result.priceWithIcmsSt)} (c/ ICMS-ST)`,
    })
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Carregar Produto Existente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Selecione um produto para editar
            </Label>
            <Select onValueChange={loadProduct}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Produto..." />
              </SelectTrigger>
              <SelectContent>
                {mockProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
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
          <CalculatorSummary result={result} form={form} onSave={handleSave} />
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
