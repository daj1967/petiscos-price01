import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Package,
  Boxes,
  PackageCheck,
  Truck,
  ShoppingCart,
  Factory,
  ChefHat,
  Calculator,
  FileText,
  Settings,
} from 'lucide-react'
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
import logoImg from '../assets/petiscosdasgeraisfrota-30-x-30-cm-1-copia-2-061c7.png'

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Insumos', href: '/ingredients', icon: Package },
  { name: 'Produtos Base', href: '/base-products', icon: Boxes },
  { name: 'Produtos Finais', href: '/final-products', icon: PackageCheck },
  { name: 'Fornecedores', href: '/suppliers', icon: Truck },
  { name: 'Compras', href: '/purchases', icon: ShoppingCart },
  { name: 'Infraestrutura', href: '/infrastructure', icon: Factory },
  { name: 'Fichas Técnicas', href: '/recipes', icon: ChefHat },
  { name: 'Calculadora', href: '/calculator', icon: Calculator },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-lg text-primary hover:opacity-90 transition-opacity"
        >
          <img src={logoImg} alt="Petiscos das Gerais" className="w-8 h-8 object-contain" />
          <span className="truncate">Petiscos das Gerais</span>
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
        <div className="text-xs text-muted-foreground text-center">Petiscos das Gerais v1.0.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
