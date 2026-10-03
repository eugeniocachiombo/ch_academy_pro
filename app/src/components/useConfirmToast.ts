import { useToast } from 'primevue/usetoast'

interface ConfirmOptions {
  summary: string
  detail: string
  onAccept: () => void | Promise<void>
  onReject?: () => void
}

export function useConfirmToast(group = 'confirm') {
  const toast = useToast()

  let acceptCallback: ConfirmOptions['onAccept'] | null = null
  let rejectCallback: ConfirmOptions['onReject'] | null = null

  const clear = () => {
    toast.removeGroup(group)
    acceptCallback = null
    rejectCallback = null
  }

  const confirm = (options: ConfirmOptions) => {
    // Evita toasts de confirmação duplicados
    toast.removeGroup(group)

    acceptCallback = options.onAccept
    rejectCallback = options.onReject ?? null

    toast.add({
      group,
      severity: 'warn',
      summary: options.summary,
      detail: options.detail,
      sticky: true,
      closable: false,
    })
  }

  const accept = async () => {
    const callback = acceptCallback
    clear()
    await callback?.()
  }

  const reject = () => {
    const callback = rejectCallback
    clear()
    callback?.()
  }

  return { group, confirm, accept, reject }
}