import { TrendingUp, TrendingDown, Package, DollarSign, Target, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatCurrency } from '@/lib/utils'

const chartData = [
  { month: 'Jan', cost: 12000, price: 18000 },
  { month: 'Fev', cost: 12500, price: 18000 },
  { month: 'Mar', cost: 13000, price: 19500 },
  { month: 'Abr', cost: 12800, price: 19500 },
  { month: 'Mai', cost: 13500, price: 21000 },
  { month: 'Jun', cost: 14000, price: 21000 },
]

const recentChanges = [
  {
    id: 1,
    name: 'Pão de Forma Tradicional',
    oldPrice: 5.5,
    newPrice: 6.2,
    trend: 'up',
    date: 'Hoje',
  },
  {
    id: 2,
    name: 'Queijo Muçarela 500g',
    oldPrice: 22.0,
    newPrice: 21.5,
    trend: 'down',
    date: 'Ontem',
  },
  {
    id: 3,
    name: 'Iogurte Natural',
    oldPrice: 3.2,
    newPrice: 3.5,
    trend: 'up',
    date: '2 dias atrás',
  },
  {
    id: 4,
    name: 'Bolo de Chocolate',
    oldPrice: 15.0,
    newPrice: 16.5,
    trend: 'up',
    date: '3 dias atrás',
  },
  {
    id: 5,
    name: 'Manteiga Extra 200g',
    oldPrice: 9.8,
    newPrice: 9.8,
    trend: 'neutral',
    date: '5 dias atrás',
  },
]

export default function Index() {
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
            <Link to="/products">Ver Produtos</Link>
          </Button>
          <Button asChild>
            <Link to="/calculator">Nova Precificação</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+4</span> adicionados este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+2.1%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categoria Mais Rentável</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Laticínios</div>
            <p className="text-xs text-muted-foreground">42% de margem média</p>
          </CardContent>
        </Card>
        <Card className="border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revisões Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">12</div>
            <p className="text-xs text-muted-foreground">Produtos abaixo da margem alvo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Visão de Mercado (6 Meses)</CardTitle>
            <CardDescription>
              Comparativo entre custos de produção e preços de venda médios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  cost: { label: 'Custo Médio', color: 'hsl(var(--muted-foreground))' },
                  price: { label: 'Preço Médio Venda', color: 'hsl(var(--primary))' },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$${value / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="cost"
                      name="Custo Médio"
                      fill="var(--color-cost)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="price"
                      name="Preço Venda"
                      fill="var(--color-price)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Últimas Atualizações</CardTitle>
            <CardDescription>Mudanças de preço recentes em seu catálogo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentChanges.map((change) => (
                <div key={change.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{change.name}</p>
                    <p className="text-xs text-muted-foreground">{change.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(change.newPrice)}</p>
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(change.oldPrice)}
                      </p>
                    </div>
                    {change.trend === 'up' && <TrendingUp className="h-4 w-4 text-destructive" />}
                    {change.trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-emerald-500" />
                    )}
                    {change.trend === 'neutral' && (
                      <div className="h-4 w-4 text-muted-foreground flex items-center justify-center">
                        -
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
