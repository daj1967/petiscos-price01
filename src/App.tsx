import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import Ingredients from './pages/Ingredients'
import BaseProducts from './pages/BaseProducts'
import FinalProducts from './pages/FinalProducts'
import Suppliers from './pages/Suppliers'
import Purchases from './pages/Purchases'
import Infrastructure from './pages/Infrastructure'
import Calculator from './pages/Calculator'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/base-products" element={<BaseProducts />} />
              <Route path="/final-products" element={<FinalProducts />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/infrastructure" element={<Infrastructure />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
