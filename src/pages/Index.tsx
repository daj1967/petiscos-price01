import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Package, Boxes, DollarSign, Target, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCalculations, type CalculationRecord } from '@/services/calculations'
import { getIngredients } from '@/services/ingredients'
import { getBaseProducts } from '@/services/base-products'
import { getFinalProducts } from '@/services/final-products'
import { formatCurrency } from '@/lib/utils'

export default function Index() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    ingredients: 0,
    baseProducts: 0,
    finalProducts: 0,
    calculations: 0,
  })
  const [recent, setRecent] = useState<CalculationRecord[]>([])

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const [ings, bps, fps, calcs] = await Promise.all([
        getIngredients(),
        getBaseProducts(),
        getFinalProducts(),
        getCalculations(user.id),
      ])
      setStats({
        ingredients: ings.length,
        baseProducts: bps.length,
        finalProducts: fps.length,
        calculations: calcs.length,
      })
      setRecent(calcs.slice(0, 5))
    } catch {
      // silent fail on dashboard
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('calculations', () => loadData())
  useRealtime('ingredients', () => loadData())

  const avgMargin = recent.length > 0 ? recent.reduce((s, r) => s + r.markup, 0) / recent.length : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está o resumo da sua operação.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/final-products">Ver Produtos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/reports">Relatórios</Link>
          </Button>
          <Button asChild>
            <Link to="/calculator">Nova Precificação</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insumos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ingredients}</div>
            <p className="text-xs text-muted-foreground">ingredientes cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Base</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.baseProducts}</div>
            <p className="text-xs text-muted-foreground">receitas base</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Finais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.finalProducts}</div>
            <p className="text-xs text-muted-foreground">produtos para venda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stats.calculations} cálculos salvos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Cálculos</CardTitle>
          <CardDescription>Precificações recentes salvas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-3">Nenhum cálculo salvo ainda.</p>
              <Button asChild>
                <Link to="/calculator">Criar primeira precificação</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.map((r) => {
                const profit = r.final_price - r.total_cost
                const profitPct = r.total_cost > 0 ? (profit / r.total_cost) * 100 : 0
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{r.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(r.total_cost)} → {formatCurrency(r.final_price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">{formatCurrency(profit)}</p>
                        <p className="text-xs text-muted-foreground">
                          {profitPct.toFixed(1)}% margem
                        </p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
