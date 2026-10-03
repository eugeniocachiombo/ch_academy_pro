<script setup lang="ts">
import Toast from 'primevue/toast'
import Button from 'primevue/button'

withDefaults(
  defineProps<{
    group?: string
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  {
    group: 'confirm',
    confirmLabel: 'Sim, eliminar',
    cancelLabel: 'Não',
  }
)

const emit = defineEmits<{
  (e: 'accept'): void
  (e: 'reject'): void
}>()

const pt = {
  root: { class: '!w-[26rem] !max-w-[92vw]' },
  message: {
    class:
      '!bg-white dark:!bg-slate-900 !border !border-slate-200 dark:!border-slate-800 !border-l-4 !border-l-amber-500 !rounded-2xl !shadow-xl !backdrop-blur-none',
  },
  messageContent: { class: '!p-5 !w-full' },
  buttonContainer: { class: '!hidden' },
}
</script>

<template>
  <Toast :group="group" position="center" :pt="pt">
    <template #message="{ message }">
      <div class="flex flex-col gap-4 w-full">
        <div class="flex items-start gap-3">
          <i class="fa-solid fa-triangle-exclamation text-amber-500 text-xl mt-0.5"></i>
          <div>
            <p class="font-semibold text-sm text-slate-900 dark:text-white">
              {{ message.summary }}
            </p>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {{ message.detail }}
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button
            :label="cancelLabel"
            size="small"
            severity="secondary"
            outlined
            @click="emit('reject')"
          />
          <Button :label="confirmLabel" size="small" severity="danger" @click="emit('accept')" />
        </div>
      </div>
    </template>
  </Toast>
</template>