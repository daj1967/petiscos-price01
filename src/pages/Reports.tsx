import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, FileText, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { ColumnToggle, type ColumnConfig } from '@/components/column-toggle'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getCalculations, type CalculationRecord } from '@/services/calculations'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const columnConfig: ColumnConfig[] = [
  { key: 'created', label: 'Data' },
  { key: 'product_name', label: 'Produto' },
  { key: 'total_cost', label: 'Custo Total' },
  { key: 'markup', label: 'Margem' },
  { key: 'final_price', label: 'Preço Final' },
  { key: 'profit', label: 'Lucro' },
]

export default function Reports() {
  const { user } = useAuth()
  const [records, setRecords] = useState<CalculationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({})

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const data = await getCalculations(user.id)
      setRecords(data)
      setError(null)
    } catch (err) {
      const msg = getErrorMessage(err)
      setError(msg.includes('Failed') ? 'Não foi possível conectar ao servidor.' : msg)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('calculations', () => {
    loadData()
  })

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = r.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      const d = new Date(r.created)
      const matchesStart = !startDate || d >= new Date(startDate)
      const matchesEnd = !endDate || d <= new Date(endDate + 'T23:59:59')
      return matchesSearch && matchesStart && matchesEnd
    })
  }, [records, searchTerm, startDate, endDate])

  const totalProfit = useMemo(
    () => filtered.reduce((s, r) => s + (r.final_price - r.total_cost), 0),
    [filtered],
  )
  const avgMargin = useMemo(
    () => (filtered.length ? filtered.reduce((s, r) => s + r.markup, 0) / filtered.length : 0),
    [filtered],
  )

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  const vis = (key: string) => visibleColumns[key] !== false
  const visibleCount = columnConfig.filter((c) => vis(c.key)).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Relatórios</h2>
          <p className="text-muted-foreground">Análise de margens e lista de preços cadastrados.</p>
        </div>
        <div className="flex gap-2">
          <ColumnToggle
            columns={columnConfig}
            visible={visibleColumns}
            onChange={(k, v) => setVisibleColumns((p) => ({ ...p, [k]: v }))}
          />
          <Button variant="outline" disabled={filtered.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filtered.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgMargin * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre por nome do produto ou período.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do produto..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-40"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <Badge variant="secondary">{filtered.length} registros</Badge>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {vis('created') && <TableHead>Data</TableHead>}
                  {vis('product_name') && <TableHead>Produto</TableHead>}
                  {vis('total_cost') && <TableHead className="text-right">Custo Total</TableHead>}
                  {vis('markup') && <TableHead className="text-right">Margem</TableHead>}
                  {vis('final_price') && <TableHead className="text-right">Preço Final</TableHead>}
                  {vis('profit') && <TableHead className="text-right">Lucro</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={visibleCount} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={visibleCount} className="h-32 text-center text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleCount}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                      {vis('created') && (
                        <TableCell className="text-sm text-muted-foreground">
                          {fmtDate(r.created)}
                        </TableCell>
                      )}
                      {vis('product_name') && (
                        <TableCell className="font-medium">{r.product_name}</TableCell>
                      )}
                      {vis('total_cost') && (
                        <TableCell className="text-right">{formatCurrency(r.total_cost)}</TableCell>
                      )}
                      {vis('markup') && (
                        <TableCell className="text-right">{(r.markup * 100).toFixed(1)}%</TableCell>
                      )}
                      {vis('final_price') && (
                        <TableCell className="text-right font-medium">
                          {formatCurrency(r.final_price)}
                        </TableCell>
                      )}
                      {vis('profit') && (
                        <TableCell className="text-right font-bold text-emerald-600">
                          {formatCurrency(r.final_price - r.total_cost)}
                        </TableCell>
                      )}
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
