<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: null }
})

/** 运算符展示成界面上的符号，空数据显示占位符。 */
const operatorLabel = computed(() => {
  const map = { '+': '+', '-': '−', '*': '×', '/': '÷' }
  return props.stats?.topOperator ? (map[props.stats.topOperator] ?? props.stats.topOperator) : '—'
})

const averageLabel = computed(() => {
  const value = props.stats?.averageResult
  if (value === null || value === undefined) return '—'
  // 平均结果最多展示 4 位小数，去掉多余的尾随零
  const num = Number(value)
  return Number.isFinite(num) ? String(Number(num.toFixed(4))) : value
})
</script>

<template>
  <section class="card">
    <h2 class="card-title">计算统计</h2>
    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">{{ stats?.total ?? 0 }}</div>
        <div class="stat-label">计算次数</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ operatorLabel }}</div>
        <div class="stat-label">最常用运算符</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ averageLabel }}</div>
        <div class="stat-label">平均结果</div>
      </div>
    </div>
    <p v-if="stats?.latestAt" class="stats-footnote">最近一次计算：{{ stats.latestAt }}</p>
  </section>
</template>
