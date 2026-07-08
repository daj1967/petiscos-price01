import { useState, useMemo } from 'react'
import { Calculator as CalcIcon, Save, Download } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'

export default function Calculator() {
  const { toast } = useToast()

  // Form State
  const [productName, setProductName] = useState('')
  const [rawMaterial, setRawMaterial] = useState('0')
  const [packaging, setPackaging] = useState('0')
  const [labor, setLabor] = useState('0')

  const [taxICMS, setTaxICMS] = useState('18')
  const [taxPIS, setTaxPIS] = useState('9.25')
  const [freight, setFreight] = useState('0')

  const [targetMargin, setTargetMargin] = useState('30')

  // Calculated values
  const costMaterial = parseFloat(rawMaterial) || 0
  const costPackaging = parseFloat(packaging) || 0
  const costLabor = parseFloat(labor) || 0
  const totalCost = costMaterial + costPackaging + costLabor + (parseFloat(freight) || 0)

  const taxTotalPercent = (parseFloat(taxICMS) || 0) + (parseFloat(taxPIS) || 0)
  const marginPercent = parseFloat(targetMargin) || 0

  // Markup calculation: Price = Cost / (1 - Taxes% - Margin%)
  const denominator = 1 - taxTotalPercent / 100 - marginPercent / 100

  const suggestedPrice = useMemo(() => {
    if (denominator <= 0 || totalCost === 0) return 0
    return totalCost / denominator
  }, [totalCost, denominator])

  const breakEven = useMemo(() => {
    const beDenominator = 1 - taxTotalPercent / 100
    if (beDenominator <= 0 || totalCost === 0) return 0
    return totalCost / beDenominator
  }, [totalCost, taxTotalPercent])

  const grossProfit = suggestedPrice - totalCost - suggestedPrice * (taxTotalPercent / 100)

  const handleSave = () => {
    if (!productName) {
      toast({
        variant: 'destructive',
        title: 'Nome obrigatório',
        description: 'Por favor, insira o nome do produto antes de salvar.',
      })
      return
    }

    toast({
      title: 'Preço Salvo com Sucesso!',
      description: `${productName} foi atualizado com o preço sugerido de ${formatCurrency(suggestedPrice)}.`,
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Calculadora de Preços
          </h2>
          <p className="text-muted-foreground">
            Simule custos e impostos para encontrar o preço ideal de varejo.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="product-name">Nome do Produto</Label>
                <Input
                  id="product-name"
                  placeholder="Ex: Pão de Queijo 1kg"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="costs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="costs">1. Custos Diretos</TabsTrigger>
              <TabsTrigger value="taxes">2. Impostos & Logística</TabsTrigger>
              <TabsTrigger value="margin">3. Margem Alvo</TabsTrigger>
            </TabsList>

            <TabsContent value="costs">
              <Card>
                <CardHeader>
                  <CardTitle>Custos de Produção</CardTitle>
                  <CardDescription>
                    Insira os custos diretos para produzir uma unidade de venda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="raw-material">Matéria-Prima (R$)</Label>
                      <Input
                        id="raw-material"
                        type="number"
                        min="0"
                        step="0.01"
                        value={rawMaterial}
                        onChange={(e) => setRawMaterial(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packaging">Embalagem (R$)</Label>
                      <Input
                        id="packaging"
                        type="number"
                        min="0"
                        step="0.01"
                        value={packaging}
                        onChange={(e) => setPackaging(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="labor">Mão de Obra (R$)</Label>
                      <Input
                        id="labor"
                        type="number"
                        min="0"
                        step="0.01"
                        value={labor}
                        onChange={(e) => setLabor(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="taxes">
              <Card>
                <CardHeader>
                  <CardTitle>Impostos e Logística</CardTitle>
                  <CardDescription>
                    Configure a carga tributária e custos de frete aplicáveis.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax-icms">ICMS (%)</Label>
                      <Input
                        id="tax-icms"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxICMS}
                        onChange={(e) => setTaxICMS(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax-pis">PIS/COFINS (%)</Label>
                      <Input
                        id="tax-pis"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={taxPIS}
                        onChange={(e) => setTaxPIS(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="freight">Frete Unitário (R$)</Label>
                      <Input
                        id="freight"
                        type="number"
                        min="0"
                        step="0.01"
                        value={freight}
                        onChange={(e) => setFreight(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="margin">
              <Card>
                <CardHeader>
                  <CardTitle>Margem de Lucro</CardTitle>
                  <CardDescription>
                    Defina a margem líquida desejada sobre o preço de venda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-margin">Margem Desejada (%)</Label>
                      <Input
                        id="target-margin"
                        type="number"
                        min="0"
                        max="99"
                        step="0.1"
                        value={targetMargin}
                        onChange={(e) => setTargetMargin(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Margem calculada "por dentro" (Markup divisor)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="md:col-span-4 relative">
          <Card className="sticky top-24 border-primary/20 shadow-elevation overflow-hidden">
            <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <CalcIcon className="w-5 h-5" />
                Resumo da Precificação
              </h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Preço de Venda Sugerido</p>
                {denominator <= 0 ? (
                  <p className="text-xl font-bold text-destructive">Margem/Impostos inválidos</p>
                ) : (
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(suggestedPrice)}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo Total (CPV):</span>
                  <span className="font-medium">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Impostos Totais ({taxTotalPercent}%):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(suggestedPrice * (taxTotalPercent / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lucro Bruto:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground font-medium">Ponto de Equilíbrio:</span>
                  <span className="font-medium">{formatCurrency(breakEven)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 gap-2 flex-col sm:flex-row border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast({ description: 'Relatório PDF gerado' })}
              >
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
              <Button className="w-full" onClick={handleSave} disabled={denominator <= 0}>
                <Save className="mr-2 h-4 w-4" /> Salvar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
