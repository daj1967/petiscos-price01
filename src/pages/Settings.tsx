import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalculationsManager } from '@/components/settings/calculations-manager'
import { IngredientsManager } from '@/components/settings/ingredients-manager'
import { UsersManager } from '@/components/settings/users-manager'

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Configurações</h2>
        <p className="text-muted-foreground">Gerencie fichas técnicas, ingredientes e usuários.</p>
      </div>
      <Tabs defaultValue="recipes">
        <TabsList>
          <TabsTrigger value="recipes">Fichas Técnicas</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="recipes">
          <CalculationsManager />
        </TabsContent>
        <TabsContent value="ingredients">
          <IngredientsManager />
        </TabsContent>
        <TabsContent value="users">
          <UsersManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
