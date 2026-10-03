<script setup>
defineProps({
  expression: { type: String, default: '' },
  result: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})
</script>

<template>
  <div class="display">
    <div
      class="display-expression"
      :class="{ 'is-placeholder': !expression }"
    >
      {{ expression || '请输入表达式，例如 (1+2)*3' }}
    </div>

    <!-- 错误提示：内容来自后端返回的 message -->
    <div v-if="errorMessage" class="display-error">{{ errorMessage }}</div>

    <!-- 计算结果：完全由后端返回，前端不做任何运算 -->
    <div v-else-if="result" class="display-result">= {{ result }}</div>

    <div v-else class="display-hint">
      {{ loading ? '后端计算中…' : '结果由后端计算并返回' }}
    </div>
  </div>
</template>
