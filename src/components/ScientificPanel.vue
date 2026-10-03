<script setup>
defineProps({
  angleMode: { type: String, default: 'DEG' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['key', 'toggle-angle'])

/**
 * 科学计算按键。
 *
 * value 是写入表达式的文本，与后端文法一一对应：
 * 常量 pi / e，函数 sqrt( abs( ln( log( sin( cos( tan(，运算符 ^ 与后缀 !
 * 点击后只是把这段文字拼进表达式，真正的计算仍然全部由后端完成。
 */
const keys = [
  { label: 'π', value: 'pi' },
  { label: 'e', value: 'e' },
  { label: 'x²', value: '^2' },
  { label: 'xʸ', value: '^' },
  { label: '√', value: 'sqrt(' },
  { label: '|x|', value: 'abs(' },
  { label: 'ln', value: 'ln(' },
  { label: 'log', value: 'log(' },
  { label: 'sin', value: 'sin(' },
  { label: 'cos', value: 'cos(' },
  { label: 'tan', value: 'tan(' },
  { label: 'n!', value: '!' }
]
</script>

<template>
  <div class="sci-panel">
    <div class="sci-header">
      <span class="sci-title">科学计算</span>
      <button
        class="angle-toggle"
        type="button"
        :disabled="disabled"
        :title="
          angleMode === 'DEG'
            ? '三角函数按角度制计算，点击切换为弧度制'
            : '三角函数按弧度制计算，点击切换为角度制'
        "
        @click="$emit('toggle-angle')"
      >
        {{ angleMode }}
      </button>
    </div>

    <div class="sci-grid">
      <button
        v-for="item in keys"
        :key="item.label"
        type="button"
        class="key key-sci"
        :disabled="disabled"
        @click="$emit('key', item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
