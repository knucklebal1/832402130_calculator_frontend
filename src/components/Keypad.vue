<script setup>
defineProps({
  disabled: { type: Boolean, default: false }
})

defineEmits(['key'])

/**
 * 键盘布局。
 * value 是按键实际写入表达式的内容，界面显示用 label。
 * 前端只负责拼接字符串，不做任何运算。
 */
const keys = [
  { label: 'AC', value: 'AC', kind: 'function' },
  { label: '⌫', value: 'BACK', kind: 'function' },
  { label: '(', value: '(', kind: 'function' },
  { label: ')', value: ')', kind: 'function' },

  { label: '7', value: '7', kind: 'digit' },
  { label: '8', value: '8', kind: 'digit' },
  { label: '9', value: '9', kind: 'digit' },
  { label: '÷', value: '/', kind: 'operator' },

  { label: '4', value: '4', kind: 'digit' },
  { label: '5', value: '5', kind: 'digit' },
  { label: '6', value: '6', kind: 'digit' },
  { label: '×', value: '*', kind: 'operator' },

  { label: '1', value: '1', kind: 'digit' },
  { label: '2', value: '2', kind: 'digit' },
  { label: '3', value: '3', kind: 'digit' },
  { label: '−', value: '-', kind: 'operator' },

  { label: '%', value: '%', kind: 'function' },
  { label: '0', value: '0', kind: 'digit' },
  { label: '.', value: '.', kind: 'digit' },
  { label: '+', value: '+', kind: 'operator' }
]
</script>

<template>
  <div class="keypad">
    <button
      v-for="key in keys"
      :key="key.label"
      type="button"
      class="key"
      :class="{
        'key-function': key.kind === 'function',
        'key-operator': key.kind === 'operator'
      }"
      :disabled="disabled"
      @click="$emit('key', key.value)"
    >
      {{ key.label }}
    </button>

    <button type="button" class="key key-equals" :disabled="disabled" @click="$emit('key', '=')">
      =
    </button>
  </div>
</template>
