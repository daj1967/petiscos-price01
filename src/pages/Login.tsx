import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import logoImg from '../assets/petiscosdasgeraisfrota-30-x-30-cm-1-copia-2-061c7.png'

export default function Login() {
  const { isAuthenticated, loading, login } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo de volta ao sistema!',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar',
        description: err instanceof Error ? err.message : 'Credenciais inválidas.',
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex flex-1 relative bg-secondary">
        <img
          src="https://img.usecurling.com/p/800/1200?q=bakery%20production&color=black&dpr=2"
          alt="Produção de alimentos"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent z-10" />
        <div className="z-20 flex flex-col justify-end p-12 text-white h-full max-w-2xl">
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Ajudando indústrias de alimentos a crescer.
          </h1>
          <p className="text-lg text-white/90">
            Precificação inteligente para o varejo, controlando margens, custos e impostos com
            precisão de centavos.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src={logoImg}
              alt="Petiscos das Gerais"
              className="w-32 h-32 mb-4 object-contain"
            />
            <h1 className="text-2xl font-bold text-foreground">Petiscos das Gerais</h1>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
              <CardDescription>Entre com suas credenciais para acessar o painel.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Não tem conta?{' '}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  Criar conta
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
