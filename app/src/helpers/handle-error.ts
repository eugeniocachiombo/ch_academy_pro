export type FieldErrors = Record<string, string[]>

export interface ParsedError {
  message: string
  fieldErrors: FieldErrors
  status?: number
}

export function handleError(err: any, fallback = 'Ocorreu um erro inesperado.'): ParsedError {
  const errorResponse = err?.response?.data ?? err?.data ?? err?.body ?? err

  const message = errorResponse?.message || err?.message || fallback
  const status = err?.response?.status ?? err?.status

  const fieldErrors: FieldErrors = {}
  const rawErrors = errorResponse?.errors || err?.errors

  if (rawErrors && typeof rawErrors === 'object') {
    for (const [field, value] of Object.entries(rawErrors)) {
      fieldErrors[field] = Array.isArray(value) ? value.map(String) : [String(value)]
    }
  }

  return { message, fieldErrors, status }
}