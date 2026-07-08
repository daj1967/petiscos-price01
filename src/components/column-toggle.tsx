import { Columns3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

export interface ColumnConfig {
  key: string
  label: string
}

interface Props {
  columns: ColumnConfig[]
  visible: Record<string, boolean>
  onChange: (key: string, visible: boolean) => void
}

export function ColumnToggle({ columns, visible, onChange }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Columns3 className="mr-2 h-4 w-4" /> Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={visible[col.key] !== false}
            onCheckedChange={(v) => onChange(col.key, v === true)}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
