import { useState } from 'react'
import { Plus, Search, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DatabaseNotice } from '@/components/database-notice'
import { formatCurrency } from '@/lib/utils'
import { mockProducts } from '@/data/mock-products'
import { calculateAll } from '@/lib/pricing-engine'

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Gestão de Produtos</h2>
          <p className="text-muted-foreground">Catálogo, custos e precificação de varejo.</p>
        </div>
        <Button asChild>
          <Link to="/calculator">
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Link>
        </Button>
      </div>

      <DatabaseNotice />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por SKU ou Nome..."
                className="pl-8 bg-muted/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">{filtered.length} produtos</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Peso (g)</TableHead>
                  <TableHead className="text-right">Unid./Fardo</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                  <TableHead className="text-right">Preço c/ ICMS-ST</TableHead>
                  <TableHead className="text-right">Preço Unid.</TableHead>
                  <TableHead className="text-right">Preço Sugerido</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((product) => {
                    const r = calculateAll(product)
                    return (
                      <TableRow
                        key={product.id}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-700">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.weightGrams}</TableCell>
                        <TableCell className="text-right">{product.unitsPerPack}</TableCell>
                        <TableCell className="text-right">{formatCurrency(r.totalCost)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(r.priceWithIcmsSt)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(r.unitPrice)}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(r.suggestedPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="sr-only">Abrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              {product.recipeId && (
                                <DropdownMenuItem asChild>
                                  <Link to={`/recipe/${product.recipeId}`}>Ver Ficha Técnica</Link>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link to="/calculator">Calcular Preço</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Inativar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
