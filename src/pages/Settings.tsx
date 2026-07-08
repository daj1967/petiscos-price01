import { Users, Package, FileText } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { UsersManager } from '@/components/settings/users-manager'
import { IngredientsManager } from '@/components/settings/ingredients-manager'
import { CalculationsManager } from '@/components/settings/calculations-manager'

export default function Settings() {
  const { isAdmin } = useAuth()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Configurações</h2>
        <p className="text-muted-foreground">Gerencie usuários, ingredientes e fichas técnicas.</p>
      </div>

      <Tabs defaultValue="ingredients">
        <TabsList>
          {isAdmin && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Usuários
            </TabsTrigger>
          )}
          <TabsTrigger value="ingredients" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Ingredientes
          </TabsTrigger>
          <TabsTrigger value="calculations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Produtos &amp; Fichas
          </TabsTrigger>{' '}
        </TabsList>
        {isAdmin && (
          <TabsContent value="users">
            <UsersManager />
          </TabsContent>
        )}
        <TabsContent value="ingredients">
          <IngredientsManager />
        </TabsContent>
        <TabsContent value="calculations">
          <CalculationsManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
