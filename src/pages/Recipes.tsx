import { Link } from 'react-router-dom'
import { ChefHat, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DatabaseNotice } from '@/components/database-notice'
import { formatCurrency } from '@/lib/utils'
import { mockRecipes } from '@/data/mock-recipes'

export default function Recipes() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Fichas Técnicas</h2>
        <p className="text-muted-foreground">Receitas e composição de custos por kg de produto.</p>
      </div>

      <DatabaseNotice />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockRecipes.map((recipe) => (
          <Link to={`/recipe/${recipe.id}`} key={recipe.id}>
            <Card className="hover:shadow-elevation transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      {recipe.productName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {recipe.portionCount} porções de {recipe.portionWeightGrams}g
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo por Kg:</span>
                  <span className="font-bold text-primary">{formatCurrency(recipe.costPerKg)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rendimento:</span>
                  <span className="font-medium">{recipe.yieldKg} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ingredientes:</span>
                  <span className="font-medium">{recipe.ingredients.length} itens</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
