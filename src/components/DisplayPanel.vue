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
    <div class="display-expression">{{ expression }}</div>

    <!-- 错误信息：内容来自后端返回的 message -->
    <div v-if="errorMessage" class="display-error">{{ errorMessage }}</div>

    <!-- 计算结果：完全由后端返回，前端不做任何运算 -->
    <div v-else-if="result" class="display-result">= {{ result }}</div>

    <div v-else-if="loading" class="display-hint">计算中…</div>
  </div>
</template>
