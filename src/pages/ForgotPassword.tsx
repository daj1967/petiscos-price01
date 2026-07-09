import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import logoImg from '../assets/petiscosdasgeraisfrota-30-x-30-cm-1-copia-2-061c7.png'

export default function ForgotPassword() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await pb.collection('users').requestPasswordReset(email)
    } catch {
      // Silently handle — don't reveal whether the email exists
    }
    setIsSubmitted(true)
    setIsLoading(false)
    toast({
      title: 'Solicitação enviada',
      description:
        'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
    })
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
          <h1 className="text-4xl font-bold mb-4 leading-tight">Recupere seu acesso.</h1>
          <p className="text-lg text-white/90">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
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
              <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
              <CardDescription>
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              {isSubmitted ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center space-y-3 py-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <MailCheck className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Se o e-mail estiver cadastrado, você receberá um link para redefinir sua
                      senha.
                    </p>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o login
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetRequest} className="space-y-4">
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                      </>
                    ) : (
                      'Enviar link de recuperação'
                    )}
                  </Button>
                </form>
              )}
              {!isSubmitted && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Lembrou a senha?{' '}
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Entrar
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
