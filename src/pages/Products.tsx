import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react'
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
import { formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'

const mockProducts = [
  {
    id: '1',
    sku: 'PF-001',
    name: 'Pão de Forma Tradicional',
    category: 'Padaria',
    cost: 3.5,
    price: 6.2,
    margin: 43.5,
    status: 'active',
  },
  {
    id: '2',
    sku: 'QM-500',
    name: 'Queijo Muçarela 500g',
    category: 'Laticínios',
    cost: 14.8,
    price: 21.5,
    margin: 31.1,
    status: 'active',
  },
  {
    id: '3',
    sku: 'IN-001',
    name: 'Iogurte Natural',
    category: 'Laticínios',
    cost: 1.8,
    price: 3.5,
    margin: 48.5,
    status: 'active',
  },
  {
    id: '4',
    sku: 'BC-001',
    name: 'Bolo de Chocolate',
    category: 'Padaria',
    cost: 8.5,
    price: 16.5,
    margin: 48.4,
    status: 'active',
  },
  {
    id: '5',
    sku: 'ME-200',
    name: 'Manteiga Extra 200g',
    category: 'Laticínios',
    cost: 6.2,
    price: 9.8,
    margin: 36.7,
    status: 'active',
  },
  {
    id: '6',
    sku: 'FR-001',
    name: 'Frango Inteiro Congelado',
    category: 'Carnes',
    cost: 11.5,
    price: 14.9,
    margin: 22.8,
    status: 'review',
  },
  {
    id: '7',
    sku: 'LS-001',
    name: 'Linguiça Suína 500g',
    category: 'Carnes',
    cost: 9.0,
    price: 12.5,
    margin: 28.0,
    status: 'active',
  },
  {
    id: '8',
    sku: 'PM-001',
    name: 'Pão de Mel com Doce de Leite',
    category: 'Doces',
    cost: 1.2,
    price: 3.5,
    margin: 65.7,
    status: 'inactive',
  },
]

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getMarginBadge = (margin: number, status: string) => {
    if (status === 'inactive')
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Inativo
        </Badge>
      )
    if (margin >= 40)
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white">
          Alta ({margin}%)
        </Badge>
      )
    if (margin < 25) return <Badge variant="destructive">Baixa ({margin}%)</Badge>
    return <Badge variant="secondary">Média ({margin}%)</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Gestão de Produtos</h2>
          <p className="text-muted-foreground">Gerencie o catálogo e acompanhe as margens.</p>
        </div>
        <Button asChild>
          <Link to="/calculator">
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Link>
        </Button>
      </div>

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
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Custo Total</TableHead>
                  <TableHead className="text-right">Preço Venda</TableHead>
                  <TableHead className="text-center">Margem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-700">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-slate-600 bg-white">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(product.cost)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getMarginBadge(product.margin, product.status)}
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
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/calculator">Revisar Preço</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Inativar Produto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
