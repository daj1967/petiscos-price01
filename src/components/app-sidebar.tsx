import { Link, useLocation } from 'react-router-dom'
import { Home, Package, Calculator, Store, Settings, ChefHat } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Produtos', href: '/products', icon: Package },
  { name: 'Calculadora', href: '/calculator', icon: Calculator },
  { name: 'Canais Varejo', href: '#', icon: Store },
  { name: 'Configurações', href: '#', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ChefHat className="w-6 h-6" />
          <span>FoodPrice</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3',
                          isActive && 'font-semibold text-primary',
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">FoodPrice v0.0.1</div>
      </SidebarFooter>
    </Sidebar>
  )
}
