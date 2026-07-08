import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function DatabaseNotice() {
  return (
    <Alert className="border-accent/30 bg-accent/5">
      <AlertCircle className="h-4 w-4 text-accent" />
      <AlertTitle className="text-sm font-semibold text-accent">Dados de Demonstração</AlertTitle>
      <AlertDescription className="text-xs">
        Os dados exibidos são fictícios. Para persistir produtos e cálculos reais, conecte um banco
        de dados (Supabase ou Skip Cloud) pelo botão de integração no cabeçalho e importe os dados
        do arquivo Excel.
      </AlertDescription>
    </Alert>
  )
}
