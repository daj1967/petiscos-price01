import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import Products from './pages/Products'
import Calculator from './pages/Calculator'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import { AuthContext } from './hooks/use-auth'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const authValue = useMemo(
    () => ({
      isAuthenticated,
      login: () => setIsAuthenticated(true),
      logout: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
  )

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
