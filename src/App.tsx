import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Products from './pages/Products'
import Calculator from './pages/Calculator'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import Reports from './pages/Reports'
import { AuthContext } from './hooks/use-auth'
import {
  getStoredUser,
  loginWithPassword,
  signUp,
  clearSession,
  type SkipCloudUser,
} from '@/lib/skip-cloud'

const App = () => {
  const [user, setUser] = useState<SkipCloudUser | null>(() => getStoredUser())

  const authValue = useMemo(
    () => ({
      isAuthenticated: !!user,
      user,
      login: async (email: string, password: string) => {
        const u = await loginWithPassword(email, password)
        setUser(u)
      },
      signup: async (email: string, password: string, name?: string) => {
        const u = await signUp(email, password, name)
        setUser(u)
      },
      logout: () => {
        clearSession()
        setUser(null)
      },
    }),
    [user],
  )

  return (
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
