<template>
    <div>
      <v-dialog v-if="!isMobile" v-model="isOpen" :max-width="maxWidth">
        <v-card>
          <slot></slot>
        </v-card>
      </v-dialog>
  
      <v-bottom-sheet v-else v-model="isOpen" :minHeight="'80%'">
        <v-sheet class="pa-4">
          <slot></slot>
        </v-sheet>
      </v-bottom-sheet>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useDisplay } from 'vuetify'
  
  const props = defineProps({
    modelValue: { type: Boolean, required: true },
    maxWidth: { type: [String, Number], default: 500 }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const isOpen = computed({
    get: () => props.modelValue,
    set: (val: boolean) => emit('update:modelValue', val)
  })
  
  const { smAndDown } = useDisplay()
  const isMobile = computed(() => smAndDown.value)
  </script>
  