<script setup lang="ts">
import { computed } from 'vue'
import type { Employee } from '@/stores/employee.store'
import { extractEmployeePositions } from '@/helpers/employee-positions'

const props = defineProps<{
  isOpen: boolean
  employee: Employee | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const fullName = computed(() => {
  const p = props.employee?.person
  const name = [p?.firstname, p?.middlename, p?.lastname].filter(Boolean).join(' ')
  return name || (props.employee ? `Funcionário #${props.employee.id}` : '—')
})

const genderLabel = computed(() => {
  const g = props.employee?.person?.gender
  if (g === 'M') return 'Masculino'
  if (g === 'F') return 'Feminino'
  return g || '—'
})

const formattedBirthday = computed(() => {
  const raw = props.employee?.person?.birthday
  if (!raw) return '—'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return String(raw).slice(0, 10)
  return date.toLocaleDateString('pt-AO')
})

const positionsList = computed(() => extractEmployeePositions(props.employee))

const formatValue = (val?: string | number | null) => {
  if (val === null || val === undefined || String(val).trim() === '') return '—'
  return String(val)
}
</script>

<template>
  <div
    v-if="isOpen && employee"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
  >
    <div
      class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
    >
      <div
        class="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
          >
            <i class="fa-solid fa-id-card text-lg"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">{{ fullName }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Ficha completa do funcionário #{{ employee.id }}
            </p>
          </div>
        </div>
        <button
          @click="$emit('close')"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 text-slate-500 flex items-center justify-center transition-colors"
        >
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <div class="p-6 space-y-6 overflow-y-auto text-sm">
        <div class="space-y-3">
          <h4
            class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Dados Pessoais
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Nome Completo</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ fullName }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Data de Nascimento</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formattedBirthday }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Género</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ genderLabel }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Número do BI</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.bi_number) }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">NIF</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.nif) }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Telefone</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.phone) }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 sm:col-span-2">
              <span class="text-[11px] font-semibold text-slate-500 block">E-mail</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.email) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4
            class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Endereço
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Província</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.province) }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Município</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.municipality) }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Bairro</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.neighborhood) }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Rua</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.person?.street) }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4
            class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            Vínculo Institucional
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Departamento</span>
              <span class="font-medium text-slate-900 dark:text-white mt-0.5 block">{{ formatValue(employee.department?.name) }}</span>
            </div>
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
              <span class="text-[11px] font-semibold text-slate-500 block">Cargos</span>
              <div class="flex flex-wrap gap-1.5 mt-1.5" v-if="positionsList.length">
                <span
                  v-for="pos in positionsList"
                  :key="pos.id"
                  :class="
                    pos.is_primary
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  "
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                >
                  <i v-if="pos.is_primary" class="fa-solid fa-star text-[10px] text-indigo-500"></i>
                  <span>{{ pos.name }}</span>
                  <span class="text-[10px] opacity-75">
                    ({{ pos.is_primary ? 'Principal' : 'Secundário' }})
                  </span>
                </span>
              </div>
              <span v-else class="font-medium text-slate-400 mt-0.5 block">—</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60"
      >
        <button
          type="button"
          @click="$emit('close')"
          class="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>