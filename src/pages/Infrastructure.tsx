import { Factory } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductionAssetsManager } from '@/components/settings/production-assets-manager'
import { LaborRatesManager } from '@/components/settings/labor-rates-manager'
import { UnitsManager } from '@/components/settings/units-manager'

export default function Infrastructure() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <Factory className="h-6 w-6 text-primary" /> Infraestrutura
        </h2>
        <p className="text-muted-foreground">
          Ativos de produção, mão de obra e unidades de medida.
        </p>
      </div>
      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Ativos de Produção</TabsTrigger>
          <TabsTrigger value="labor">Mão de Obra</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
        </TabsList>
        <TabsContent value="assets">
          <ProductionAssetsManager />
        </TabsContent>
        <TabsContent value="labor">
          <LaborRatesManager />
        </TabsContent>
        <TabsContent value="units">
          <UnitsManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
