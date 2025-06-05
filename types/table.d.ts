import { FormularioUI } from "./database.types"

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    handleFormularioSelect?: (formulario: FormularioUI) => void
    handleRefreshData?: () => void
  }
}