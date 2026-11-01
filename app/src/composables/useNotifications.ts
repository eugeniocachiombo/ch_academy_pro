import { ref } from 'vue'

export interface AppNotification {
  icon: string
  color: string
  title: string
  text: string
  time: string
}

const notifications: AppNotification[] = [
  { icon: 'fa-user-plus', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', title: 'Nova matrícula realizada', text: 'Matheus Lima entrou no 9º Ano B.', time: 'Há 5 minutos' },
  { icon: 'fa-file-invoice-dollar', color: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400', title: 'Mensalidade Paga', text: 'Boleto #4921 quitado via PIX.', time: 'Há 22 minutos' },
  { icon: 'fa-triangle-exclamation', color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', title: 'Alerta de Frequência', text: 'Turma 6º Ano A com baixa presença.', time: 'Há 1 hora' },
]
const unread = ref(notifications.length)

export function useNotifications() {
  const markAllRead = () => { unread.value = 0 }
  return { notifications, unread, markAllRead }
}