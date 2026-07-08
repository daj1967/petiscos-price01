import { useParams, Navigate, Link } from 'react-router-dom'
import { ArrowLeft, ChefHat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DatabaseNotice } from '@/components/database-notice'
import { formatCurrency } from '@/lib/utils'
import { mockRecipes } from '@/data/mock-recipes'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const recipe = mockRecipes.find((r) => r.id === id)

  if (!recipe) {
    return <Navigate to="/recipes" replace />
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/recipes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            {recipe.productName}
          </h2>
          <p className="text-muted-foreground">Ficha Técnica - Composição de custos</p>
        </div>
      </div>

      <DatabaseNotice />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Custo por Kg</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(recipe.costPerKg)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{recipe.yieldKg} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Porções ({recipe.portionWeightGrams}g)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{recipe.portionCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Ingredientes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(recipe.totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingredientes</CardTitle>
          <CardDescription>
            Composição percentual e custo por kg de produto acabado.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Ingrediente</TableHead>
                  <TableHead className="text-right">Qtde ({recipe.unit})</TableHead>
                  <TableHead className="text-right">Preço (R$)</TableHead>
                  <TableHead className="text-right">Valor (R$)</TableHead>
                  <TableHead className="text-right">% Kg</TableHead>
                  <TableHead className="text-right">% R$</TableHead>
                  <TableHead className="text-right">Qtde/1kg</TableHead>
                  <TableHead className="text-right">Custo/1kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipe.ingredients.map((ing) => (
                  <TableRow key={ing.item} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">{ing.item}</TableCell>
                    <TableCell className="font-medium">{ing.name}</TableCell>
                    <TableCell className="text-right">{ing.quantityKg.toFixed(3)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ing.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ing.value)}</TableCell>
                    <TableCell className="text-right">
                      {(ing.percentKg * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {(ing.percentValue * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right">{ing.qtyPerKg.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(ing.costPerKg)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 font-bold bg-muted/30">
                  <TableCell colSpan={2}>TOTAL</TableCell>
                  <TableCell className="text-right">{recipe.totalKg.toFixed(3)}</TableCell>
                  <TableCell />
                  <TableCell className="text-right">{formatCurrency(recipe.totalValue)}</TableCell>
                  <TableCell colSpan={2} />
                  <TableCell className="text-right">
                    {recipe.ingredients.reduce((s, i) => s + i.qtyPerKg, 0).toFixed(4)}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {formatCurrency(recipe.costPerKg)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-sm">
          Rendimento: {recipe.yieldKg} kg | {recipe.portionCount} porções de{' '}
          {recipe.portionWeightGrams}g
        </Badge>
        <Button asChild>
          <Link to="/calculator">Calcular Preço de Venda</Link>
        </Button>
      </div>
    </div>
  )
}
